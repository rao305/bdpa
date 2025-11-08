'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { seedRoles } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScoreRing } from '@/components/results/score-ring';
import VisualScoringDashboard from '@/components/results/visual-scoring-dashboard';
import { Loader2, ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [role, setRole] = useState<any>(null);

  useEffect(() => {
    loadAnalysis();
  }, [params.id]);

  const loadAnalysis = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    const { data } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', params.id)
      .eq('uid', user.id)
      .maybeSingle();

    if (!data) {
      router.push('/analyze');
      return;
    }

    setAnalysis(data);
    const foundRole = seedRoles.find((r) => r.id === data.role_id);
    setRole(foundRole);
    setLoading(false);
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return { text: 'Ready', variant: 'default' as const };
    if (score >= 60) return { text: 'Almost Ready', variant: 'secondary' as const };
    if (score >= 40) return { text: 'Building', variant: 'outline' as const };
    return { text: 'Getting Started', variant: 'outline' as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analysis) return null;

  const readinessLabel = getReadinessLabel(analysis.readiness_overall);
  
  // Check if we have the new detailed analysis data
  const hasDetailedAnalysis = analysis.meta?.detailedScores && analysis.meta?.actionableRecommendations;
  
  if (hasDetailedAnalysis) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Button>

        <VisualScoringDashboard
          scores={analysis.meta.detailedScores}
          strengths={analysis.meta.detailedStrengths}
          improvements={analysis.meta.detailedImprovements}
          recommendations={analysis.meta.actionableRecommendations}
          roleTitle={analysis.jd_title}
          confidenceLevel={analysis.meta.confidenceScore}
        />

        <div className="mt-8 flex gap-4">
          <Button onClick={() => router.push('/analyze')} variant="outline">
            New Analysis
          </Button>
          <Button onClick={() => router.push('/learn')}>
            View Learning Hub
          </Button>
        </div>
      </div>
    );
  }

  // Fallback to original layout for older analyses
  const overall = Math.round(
    (analysis.subscores.alignment * 0.35 +
      analysis.readiness_overall * 0.25 +
      analysis.subscores.impact * 0.2 +
      analysis.subscores.potential * 0.2) || 0
  );

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Dashboard
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{analysis.jd_title}</h1>
          <Badge {...readinessLabel}>{readinessLabel.text}</Badge>
        </div>
        <p className="text-muted-foreground">
          {role?.title} Analysis from {new Date(analysis.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <ScoreRing score={overall} size="lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Alignment</CardTitle>
            <CardDescription>Keyword match with JD</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ScoreRing score={analysis.subscores.alignment} size="sm" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Readiness</CardTitle>
            <CardDescription>Required skills met</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ScoreRing score={analysis.readiness_overall} size="sm" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Impact</CardTitle>
            <CardDescription>Project achievements</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ScoreRing score={analysis.subscores.impact} size="sm" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Potential</CardTitle>
            <CardDescription>Growth trajectory</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ScoreRing score={analysis.subscores.potential} size="sm" />
          </CardContent>
        </Card>

        {analysis.subscores.ats > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ATS Score</CardTitle>
              <CardDescription>Resume formatting</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ScoreRing score={analysis.subscores.ats} size="sm" />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {analysis.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((strength: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {analysis.improvements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground mt-0.5">•</span>
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {analysis.missing_skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing Skills & Resources</CardTitle>
            <CardDescription>
              Prioritized skills to learn based on the role requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.missing_skills.map((ms: any, i: number) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium capitalize">{ms.skill}</h3>
                      <Badge variant={ms.priority === 'required' ? 'destructive' : 'secondary'}>
                        {ms.priority}
                      </Badge>
                    </div>
                  </div>
                  {ms.resources && ms.resources.length > 0 && (
                    <div className="space-y-1 ml-4">
                      {ms.resources.map((resource: any, j: number) => (
                        <a
                          key={j}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {resource.title}
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex gap-4">
        <Button onClick={() => router.push('/analyze')} variant="outline">
          New Analysis
        </Button>
        <Button onClick={() => router.push('/learn')}>
          View Learning Hub
        </Button>
      </div>
    </div>
  );
}
