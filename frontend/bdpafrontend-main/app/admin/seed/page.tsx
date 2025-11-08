'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { seedRoles, seedResources } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database } from 'lucide-react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Successfully seeded ${data.counts.roles} roles and ${data.counts.resources} resources!` 
        });
      } else {
        setResult({ success: false, message: data.error || 'Seeding failed' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Network error during seeding' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Seed Tool
          </CardTitle>
          <CardDescription>
            Populate the database with roles and resources for development and demo purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">This will seed:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>7 predefined roles (ML Engineer, Data Scientist, etc.)</li>
              <li>30+ learning resources mapped to skills</li>
            </ul>
          </div>

          <Button onClick={handleSeed} disabled={loading} size="lg" className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Seed Database
          </Button>

          {result && (
            <Alert className={result.success ? 'border-green-500' : 'border-destructive'}>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
