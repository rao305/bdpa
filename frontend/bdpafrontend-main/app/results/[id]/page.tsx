'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { seedRoles } from '@/lib/seed-data';
import { normalizeSkill } from '@/lib/normalization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScoreRing } from '@/components/results/score-ring';
import VisualScoringDashboard from '@/components/results/visual-scoring-dashboard';
import { Loader2, ArrowLeft, ExternalLink, CheckCircle2, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'resources' | 'market'>('resources');
  const [marketData, setMarketData] = useState<Record<string, number>>({});

  useEffect(() => {
    loadAnalysis();
    loadMarketData();
  }, [params.id]);

  const loadMarketData = async () => {
    try {
      const response = await fetch('/api/market-data');
      if (response.ok) {
        const data = await response.json();
        setMarketData(data.marketData || {});
      }
    } catch (error) {
      console.warn('Could not load market data:', error);
    }
  };

  const loadAnalysis = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Use API endpoint instead of direct Supabase query
      const response = await fetch(`/api/analyses/${params.id}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth');
          return;
        }
        if (response.status === 404) {
          router.push('/analyze');
          return;
        }
        throw new Error('Failed to load analysis');
      }

      const data = await response.json();
      const analysisData = data.analysis;

      if (!analysisData) {
        router.push('/analyze');
        return;
      }

      setAnalysis(analysisData);
      const foundRole = seedRoles.find((r) => r.id === analysisData.role_id);
      setRole(foundRole);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analysis:', error);
      router.push('/analyze');
    }
  };

  // Helper function to get market demand with fallback and mock data
  const getMarketDemand = (skill: string): number => {
    if (!skill) return 0;
    
    // Normalize the skill using the normalization function
    const normalizedSkill = normalizeSkill(skill);
    
    // First try to get from market analysis explanations
    const marketExplanation = analysis?.meta?.market_analysis?.explanations?.find(
      (exp: any) => normalizeSkill(exp.skill) === normalizedSkill
    );
    if (marketExplanation?.marketDemand && marketExplanation.marketDemand > 0) {
      return marketExplanation.marketDemand;
    }
    
    // Fallback to direct market data lookup with normalized skill
    if (marketData[normalizedSkill]) {
      return marketData[normalizedSkill];
    }
    
    // Try variations of the skill name
    const variations = [
      normalizedSkill,
      normalizedSkill.replace(/\s+/g, '-'),
      normalizedSkill.replace(/\s+/g, ''),
      normalizedSkill.replace(/-/g, ' '),
      skill.toLowerCase().trim(), // Original lowercase
    ];
    
    for (const variation of variations) {
      if (marketData[variation]) {
        return marketData[variation];
      }
    }
    
    // Try checking all market data keys for partial matches (for skills like "machine learning basics")
    const skillWords = normalizedSkill.split(/\s+/);
    if (skillWords.length > 1) {
      // Try matching the main skill (e.g., "machine learning" from "machine learning basics")
      for (const key in marketData) {
        if (normalizedSkill.includes(key) || key.includes(normalizedSkill)) {
          return marketData[key];
        }
      }
    }
    
    // Mock market data for common skills when real data is not available
    const mockMarketData: Record<string, number> = {
      'python': 15000,
      'javascript': 12000,
      'react': 8500,
      'sql': 10000,
      'git': 8000,
      'machine learning': 6000,
      'c++': 5000,
      'java': 7000,
      'docker': 4000,
      'aws': 5500,
      'excel': 9000,
      'tableau': 3000,
      'power bi': 2500,
      'html': 11000,
      'css': 10000,
      'typescript': 4500,
      'node.js': 6000,
      'linux': 5000,
      'mathematics': 4000,
      'statistics': 3500,
      'pandas': 3000,
      'numpy': 2500,
      'scikit-learn': 2000,
      'ros': 1500,
      'embedded systems': 2000,
      'unity': 3000,
      'c#': 4000,
    };
    
    // Check mock data with normalized skill
    const mockKey = Object.keys(mockMarketData).find(key => 
      normalizedSkill.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedSkill)
    );
    
    if (mockKey) {
      return mockMarketData[mockKey];
    }
    
    return 0;
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
  // Calculate overall score dynamically (matching scoring.ts formula)
  // If resume provided: 35% alignment + 25% readiness + 15% ATS + 15% impact + 10% polish
  // If no resume: 50% alignment + 30% readiness + 20% impact
  const hasResume = analysis.subscores.ats > 0;
  const overall = hasResume
    ? Math.round(
        analysis.subscores.alignment * 0.35 +
        analysis.readiness_overall * 0.25 +
        analysis.subscores.ats * 0.15 +
        analysis.subscores.impact * 0.15 +
        (analysis.subscores.polish || 0) * 0.1
      )
    : Math.round(
        analysis.subscores.alignment * 0.5 +
        analysis.readiness_overall * 0.3 +
        analysis.subscores.impact * 0.2
      );
  
  // Get overall calculation evidence
  const overallCalculation = hasResume
    ? `Alignment (${analysis.subscores.alignment} × 35%) + Readiness (${analysis.readiness_overall} × 25%) + ATS (${analysis.subscores.ats} × 15%) + Impact (${analysis.subscores.impact} × 15%) + Polish (${analysis.subscores.polish || 0} × 10%) = ${overall}%`
    : `Alignment (${analysis.subscores.alignment} × 50%) + Readiness (${analysis.readiness_overall} × 30%) + Impact (${analysis.subscores.impact} × 20%) = ${overall}%`;

  // Calculate evidence for each score from actual calculations
  const getScoreEvidence = (scoreType: string) => {
    const evidence: any = {
      alignment: {
        calculation: analysis.meta?.alignmentCalculation || `(${analysis.meta?.alignmentHits || 0} matching skills / ${analysis.meta?.allRequiredTokens || 0} required skills) × 100`,
        details: analysis.meta?.alignmentBreakdown || (analysis.meta?.jdSkills ? `Found ${analysis.meta.jdSkills} skills in job description. You match ${analysis.meta?.alignmentHits || 0} out of ${analysis.meta?.allRequiredTokens || 0} required skills.` : 'Keyword matching with job description'),
        breakdown: `ML-based similarity analysis between your resume and job description`
      },
      readiness: {
        calculation: analysis.meta?.readinessCalculation || `(${analysis.meta?.metRequired || 0} required skills met / ${analysis.meta?.requiredSkillsCount || 0} total required) × 100`,
        details: analysis.meta?.readinessBreakdown || (analysis.meta?.metRequired ? `You have ${analysis.meta.metRequired} out of ${analysis.meta.requiredSkillsCount} required skills` : 'Required skills assessment'),
        breakdown: `Direct comparison of your skills against role requirements`
      },
      impact: {
        calculation: analysis.meta?.impactCalculation || 'Based on resume content analysis',
        details: analysis.meta?.impactDetails || 'Evaluated project achievements, metrics, and quantifiable results',
        breakdown: analysis.meta?.impactBreakdown || 'Analyzed internships, projects with metrics, and action verbs'
      },
      potential: {
        calculation: analysis.meta?.potentialCalculation || 'Based on growth indicators',
        details: analysis.meta?.potentialDetails || 'Evaluated learning trajectory and skill development',
        breakdown: analysis.meta?.potentialBreakdown || 'Based on coursework, projects, and skill progression'
      },
      ats: {
        calculation: analysis.meta?.atsCalculation || 'Based on resume formatting',
        details: analysis.meta?.atsDetails || 'Evaluated resume structure, keywords, and ATS-friendly formatting',
        breakdown: analysis.meta?.atsBreakdown || 'Checked for proper sections, keyword density, and formatting'
      }
    };
    return evidence[scoreType] || { calculation: 'N/A', details: 'No evidence available', breakdown: '' };
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Dashboard
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{analysis.jd_title}</h1>
          <Badge {...readinessLabel}>{readinessLabel.text}</Badge>
        </div>
        <p className="text-muted-foreground">
          {role?.title} Analysis from {new Date(analysis.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Collapsible Overall Score Card */}
      <Card className="mb-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setExpanded(!expanded)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Overall Score</CardTitle>
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
          <CardDescription>
            {expanded ? 'Click to collapse details' : 'Click to view detailed breakdown'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <ScoreRing score={overall} size="lg" />
          <p className="text-sm text-muted-foreground mt-3 text-center max-w-md">
            {hasResume 
              ? `Weighted average: Alignment (35%) + Readiness (25%) + ATS (15%) + Impact (15%) + Polish (10%)`
              : `Weighted average: Alignment (50%) + Readiness (30%) + Impact (20%)`
            }
          </p>
          {expanded && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-xs max-w-md">
              <p className="font-medium mb-1">Overall Calculation:</p>
              <p className="text-muted-foreground">{overallCalculation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded Details */}
      {expanded && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Alignment</CardTitle>
              <CardDescription>Keyword match with JD</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-3">
                <ScoreRing score={analysis.subscores.alignment} size="sm" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium mb-1">Calculation:</p>
                  <p className="text-muted-foreground font-mono text-[10px]">{getScoreEvidence('alignment').calculation}</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium mb-1">Evidence:</p>
                  <p className="text-muted-foreground">{getScoreEvidence('alignment').details}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="font-medium mb-1">Method:</p>
                  <p className="text-muted-foreground">{getScoreEvidence('alignment').breakdown}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Readiness</CardTitle>
              <CardDescription>Required skills met</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-3">
                <ScoreRing score={analysis.readiness_overall} size="sm" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium mb-1">Calculation:</p>
                  <p className="text-muted-foreground font-mono text-[10px]">{getScoreEvidence('readiness').calculation}</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium mb-1">Evidence:</p>
                  <p className="text-muted-foreground">{getScoreEvidence('readiness').details}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="font-medium mb-1">Method:</p>
                  <p className="text-muted-foreground">{getScoreEvidence('readiness').breakdown}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Impact</CardTitle>
              <CardDescription>Project achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-3">
                <ScoreRing score={analysis.subscores.impact} size="sm" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium mb-1">Calculation:</p>
                  <p className="text-muted-foreground font-mono text-[10px]">{getScoreEvidence('impact').calculation}</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium mb-1">Evidence:</p>
                  <p className="text-muted-foreground">{getScoreEvidence('impact').details}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="font-medium mb-1">Breakdown:</p>
                  <p className="text-muted-foreground">{getScoreEvidence('impact').breakdown}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Potential</CardTitle>
              <CardDescription>Growth trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-3">
                <ScoreRing score={analysis.subscores.potential} size="sm" />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium mb-1">Calculation:</p>
                  <p className="text-muted-foreground font-mono text-[10px]">{getScoreEvidence('potential').calculation}</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-medium mb-1">Evidence:</p>
                  <p className="text-muted-foreground">{getScoreEvidence('potential').details}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <p className="font-medium mb-1">Method:</p>
                  <p className="text-muted-foreground">{getScoreEvidence('potential').breakdown}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis.subscores.ats > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ATS Score</CardTitle>
                <CardDescription>Resume formatting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-3">
                  <ScoreRing score={analysis.subscores.ats} size="sm" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium mb-1">Calculation:</p>
                    <p className="text-muted-foreground font-mono text-[10px]">{getScoreEvidence('ats').calculation}</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium mb-1">Evidence:</p>
                    <p className="text-muted-foreground">{getScoreEvidence('ats').details}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="font-medium mb-1">Breakdown:</p>
                    <p className="text-muted-foreground">{getScoreEvidence('ats').breakdown}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {analysis.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {analysis.strengths.map((strength: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
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
              <ul className="space-y-1.5">
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

      {(analysis.missing_skills.length > 0 || analysis.meta?.market_analysis) && (
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <CardTitle className="text-center">
                {activeTab === 'resources' 
                  ? 'Prioritized skills to learn with resources'
                  : 'Market insights and learning recommendations'}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'resources' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('resources')}
                >
                  Resources
                </Button>
                <Button
                  variant={activeTab === 'market' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('market')}
                  disabled={!analysis.meta?.market_analysis}
                >
                  Market Analysis
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'resources' && analysis.missing_skills.length > 0 && (
              <div className="space-y-3">
                {analysis.missing_skills.map((ms: any, i: number) => {
                  // Find corresponding market analysis explanation
                  const marketExplanation = analysis.meta?.market_analysis?.explanations?.find(
                    (exp: any) => exp.skill.toLowerCase() === ms.skill.toLowerCase()
                  );
                  const marketDemand = getMarketDemand(ms.skill);
                  
                  return (
                    <div key={i} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium capitalize text-sm">{ms.skill}</h3>
                        <Badge variant={ms.priority === 'required' ? 'destructive' : 'secondary'} className="text-xs">
                          {ms.priority}
                        </Badge>
                        {marketDemand > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {marketDemand.toLocaleString()}+ opportunities
                          </Badge>
                        )}
                      </div>
                      {marketExplanation && (
                        <div className="mb-2 p-2 bg-muted rounded text-xs text-muted-foreground">
                          <strong>Why {ms.skill}?</strong> {marketExplanation.reason}
                        </div>
                      )}
                      {ms.resources && ms.resources.length > 0 ? (
                        <div className="space-y-2 ml-2 mt-2">
                          <p className="text-xs font-medium text-muted-foreground">Learning Resources:</p>
                          {ms.resources.map((resource: any, j: number) => (
                            <a
                              key={j}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-primary hover:underline p-1.5 rounded hover:bg-muted/50 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              <span className="flex-1">{resource.title}</span>
                              <Badge variant="outline" className="text-[10px] ml-auto">
                                {resource.type}
                              </Badge>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="ml-2 mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                          Resources coming soon for this skill. Check back later!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'market' && analysis.meta?.market_analysis && (
              <div className="space-y-3">
                {analysis.meta.market_analysis.skillGaps && (
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium mb-1">Recommended Learning Path:</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {analysis.meta.market_analysis.skillGaps.learningPath}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Total gaps: {analysis.meta.market_analysis.skillGaps.total}</span>
                      <span>Critical: {analysis.meta.market_analysis.skillGaps.critical}</span>
                    </div>
                  </div>
                )}
                {analysis.meta.market_analysis.explanations && analysis.meta.market_analysis.explanations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Skill Recommendations Explained:</h4>
                    {analysis.meta.market_analysis.explanations.map((exp: any, i: number) => {
                      const marketDemand = exp.marketDemand || getMarketDemand(exp.skill);
                      return (
                        <div key={i} className="p-2.5 border rounded-lg">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-medium capitalize text-sm">{exp.skill}</span>
                            <Badge variant={exp.priority === 'required' ? 'destructive' : 'secondary'} className="text-xs">
                              {exp.priority}
                            </Badge>
                            {marketDemand > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {marketDemand.toLocaleString()}+ opportunities
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{exp.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex gap-4">
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
