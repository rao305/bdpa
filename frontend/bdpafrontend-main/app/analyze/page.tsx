'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { seedRoles } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [roleId, setRoleId] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [jdText, setJdText] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Use API endpoint instead of direct Supabase query
      const response = await fetch('/api/profile');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth');
          return;
        }
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      const profileData = data.profile;

      if (!profileData) {
        router.push('/onboarding');
        return;
      }

      // Check if first_time is still true (shouldn't happen after onboarding, but check anyway)
      if (profileData.first_time) {
        router.push('/onboarding');
        return;
      }

      setProfile(profileData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile. Please try again.');
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!roleId || !jdTitle || !jdText || !profile) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role_id: roleId,
          jd_title: jdTitle,
          jd_text: jdText,
          resume_text: profile.resume_text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (data.success && data.analysis_id) {
        router.push(`/results/${data.analysis_id}`);
      } else {
        throw new Error('Analysis completed but no ID returned');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analyze a Role</h1>
        <p className="text-muted-foreground">
          Select a role and paste the job description to see your fit
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Role</CardTitle>
            <CardDescription>Choose the type of role you're targeting</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {seedRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.title} ({role.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Enter the job title and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jd-title">Job Title</Label>
              <Input
                id="jd-title"
                placeholder="e.g., Machine Learning Engineer Intern"
                value={jdTitle}
                onChange={(e) => setJdTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jd-text">Job Description</Label>
              <Textarea
                id="jd-text"
                placeholder="Paste the full job description here..."
                className="min-h-[300px] font-mono text-sm"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!roleId || !jdTitle || !jdText || analyzing}
          size="lg"
          className="w-full"
        >
          {analyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Analyze Fit
        </Button>
      </div>
    </div>
  );
}
