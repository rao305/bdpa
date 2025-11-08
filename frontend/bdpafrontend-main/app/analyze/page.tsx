'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { seedRoles, seedResources } from '@/lib/seed-data';
import { computeScores } from '@/lib/scoring';
import { buildDictionary } from '@/lib/normalization';
import { analyzeSkillGaps } from '@/lib/gap-analysis';
import { generatePersonalizedRecommendations } from '@/lib/resource-engine';
import { performDetailedAnalysis } from '@/lib/advanced-scoring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [roleId, setRoleId] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [jdText, setJdText] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', user.id)
      .maybeSingle();

    if (!profileData) {
      router.push('/onboarding');
      return;
    }

    setProfile(profileData);
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!roleId || !jdTitle || !jdText || !profile) return;

    setAnalyzing(true);

    const selectedRole = seedRoles.find((r) => r.id === roleId);
    if (!selectedRole) return;

    const dictionary = buildDictionary(seedRoles, seedResources);
    const userSkills = [...(profile.skills || []), ...(profile.coursework || [])];

    // Enhanced gap analysis
    const gapAnalysis = analyzeSkillGaps({
      userSkills,
      userCoursework: profile.coursework || [],
      userExperience: profile.experience || [],
      resumeText: profile.resume_text,
      roleRequirements: selectedRole.requirements,
      roleCategory: selectedRole.category,
      jdText,
      jdTitle,
      dictionary,
      isStudent: profile.is_student,
      yearLevel: profile.year,
    });

    // Detailed analysis with market data integration
    const detailedAnalysis = performDetailedAnalysis({
      userSkills,
      userCoursework: profile.coursework || [],
      userExperience: profile.experience || [],
      resumeText: profile.resume_text,
      roleRequirements: selectedRole.requirements,
      roleCategory: selectedRole.category,
      roleTitle: selectedRole.title,
      jdText,
      jdTitle,
      dictionary,
      isStudent: profile.is_student,
      yearLevel: profile.year,
      major: profile.major,
    });

    // Get personalized learning recommendations
    const learningRecs = generatePersonalizedRecommendations(
      [...gapAnalysis.criticalGaps, ...gapAnalysis.importantGaps], 
      {
        level: userSkills.length >= 8 ? 'intermediate' : 'beginner',
        learningStyle: ['interactive', 'course', 'tutorial'],
        budget: 'free'
      }
    );

    // Original scoring for backward compatibility
    const scoringResult = computeScores({
      userSkills,
      roleRequirements: selectedRole.requirements,
      jdText,
      jdTitle,
      dictionary,
      resumeProvided: !!profile.resume_text,
      resumeText: profile.resume_text,
    });

    // Combine missing skills with enhanced gap analysis
    const enhancedMissingSkills = [
      ...gapAnalysis.criticalGaps.slice(0, 5).map(gap => ({
        skill: gap.skill,
        weight: gap.weight,
        priority: gap.priority,
        severity: 'critical',
        timeToLearn: gap.timeToLearn,
        marketDemand: gap.marketDemand,
        careerImpact: gap.careerImpact,
        resources: learningRecs.priority1.filter(r => 
          r.title.toLowerCase().includes(gap.skill.toLowerCase())
        ).slice(0, 2).map(r => ({
          title: r.title,
          url: r.url,
          type: r.type,
          difficulty: r.difficulty,
          duration: r.duration
        }))
      })),
      ...gapAnalysis.importantGaps.slice(0, 5).map(gap => ({
        skill: gap.skill,
        weight: gap.weight,
        priority: gap.priority,
        severity: 'important',
        timeToLearn: gap.timeToLearn,
        marketDemand: gap.marketDemand,
        careerImpact: gap.careerImpact,
        resources: learningRecs.priority2.filter(r => 
          r.title.toLowerCase().includes(gap.skill.toLowerCase())
        ).slice(0, 2).map(r => ({
          title: r.title,
          url: r.url,
          type: r.type,
          difficulty: r.difficulty,
          duration: r.duration
        }))
      }))
    ];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: analysis, error } = await supabase
      .from('analyses')
      .insert({
        uid: user.id,
        role_id: roleId,
        jd_title: jdTitle,
        jd_text: jdText,
        readiness_overall: detailedAnalysis.scores.overall,
        subscores: {
          ats: detailedAnalysis.scores.ats,
          alignment: detailedAnalysis.scores.alignment,
          impact: detailedAnalysis.scores.impact,
          polish: detailedAnalysis.scores.polish,
          potential: detailedAnalysis.scores.potential,
        },
        strengths: detailedAnalysis.strengthsAndWeaknesses.strengths.map(s => s.description),
        improvements: detailedAnalysis.strengthsAndWeaknesses.improvements.map(i => i.description),
        missing_skills: enhancedMissingSkills,
        meta: {
          ...scoringResult.meta,
          detailedScores: detailedAnalysis.scores,
          detailedStrengths: detailedAnalysis.strengthsAndWeaknesses.strengths,
          detailedImprovements: detailedAnalysis.strengthsAndWeaknesses.improvements,
          actionableRecommendations: detailedAnalysis.recommendations,
          marketInsights: detailedAnalysis.marketInsights,
          industryInsights: gapAnalysis.industryInsights,
          quickWins: gapAnalysis.quickWins.map(qw => ({
            skill: qw.skill,
            timeToLearn: qw.timeToLearn,
            impact: qw.careerImpact
          })),
          learningPlan: learningRecs.studyPlan,
          confidenceScore: detailedAnalysis.confidenceLevel,
          marketPosition: gapAnalysis.industryInsights.marketPosition
        },
      })
      .select()
      .single();

    setAnalyzing(false);

    if (!error && analysis) {
      router.push(`/results/${analysis.id}`);
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
