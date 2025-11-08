import { NextRequest, NextResponse } from 'next/server';
import { parseResumeText } from '@/lib/resume-parser';
import { normalizeSkills } from '@/lib/normalization';
import { buildDictionary } from '@/lib/normalization';
import { seedRoles, seedResources } from '@/lib/seed-data';

export async function POST(request: NextRequest) {
  try {
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('FormData error:', formError);
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
    }
    
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
      let extractedText = '';
      try {
        // pdf-parse v2 uses PDFParse class, not a function
        let PDFParse: any;
        try {
          const pdfParseModule = await import('pdf-parse');
          // v2 exports PDFParse as a named export
          PDFParse = pdfParseModule.PDFParse;
        } catch (importError) {
          // Fallback to require for CommonJS
          const pdfParseModule = require('pdf-parse');
          PDFParse = pdfParseModule.PDFParse;
        }
        
        // pdf-parse v2 API: new PDFParse({ buffer: ... })
        if (!PDFParse || typeof PDFParse !== 'function') {
          console.error('PDFParse class not found:', typeof PDFParse);
          console.error('pdf-parse module keys:', Object.keys(PDFParse || {}));
          return NextResponse.json(
            { error: 'PDF parsing library error. Please contact support.' }, 
            { status: 500 }
          );
        }
        
        // Use v2 API: create parser instance with data (not buffer)
        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        extractedText = result?.text || '';
        
        // Clean up parser resources
        await parser.destroy();
        
        // Clean up the extracted text
        extractedText = extractedText
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
          .trim();
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        console.error('PDF error stack:', pdfError instanceof Error ? pdfError.stack : String(pdfError));
        const errorMessage = pdfError instanceof Error ? pdfError.message : String(pdfError);
        return NextResponse.json(
          { error: `Failed to parse PDF file: ${errorMessage}` }, 
          { status: 500 }
        );
      }
      
      // Validate that we got meaningful text
      if (!extractedText || extractedText.length < 50) {
        return NextResponse.json(
          { error: 'Could not extract sufficient text from PDF. Please ensure the PDF contains readable text (not just images).' }, 
          { status: 400 }
        );
      }

      // Parse resume to extract structured data
      let parsedData = null;
      try {
        const dictionary = buildDictionary(seedRoles, seedResources);
        parsedData = parseResumeText(extractedText, dictionary);
        
        // Normalize skills
        const normalizedSkills = normalizeSkills(parsedData.skills);
        
        console.log('📄 Resume parsed successfully:', {
          skillsCount: normalizedSkills.length,
          courseworkCount: parsedData.coursework.length,
          experienceCount: parsedData.experience.length,
          major: parsedData.education.major,
          year: parsedData.education.year,
          targetCategory: parsedData.targetCategory,
        });
      } catch (parseError) {
        console.error('Resume parsing error:', parseError);
        console.error('Parse error stack:', parseError instanceof Error ? parseError.stack : String(parseError));
        // Continue even if parsing fails - we'll still return the text
      }

      return NextResponse.json({
        success: true,
        text: extractedText,
        parsed: parsedData ? {
          skills: normalizeSkills(parsedData.skills),
          coursework: parsedData.coursework,
          experience: parsedData.experience,
          education: parsedData.education,
          targetCategory: parsedData.targetCategory,
        } : null,
        message: 'Resume uploaded and parsed successfully',
        textLength: extractedText.length
      });

    } catch (parseError) {
      console.error('Upload processing error:', parseError);
      return NextResponse.json(
        { error: `Failed to process upload: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload error:', error);
    console.error('Upload error details:', error instanceof Error ? error.stack : String(error));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
