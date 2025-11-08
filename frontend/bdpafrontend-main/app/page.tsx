'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, BookOpen, BarChart3 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_time')
        .eq('uid', user.id)
        .maybeSingle();

      if (profile?.first_time) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } else {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-sm font-medium text-primary">Skills Gap Analysis Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            See Your Gap.<br />Fix Your Gap.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Analyze your resume against job descriptions, discover missing skills, and get a personalized learning roadmap to land your dream role.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/auth')} className="text-lg px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/auth')} className="text-lg px-8">
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Analyze Fit</h3>
              <p className="text-sm text-muted-foreground">
                Upload your resume or enter skills manually to see how you match against any job description
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="rounded-full bg-green-500/10 w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Get Scored</h3>
              <p className="text-sm text-muted-foreground">
                Receive detailed scores for alignment, readiness, impact, and potential across multiple dimensions
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="rounded-full bg-amber-500/10 w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Learn & Grow</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized learning resources and a 14-day plan to fill your skill gaps effectively
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-500/10 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your improvement over time with comprehensive analytics and trend visualization
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card border rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to identify and bridge your skills gap
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="rounded-full bg-primary w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Build Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                Upload your resume or manually enter your skills, coursework, and experience
              </p>
            </div>

            <div className="text-center">
              <div className="rounded-full bg-primary w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Analyze a Role</h3>
              <p className="text-sm text-muted-foreground">
                Select a target role and paste the job description to see your fit score
              </p>
            </div>

            <div className="text-center">
              <div className="rounded-full bg-primary w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Close the Gap</h3>
              <p className="text-sm text-muted-foreground">
                Follow your personalized learning plan with curated resources for each missing skill
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Ready to close your skills gap?</h2>
          <Button size="lg" onClick={() => router.push('/auth')} className="text-lg px-8">
            Start Now
          </Button>
        </div>

        <div className="text-center mt-16 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Built for students and professionals seeking their next opportunity
          </p>
        </div>
      </div>
    </div>
  );
}
