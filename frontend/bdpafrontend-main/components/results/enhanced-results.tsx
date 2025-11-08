'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  BookOpen, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Star,
  Zap,
  Calendar
} from 'lucide-react';

interface EnhancedResultsProps {
  analysis: {
    readiness_overall: number;
    strengths: string[];
    improvements: string[];
    missing_skills: Array<{
      skill: string;
      weight: number;
      priority: string;
      severity?: string;
      timeToLearn?: string;
      marketDemand?: number;
      careerImpact?: string;
      resources: Array<{
        title: string;
        url: string;
        type: string;
        difficulty?: string;
        duration?: string;
      }>;
    }>;
    meta: {
      industryInsights?: {
        marketPosition: string;
        competitiveAdvantage: string[];
        trendingSkills: string[];
        salaryImpact: string;
      };
      quickWins?: Array<{
        skill: string;
        timeToLearn: string;
        impact: string;
      }>;
      learningPlan?: {
        week1: string[];
        week2: string[];
        week3: string[];
        week4: string[];
      };
      confidenceScore?: number;
    };
    role_id: string;
    jd_title: string;
  };
  role: {
    title: string;
    category: string;
    description: string;
  };
}

export default function EnhancedResults({ analysis, role }: EnhancedResultsProps) {
  const criticalGaps = analysis.missing_skills.filter(ms => ms.severity === 'critical');
  const importantGaps = analysis.missing_skills.filter(ms => ms.severity === 'important');
  const beneficialGaps = analysis.missing_skills.filter(ms => ms.severity !== 'critical' && ms.severity !== 'important');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important': return <Info className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'important': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-green-200 bg-green-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Overall Readiness */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Gap Analysis Results</CardTitle>
              <CardDescription>
                Analysis for {analysis.jd_title} • {role.category}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{analysis.readiness_overall}%</div>
              <div className="text-sm text-muted-foreground">Role Readiness</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={analysis.readiness_overall} className="h-3 mb-4" />
          {analysis.meta.confidenceScore && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              Analysis Confidence: {analysis.meta.confidenceScore}%
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Insights */}
      {analysis.meta.industryInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Industry & Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Market Position</h4>
              <p className="text-sm text-muted-foreground">
                {analysis.meta.industryInsights.marketPosition}
              </p>
            </div>
            
            {analysis.meta.industryInsights.competitiveAdvantage.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Your Competitive Advantages</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.meta.industryInsights.competitiveAdvantage.map((advantage, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {advantage}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 className="font-medium mb-2">Salary Impact</h4>
              <p className="text-sm text-muted-foreground">
                {analysis.meta.industryInsights.salaryImpact}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins */}
      {analysis.meta.quickWins && analysis.meta.quickWins.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-5 w-5" />
              Quick Wins (Start Here!)
            </CardTitle>
            <CardDescription>
              High-impact skills you can learn quickly to boost your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {analysis.meta.quickWins.map((win, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <div className="font-medium">{win.skill}</div>
                    <div className="text-sm text-muted-foreground">{win.impact}</div>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {win.timeToLearn}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="gaps" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="plan">Learning Plan</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="trending">Trending Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-4">
          {/* Critical Gaps */}
          {criticalGaps.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-red-600">Critical Gaps (Must Learn)</h3>
              <div className="grid gap-4">
                {criticalGaps.map((gap, idx) => (
                  <Card key={idx} className={`border-l-4 ${getSeverityColor(gap.severity || 'critical')}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getSeverityIcon(gap.severity || 'critical')}
                          {gap.skill}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={gap.priority === 'required' ? 'destructive' : 'secondary'}>
                            {gap.priority}
                          </Badge>
                          {gap.timeToLearn && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {gap.timeToLearn}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {gap.careerImpact && (
                        <CardDescription>{gap.careerImpact}</CardDescription>
                      )}
                      {gap.marketDemand && (
                        <div className="text-sm text-muted-foreground">
                          Market Demand: {gap.marketDemand.toLocaleString()} job mentions
                        </div>
                      )}
                    </CardHeader>
                    {gap.resources.length > 0 && (
                      <CardContent>
                        <h4 className="font-medium mb-2">Recommended Resources</h4>
                        <div className="space-y-2">
                          {gap.resources.map((resource, resIdx) => (
                            <div key={resIdx} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex items-center gap-3">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium text-sm">{resource.title}</div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {resource.type}
                                    </Badge>
                                    {resource.difficulty && (
                                      <Badge variant="outline" className="text-xs">
                                        {resource.difficulty}
                                      </Badge>
                                    )}
                                    {resource.duration && (
                                      <span>{resource.duration}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Important Gaps */}
          {importantGaps.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-yellow-600">Important Gaps (High Priority)</h3>
              <div className="grid gap-4">
                {importantGaps.map((gap, idx) => (
                  <Card key={idx} className={`border-l-4 ${getSeverityColor(gap.severity || 'important')}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getSeverityIcon(gap.severity || 'important')}
                          {gap.skill}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{gap.priority}</Badge>
                          {gap.timeToLearn && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {gap.timeToLearn}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {gap.careerImpact && (
                        <CardDescription className="text-sm">{gap.careerImpact}</CardDescription>
                      )}
                    </CardHeader>
                    {gap.resources.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {gap.resources.map((resource, resIdx) => (
                            <Button key={resIdx} variant="outline" size="sm" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                {resource.title}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          {analysis.meta.learningPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  4-Week Learning Plan
                </CardTitle>
                <CardDescription>
                  Structured plan to address your most critical skill gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {Object.entries(analysis.meta.learningPlan).map(([week, tasks], idx) => (
                    <Card key={week}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Week {idx + 1}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {tasks.map((task, taskIdx) => (
                            <li key={taskIdx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strengths" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Strengths</CardTitle>
              <CardDescription>
                Skills and advantages that make you competitive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm font-medium">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          {analysis.meta.industryInsights?.trendingSkills && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Skills in {role.category}
                </CardTitle>
                <CardDescription>
                  Emerging skills to consider for future learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.meta.industryInsights.trendingSkills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.improvements.slice(0, 3).map((improvement, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-sm">{improvement}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}