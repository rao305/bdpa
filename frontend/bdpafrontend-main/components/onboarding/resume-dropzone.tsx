'use client';

import { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

interface ResumeDropzoneProps {
  onTextExtracted: (text: string) => void;
}

export function ResumeDropzone({ onTextExtracted }: ResumeDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const extractText = useCallback(async (file: File) => {
    setExtracting(true);
    try {
      // Upload file to API for proper PDF parsing
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received. Status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        console.error('Response body (first 500 chars):', text.substring(0, 500));
        throw new Error(`Server returned an invalid response (${response.status}). Please check the console for details.`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data.error || data.message || 'Failed to upload and parse PDF');
      }
      
      if (data.text && data.text.length >= 50) {
        onTextExtracted(data.text);
      } else {
        throw new Error('Could not extract sufficient text from PDF');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      alert(error instanceof Error ? error.message : 'Failed to parse PDF. Please try again or enter skills manually.');
      setExtracting(false);
    } finally {
      setExtracting(false);
    }
  }, [onTextExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      extractText(file);
    }
  }, [extractText]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      extractText(file);
    }
  }, [extractText]);

  return (
    <Card
      className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('resume-input')?.click()}
    >
      <input
        id="resume-input"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileInput}
      />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium mb-2">
        {extracting ? 'Extracting text...' : 'Drop your resume here'}
      </p>
      <p className="text-sm text-muted-foreground">
        or click to browse (PDF only)
      </p>
    </Card>
  );
}
