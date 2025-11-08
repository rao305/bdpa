import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/server-auth';
import { serverStorage } from '@/lib/server-storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
    }

    try {
      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Dynamically import pdf-parse only on server side to avoid client-side bundling issues
      const { PDFParse } = await import('pdf-parse');
      
      // Create PDF parser instance with the buffer
      const parser = new PDFParse({ data: buffer });
      
      // Extract text from PDF
      const textResult = await parser.getText();
      let extractedText = textResult.text || '';
      
      // Clean up parser
      await parser.destroy();
      
      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
        .trim();
      
      // Validate that we got meaningful text
      if (!extractedText || extractedText.length < 50) {
        return NextResponse.json(
          { error: 'Could not extract sufficient text from PDF. Please ensure the PDF contains readable text (not just images).' }, 
          { status: 400 }
        );
      }

      // Update user profile with resume text
      const profile = await serverStorage.getProfile(user.id);
      if (profile) {
        await serverStorage.saveProfile({
          ...profile,
          resume_text: extractedText,
          updated_at: new Date().toISOString(),
        });
      } else {
        return NextResponse.json(
          { error: 'User profile not found. Please complete onboarding first.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        text: extractedText,
        message: 'Resume uploaded and parsed successfully',
        textLength: extractedText.length
      });

    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      return NextResponse.json(
        { error: `Failed to parse PDF file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
