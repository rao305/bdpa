'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Info, Lightbulb, Target } from 'lucide-react';
import { DetailedScores, StrengthsAndWeaknesses, ActionableRecommendations } from '@/lib/advanced-scoring';

interface ScoreRingProps {
  score: number;
  label: string;
  size?: 'small' | 'large';
  showPercentile?: boolean;
  percentile?: number;
}

function ScoreRing({ score, label, size = 'small', showPercentile, percentile }: ScoreRingProps) {
  const radius = size === 'large' ? 60 : 45;
  const strokeWidth = size === 'large' ? 8 : 6;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 70) return '#3b82f6'; // blue  
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getProgressColor(score)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset: 0 }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${size === 'large' ? 'text-2xl' : 'text-lg'} font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className={`font-medium ${size === 'large' ? 'text-lg' : 'text-sm'} text-white`}>
          {label}
        </div>
        {showPercentile && percentile && (
          <div className="text-xs text-gray-300">
            {percentile}th Percentile
          </div>
        )}
      </div>
    </div>
  );
}

interface VisualScoringDashboardProps {
  scores: DetailedScores;
  strengths: StrengthsAndWeaknesses['strengths'];
  improvements: StrengthsAndWeaknesses['improvements'];
  recommendations: ActionableRecommendations;
  roleTitle: string;
  confidenceLevel: number;
}

export default function VisualScoringDashboard({ 
  scores, 
  strengths, 
  improvements, 
  recommendations,
  roleTitle,
  confidenceLevel 
}: VisualScoringDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Resume Analysis Complete</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Analysis for: <span className="font-medium">{roleTitle}</span>
          </p>
        </CardHeader>
      </Card>

      {/* Main Scoring Dashboard */}
      <Card className="bg-slate-800 text-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Central Overall Score */}
            <div className="lg:col-span-1 flex justify-center">
              <ScoreRing 
                score={scores.overall} 
                label="Overall" 
                size="large"
                showPercentile
                percentile={scores.percentiles.overall}
              />
            </div>
            
            {/* Sub-scores Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              <ScoreRing 
                score={scores.potential} 
                label="Potential" 
                showPercentile
                percentile={scores.percentiles.potential}
              />
              <ScoreRing 
                score={scores.ats} 
                label="ATS Readiness" 
                showPercentile
                percentile={scores.percentiles.ats}
              />
              <ScoreRing 
                score={scores.alignment} 
                label="Job Alignment" 
                showPercentile
                percentile={scores.percentiles.alignment}
              />
              <ScoreRing 
                score={scores.impact} 
                label="Impact" 
                showPercentile
                percentile={scores.percentiles.impact}
              />
              <ScoreRing 
                score={scores.polish} 
                label="Polish" 
                showPercentile
                percentile={scores.percentiles.polish}
              />
            </div>
          </div>
          
          {/* Performance Summary */}
          <div className="mt-8 text-center">
            <div className="text-sm text-gray-300 mb-2">
              {scores.percentiles.overall}th Percentile
            </div>
            <Badge 
              variant={scores.ranking === 'Excellent' ? 'default' : 
                       scores.ranking === 'Above Average' ? 'secondary' : 'outline'}
              className={`text-sm px-4 py-1 ${
                scores.ranking === 'Excellent' ? 'bg-green-600 text-white' :
                scores.ranking === 'Above Average' ? 'bg-yellow-600 text-white' :
                'bg-gray-600 text-white'
              }`}
            >
              {scores.ranking}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Improvements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strengths.map((strength, idx) => (
                <div key={idx} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-green-800">{strength.category}</h4>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      {strength.marketValue} Market Value
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    {strength.description}
                  </p>
                  <ul className="text-xs text-green-600 space-y-1">
                    {strength.evidence.map((evidence, evidenceIdx) => (
                      <li key={evidenceIdx} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {strengths.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Continue building your skills to develop competitive advantages.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {improvements.map((improvement, idx) => (
                <div 
                  key={idx} 
                  className={`border-l-4 p-4 rounded-r-lg ${
                    improvement.impact === 'Critical' 
                      ? 'border-red-500 bg-red-50' 
                      : improvement.impact === 'Important'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {improvement.impact === 'Critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      {improvement.impact === 'Important' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {improvement.impact === 'Beneficial' && <Info className="h-4 w-4 text-blue-600" />}
                      <h4 className={`font-medium ${
                        improvement.impact === 'Critical' ? 'text-red-800' :
                        improvement.impact === 'Important' ? 'text-yellow-800' :
                        'text-blue-800'
                      }`}>
                        {improvement.category}
                      </h4>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        improvement.impact === 'Critical' ? 'border-red-300 text-red-700' :
                        improvement.impact === 'Important' ? 'border-yellow-300 text-yellow-700' :
                        'border-blue-300 text-blue-700'
                      }`}
                    >
                      {improvement.timeToAddress}
                    </Badge>
                  </div>
                  <p className={`text-sm mb-2 ${
                    improvement.impact === 'Critical' ? 'text-red-700' :
                    improvement.impact === 'Important' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {improvement.description}
                  </p>
                  {improvement.marketRelevance > 1000 && (
                    <p className="text-xs text-muted-foreground">
                      Market demand: {improvement.marketRelevance.toLocaleString()} job mentions
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Lightbulb className="h-5 w-5" />
            Actionable Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Immediate Actions */}
            {recommendations.immediate.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  Immediate Actions (1-2 weeks)
                </h4>
                <div className="space-y-3">
                  {recommendations.immediate.map((rec, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <Badge 
                          variant={rec.impact === 'High' ? 'destructive' : rec.impact === 'Medium' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {rec.impact} Impact
                        </Badge>
                      </div>
                      <p className="font-medium text-blue-800 mb-2">{rec.action}</p>
                      <p className="text-sm text-blue-700 mb-2">{rec.rationale}</p>
                      {rec.example && (
                        <div className="bg-blue-100 p-3 rounded text-xs text-blue-800 italic">
                          Example: {rec.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short-term Actions */}
            {recommendations.shortTerm.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-yellow-500" />
                  Short-term Goals ({recommendations.shortTerm[0]?.timeline || '1-4 weeks'})
                </h4>
                <div className="space-y-3">
                  {recommendations.shortTerm.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                      <p className="font-medium text-yellow-800 mb-2">{rec.action}</p>
                      <p className="text-sm text-yellow-700">{rec.rationale}</p>
                      {rec.example && (
                        <div className="bg-yellow-100 p-3 rounded text-xs text-yellow-800 italic mt-2">
                          Example: {rec.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long-term Goals */}
            {recommendations.longTerm.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Long-term Development (2-6 months)
                </h4>
                <div className="space-y-3">
                  {recommendations.longTerm.slice(0, 2).map((rec, idx) => (
                    <div key={idx} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                      <p className="font-medium text-green-800 mb-2">{rec.action}</p>
                      <p className="text-sm text-green-700 mb-2">{rec.rationale}</p>
                      {rec.skillsNeeded && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600 mb-1">Skills to develop:</p>
                          <div className="flex flex-wrap gap-1">
                            {rec.skillsNeeded.map((skill, skillIdx) => (
                              <Badge key={skillIdx} variant="outline" className="text-xs border-green-300 text-green-700">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Confidence */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Analysis Confidence</span>
            <div className="flex items-center gap-2">
              <Progress value={confidenceLevel} className="w-20 h-2" />
              <span className="font-medium">{confidenceLevel}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}