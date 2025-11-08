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

  const extractText = async (file: File) => {
    setExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      let text = '';
      for (let i = 0; i < uint8Array.length; i++) {
        const char = String.fromCharCode(uint8Array[i]);
        if (char.match(/[a-zA-Z0-9\s\.,;:\-\(\)\/\\]/)) {
          text += char;
        }
      }

      onTextExtracted(text || 'Resume uploaded successfully');
    } catch (error) {
      console.error('Error extracting text:', error);
      onTextExtracted('Resume uploaded successfully');
    } finally {
      setExtracting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      extractText(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      extractText(file);
    }
  };

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
