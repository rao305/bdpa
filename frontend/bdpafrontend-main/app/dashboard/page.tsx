'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { seedRoles } from '@/lib/seed-data';
import { normalizeSkill } from '@/lib/normalization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, FileText, Plus, ExternalLink } from 'lucide-react';
import { ScoreRing } from '@/components/results/score-ring';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [profile, setProfile] = useState<any>(null);
  const [marketData, setMarketData] = useState<Record<string, number>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, 'resources' | 'market'>>({});
  
  const setActiveTab = useCallback((analysisId: string, tab: 'resources' | 'market') => {
    setActiveTabs(prev => ({ ...prev, [analysisId]: tab }));
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [analyses, roleFilter, dateFilter]);

  const loadData = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!user) {
        router.push('/auth');
        return;
      }

      // Prepare headers for authenticated requests
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const requestOptions = {
        method: 'GET',
        headers,
        credentials: 'include' as RequestCredentials,
      };

      // Load profile and market data in parallel
      const [analysesResponse, profileResponse, marketResponse] = await Promise.all([
        fetch('/api/analyses', requestOptions),
        fetch('/api/profile', requestOptions),
        fetch('/api/market-data', requestOptions)
      ]);

      if (!analysesResponse.ok) {
        if (analysesResponse.status === 401) {
          router.push('/auth');
          return;
        }
        throw new Error('Failed to load analyses');
      }

      const analysesData = await analysesResponse.json();
      // Sort analyses by created_at descending (newest first) to ensure latest is always first
      const sortedAnalyses = (analysesData.analyses || []).sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      setAnalyses(sortedAnalyses);
      
      // Set loading to false as soon as we have analyses data to show content faster
      setLoading(false);

      // Load profile and market data in background (non-blocking)
      Promise.all([
        profileResponse.ok ? profileResponse.json().then(data => {
          setProfile(data.profile || null);
        }).catch(() => {}) : Promise.resolve(),
        marketResponse.ok ? marketResponse.json().then(data => {
          setMarketData(data.marketData || {});
        }).catch(() => {}) : Promise.resolve()
      ]).catch(() => {
        // Silently handle errors for non-critical data
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setAnalyses([]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...analyses];

    if (roleFilter !== 'all') {
      filtered = filtered.filter((a) => a.role_id === roleFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const daysAgo = dateFilter === '7' ? 7 : dateFilter === '30' ? 30 : 90;
      const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((a) => new Date(a.created_at) >= cutoff);
    }

    // Sort by creation date descending (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    setFilteredAnalyses(filtered);
  };

  const calculateKPIs = () => {
    if (filteredAnalyses.length === 0) {
      return {
        avgOverall: 0,
        count: 0,
        avgAlignment: 0,
        avgReadiness: 0,
      };
    }

    const avgAlignment =
      filteredAnalyses.reduce((sum, a) => sum + (a.subscores?.alignment || 0), 0) /
      filteredAnalyses.length;

    const avgReadiness =
      filteredAnalyses.reduce((sum, a) => sum + (a.readiness_overall || 0), 0) /
      filteredAnalyses.length;

    const avgOverall =
      filteredAnalyses.reduce((sum, a) => {
        const overall = Math.round(
          ((a.subscores?.alignment || 0) * 0.35 +
            (a.readiness_overall || 0) * 0.25 +
            (a.subscores?.impact || 0) * 0.2 +
            (a.subscores?.potential || 0) * 0.2) || 0
        );
        return sum + overall;
      }, 0) / filteredAnalyses.length;

    return {
      avgOverall: Math.round(avgOverall),
      count: filteredAnalyses.length,
      avgAlignment: Math.round(avgAlignment),
      avgReadiness: Math.round(avgReadiness),
    };
  };

  // Market demand cache
  const marketDemandCache = useMemo(() => {
    return new Map<string, number>();
  }, [marketData]);

  // Helper function to get market demand with fallback and mock data
  // Must be defined before useMemo hooks that use it
  const getMarketDemand = useCallback((skill: string): number => {
    if (!skill) return 0;
    
    // Check cache first
    if (marketDemandCache.has(skill)) {
      return marketDemandCache.get(skill)!;
    }
    
    const normalizedSkill = normalizeSkill(skill);
    let result = 0;
    
    // Try direct market data lookup
    if (marketData[normalizedSkill]) {
      result = marketData[normalizedSkill];
      marketDemandCache.set(skill, result);
      return result;
    }
    
    // Try variations (limited to avoid expensive operations)
    const variations = [
      normalizedSkill,
      normalizedSkill.replace(/\s+/g, '-'),
      normalizedSkill.replace(/\s+/g, ''),
      normalizedSkill.replace(/-/g, ' '),
      skill.toLowerCase().trim(),
    ];
    
    for (const variation of variations) {
      if (marketData[variation]) {
        result = marketData[variation];
        marketDemandCache.set(skill, result);
        return result;
      }
    }
    
    // Skip expensive partial matching to prevent freezes
    // Only do quick checks if marketData is small
    const marketDataKeys = Object.keys(marketData);
    if (marketDataKeys.length < 500) {
      const skillWords = normalizedSkill.split(/\s+/);
      if (skillWords.length > 1) {
        // Only check first 100 keys to prevent freeze
        const keysToCheck = marketDataKeys.slice(0, 100);
        for (const key of keysToCheck) {
          if (key.includes(skillWords[0]) || normalizedSkill.includes(key)) {
            result = marketData[key];
            marketDemandCache.set(skill, result);
            return result;
          }
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
      'c++ basics': 5000,
      'ros basics': 1500,
      'matlab': 2000,
    };
    
    // Check mock data with normalized skill
    const mockKey = Object.keys(mockMarketData).find(key => 
      normalizedSkill.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedSkill)
    );
    
    if (mockKey) {
      result = mockMarketData[mockKey];
      marketDemandCache.set(skill, result);
      return result;
    }
    
    // Cache 0 to avoid repeated lookups
    marketDemandCache.set(skill, 0);
    return 0;
  }, [marketData, marketDemandCache]);

  // Get industry-relevant hot skills based on target category and market demand
  const getIndustryHotSkills = (targetCategory: string | null): Set<string> => {
    if (!targetCategory || Object.keys(marketData).length === 0) {
      return new Set();
    }

    const hotSkills = new Set<string>();

    // Define industry-specific skill patterns (using exact category values from profile)
    const industrySkills: Record<string, string[]> = {
      'AI/ML': ['python', 'machine learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'statistics', 'deep learning', 'neural networks', 'jupyter notebooks'],
      'Data': ['python', 'sql', 'pandas', 'numpy', 'excel', 'tableau', 'power bi', 'statistics', 'data analysis', 'r', 'jupyter notebooks'],
      'SWE': ['javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'html', 'css', 'git', 'rest apis'],
      'Backend': ['python', 'java', 'node.js', 'sql', 'rest apis', 'docker', 'git', 'databases', 'linux'],
      'Frontend': ['javascript', 'react', 'html', 'css', 'typescript', 'vue', 'angular', 'git'],
      'DevOps': ['docker', 'kubernetes', 'aws', 'linux', 'git', 'ci/cd', 'terraform', 'azure'],
      'Robotics': ['c++', 'python', 'ros', 'robotics', 'embedded systems', 'linux'],
      'Game Dev': ['unity', 'c#', 'c++', 'unreal', 'game development', 'javascript']
    };

    // Get relevant skills for the industry (handle both exact match and lowercase)
    const relevantSkills = industrySkills[targetCategory] || industrySkills[targetCategory.toLowerCase()] || [];
    
    // Find hot skills (high market demand) that are relevant to the industry
    const skillDemands = relevantSkills
      .map(skill => ({
        skill: skill.toLowerCase(),
        demand: marketData[skill.toLowerCase()] || 0
      }))
      .filter(({ demand }) => demand > 0)
      .sort((a, b) => b.demand - a.demand);

    // Get top hot skills (top 10 by market demand)
    skillDemands.slice(0, 10).forEach(({ skill }) => {
      hotSkills.add(skill);
    });

    return hotSkills;
  };

  // Memoize expensive computation - only recalculate when dependencies change
  const skillsOverTimeData = useMemo(() => {
    if (filteredAnalyses.length === 0) {
      return {
        chartData: [],
        topSkills: [],
        skillMarketDemand: {},
        targetCategory: profile?.target_category || null
      };
    }
    
    const targetCategory = profile?.target_category || null;
    const industryHotSkills = getIndustryHotSkills(targetCategory);
    
    // Group analyses by year-month
    const skillsByPeriod: Record<string, { 
      skills: string[]; 
      marketDemand: Record<string, number>;
      date: Date;
    }> = {};
    
    // Limit to last 5 analyses to improve performance (reduced from 10)
    const analysesToProcess = filteredAnalyses.slice(0, 5);
    
    // Pre-cache market demand lookups to avoid repeated expensive calls
    const demandCache = new Map<string, number>();
    
    analysesToProcess.forEach((analysis) => {
      const date = new Date(analysis.created_at);
      const periodLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!skillsByPeriod[periodLabel]) {
        skillsByPeriod[periodLabel] = { skills: [], marketDemand: {}, date };
      }
      
      // Extract missing skills from analysis
      if (analysis.missing_skills && Array.isArray(analysis.missing_skills)) {
        analysis.missing_skills.forEach((ms: any) => {
          const skill = normalizeSkill(ms.skill || ms);
          if (typeof skill === 'string' && skill.length > 0) {
            // If target category exists, prefer industry hot skills but always include all skills
            // to ensure chart has data. We'll prioritize hot skills in the topSkills selection.
            let shouldInclude = true;
            // Don't filter out skills - we want to show all missing skills
            // The industry filtering will happen when selecting topSkills, not here
            
            skillsByPeriod[periodLabel].skills.push(skill);
            
            // Get market demand from meta if available, otherwise from cache or marketData
            const metaMarketData = analysis.meta?.market_analysis?.explanations?.find(
              (exp: any) => normalizeSkill(exp.skill) === skill
            );
            let demand = metaMarketData?.marketDemand;
            if (!demand) {
              if (demandCache.has(skill)) {
                demand = demandCache.get(skill)!;
              } else {
                demand = getMarketDemand(skill);
                demandCache.set(skill, demand);
              }
            }
            
            if (demand > 0) {
              skillsByPeriod[periodLabel].marketDemand[skill] = 
                Math.max(
                  skillsByPeriod[periodLabel].marketDemand[skill] || 0,
                  demand
                );
            }
          }
        });
      }
    });
    
    // Get all skills that appear in analyses
    const allSkills: Record<string, { count: number; demand: number }> = {};
    Object.values(skillsByPeriod).forEach((period) => {
      period.skills.forEach((skill) => {
        if (!allSkills[skill]) {
          allSkills[skill] = { count: 0, demand: 0 };
        }
        allSkills[skill].count += 1;
        const periodDemand = period.marketDemand[skill];
        if (!periodDemand) {
          const cachedDemand = demandCache.get(skill);
          if (cachedDemand !== undefined) {
            allSkills[skill].demand = Math.max(allSkills[skill].demand, cachedDemand);
          } else {
            const demand = getMarketDemand(skill);
            demandCache.set(skill, demand);
            allSkills[skill].demand = Math.max(allSkills[skill].demand, demand);
          }
        } else {
          allSkills[skill].demand = Math.max(allSkills[skill].demand, periodDemand);
        }
      });
    });
    
    // If no skills found with industry filter, collect all skills from latest analysis
    if (Object.keys(allSkills).length === 0 && filteredAnalyses.length > 0) {
      const latestAnalysis = filteredAnalyses[0];
      if (latestAnalysis.missing_skills && Array.isArray(latestAnalysis.missing_skills)) {
        latestAnalysis.missing_skills.forEach((ms: any) => {
          const skill = normalizeSkill(ms.skill || ms);
          if (skill && skill.length > 0) {
            const demand = demandCache.has(skill) 
              ? demandCache.get(skill)! 
              : (() => {
                  const d = getMarketDemand(skill);
                  demandCache.set(skill, d);
                  return d;
                })();
            allSkills[skill] = {
              count: 1,
              demand
            };
          }
        });
      }
    }
    
    // Prioritize skills by: 1) industry relevance (if target category), 2) frequency, 3) market demand
    const topSkills = Object.entries(allSkills)
      .map(([skill, data]) => {
        // Boost score for industry-relevant skills
        let industryBoost = 0;
        if (targetCategory && industryHotSkills.size > 0) {
          const isRelevant = Array.from(industryHotSkills).some(hotSkill => 
            skill.includes(hotSkill) || hotSkill.includes(skill) ||
            skill.split(' ').some(word => hotSkill.includes(word)) ||
            hotSkill.split(' ').some(word => skill.includes(word))
          );
          if (isRelevant) {
            industryBoost = 50; // Significant boost for industry-relevant skills
          }
        }
        return {
          skill,
          score: industryBoost + data.count * 10 + (data.demand / 1000),
          count: data.count,
          demand: data.demand
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ skill }) => skill);
    
    // If we still have no topSkills, just take the first 5 from allSkills
    if (topSkills.length === 0 && Object.keys(allSkills).length > 0) {
      topSkills.push(...Object.keys(allSkills).slice(0, 5));
    }
    
    // Aggregate market demand per skill across all periods
    const skillMarketDemand: Record<string, number> = {};
    Object.entries(allSkills).forEach(([skill, data]) => {
      skillMarketDemand[skill] = data.demand;
    });
    
    // If no topSkills from history, get them from latest analysis or all missing skills
    if (topSkills.length === 0 && filteredAnalyses.length > 0) {
      const latestAnalysis = filteredAnalyses[0];
      if (latestAnalysis.missing_skills && Array.isArray(latestAnalysis.missing_skills)) {
        const latestSkills = latestAnalysis.missing_skills
          .slice(0, 5)
          .map((ms: any) => normalizeSkill(ms.skill || ms))
          .filter((s: string) => s && s.length > 0);
        topSkills.push(...latestSkills);
        
        // Update allSkills and skillMarketDemand for these skills
        latestSkills.forEach((skill: string) => {
          if (!allSkills[skill]) {
            const demand = demandCache.has(skill) 
              ? demandCache.get(skill)! 
              : (() => {
                  const d = getMarketDemand(skill);
                  demandCache.set(skill, d);
                  return d;
                })();
            allSkills[skill] = { count: 1, demand };
            skillMarketDemand[skill] = demand;
          }
        });
      }
    }
    
    // Build data for chart - show frequency of top skills over time
    const periods = Object.entries(skillsByPeriod)
      .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
      .map(([label]) => label);
    
    // If only one period, still show the data
    const chartData = periods.length > 0 ? periods.map((period) => {
      const data: any = { period };
      const periodSkills = skillsByPeriod[period];
      
      topSkills.forEach((skill) => {
        const count = periodSkills.skills.filter((s) => s === skill).length;
        // Use normalized value (0-2 scale) for better visualization
        data[skill] = count > 0 ? Math.min(count, 2) : 0;
      });
      
      return data;
    }) : [];
    
    // If no periods but we have skills, create a single data point from latest analysis
    if (chartData.length === 0 && filteredAnalyses.length > 0 && topSkills.length > 0) {
      const latestAnalysis = filteredAnalyses[0];
      const date = new Date(latestAnalysis.created_at);
      const periodLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      const dataPoint: any = { period: periodLabel };
      if (latestAnalysis.missing_skills && Array.isArray(latestAnalysis.missing_skills)) {
        topSkills.forEach((skill) => {
          const count = latestAnalysis.missing_skills.filter((ms: any) => 
            normalizeSkill(ms.skill || ms) === skill
          ).length;
          // Use normalized value for visibility
          dataPoint[skill] = count > 0 ? 1 : 0;
        });
      } else {
        // If no missing_skills, set all to 1 to show the chart structure
        topSkills.forEach((skill) => {
          dataPoint[skill] = 1;
        });
      }
      chartData.push(dataPoint);
      
      // Add skill market demand (use cache)
      topSkills.forEach((skill) => {
        const demand = demandCache.has(skill) 
          ? demandCache.get(skill)! 
          : (() => {
              const d = getMarketDemand(skill);
              demandCache.set(skill, d);
              return d;
            })();
        if (demand > 0) {
          skillMarketDemand[skill] = demand;
        }
      });
    }
    
    // Also ensure periods are populated if we have skills but no periods
    if (periods.length === 0 && topSkills.length > 0 && filteredAnalyses.length > 0) {
      const latestAnalysis = filteredAnalyses[0];
      const date = new Date(latestAnalysis.created_at);
      const periodLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!skillsByPeriod[periodLabel]) {
        skillsByPeriod[periodLabel] = { skills: [], marketDemand: {}, date };
        // Populate with top skills (use cache)
        topSkills.forEach((skill) => {
          skillsByPeriod[periodLabel].skills.push(skill);
          const demand = demandCache.has(skill) 
            ? demandCache.get(skill)! 
            : (() => {
                const d = getMarketDemand(skill);
                demandCache.set(skill, d);
                return d;
              })();
          if (demand > 0) {
            skillsByPeriod[periodLabel].marketDemand[skill] = demand;
          }
        });
      }
    }
    
    return { chartData, topSkills, skillsByPeriod, skillMarketDemand, targetCategory };
  }, [filteredAnalyses, profile?.target_category, marketData, getMarketDemand]);

  // Memoize radar data
  const radarData = useMemo(() => {
    if (filteredAnalyses.length === 0) {
      // Return default structure even if no analyses
      return [
        { category: 'Alignment', value: 0 },
        { category: 'Readiness', value: 0 },
        { category: 'Impact', value: 0 },
        { category: 'Potential', value: 0 },
      ];
    }

    // Use latest analysis for dynamic radar chart
    const latestAnalysis = filteredAnalyses[0];

    return [
      { category: 'Alignment', value: Math.max(0, Math.round(latestAnalysis.subscores?.alignment || 0)) },
      { category: 'Readiness', value: Math.max(0, Math.round(latestAnalysis.readiness_overall || 0)) },
      { category: 'Impact', value: Math.max(0, Math.round(latestAnalysis.subscores?.impact || 0)) },
      { category: 'Potential', value: Math.max(0, Math.round(latestAnalysis.subscores?.potential || 0)) },
      // Add ATS if available
      ...(latestAnalysis.subscores?.ats ? [{ category: 'ATS', value: Math.max(0, Math.round(latestAnalysis.subscores.ats)) }] : []),
    ];
  }, [filteredAnalyses]);

  // Memoize readiness distribution
  const readinessDistribution = useMemo(() => {
    if (filteredAnalyses.length === 0) {
      // Return empty structure
      return {
        data: [],
        current: 0,
        projected: 0,
        evidence: '',
        historical: [],
        projectedDate: null
      };
    }
    
    // Limit to last 20 analyses for performance
    const analysesToProcess = filteredAnalyses.slice(0, 20);
    
    // Historical readiness scores over time
    const historicalData = analysesToProcess
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((a, index) => ({
        period: `Analysis ${index + 1}`,
        readiness: a.readiness_overall || 0,
        date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
    
    // If only one analysis, create a baseline point before it
    if (historicalData.length === 1) {
      const singleDate = new Date(historicalData[0].date);
      singleDate.setDate(singleDate.getDate() - 7); // 7 days before
      historicalData.unshift({
        period: 'Baseline',
        readiness: Math.max(0, historicalData[0].readiness - 5), // Slightly lower baseline
        date: singleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    
    // Calculate improvement potential based on missing skills and learning resources
    const latestAnalysis = filteredAnalyses[0];
    let projectedReadiness = latestAnalysis.readiness_overall;
    let improvementEvidence = '';
    let projectedDate: Date | null = null;
    
    if (latestAnalysis.missing_skills && latestAnalysis.missing_skills.length > 0) {
      // Calculate potential improvement based on learnable skills
      const learnableSkills = latestAnalysis.missing_skills.filter((ms: any) => 
        ms.priority === 'required' && ms.resources && ms.resources.length > 0
      );
      
      // Estimate improvement: each learnable required skill could improve readiness by 5-10%
      // Based on how many required skills are missing vs total required
      const totalRequired = latestAnalysis.missing_skills.filter((ms: any) => ms.priority === 'required').length;
      const learnableRequired = learnableSkills.length;
      
      if (totalRequired > 0 && learnableRequired > 0) {
        // Estimate: learning all learnable required skills could improve readiness
        // by a percentage based on the ratio of learnable to total required
        const improvementRatio = learnableRequired / totalRequired;
        const potentialImprovement = Math.min(improvementRatio * 30, 25); // Max 25% improvement
        projectedReadiness = Math.min(Math.round(latestAnalysis.readiness_overall + potentialImprovement), 100);
        
        // Estimate time to achieve improvement: 2-4 weeks per skill, average 3 weeks
        // For multiple skills, assume some parallel learning (reduce by 20% for overlap)
        const estimatedWeeks = Math.ceil(learnableRequired * 3 * 0.8);
        const latestDate = new Date(latestAnalysis.created_at);
        projectedDate = new Date(latestDate.getTime() + estimatedWeeks * 7 * 24 * 60 * 60 * 1000);
        
        improvementEvidence = `Based on ${learnableRequired} learnable required skills with available resources. ` +
          `Learning these could improve readiness by up to ${Math.round(potentialImprovement)}% ` +
          `in approximately ${estimatedWeeks} ${estimatedWeeks === 1 ? 'week' : 'weeks'}.`;
      }
    }
    
    // Prepare data with separate fields for historical and projected
    const chartData = historicalData.map(d => ({ 
      range: d.date, 
      historical: d.readiness,
      projected: null
    }));
    
    // Add projected point - show transition from current to projected
    if (projectedReadiness > latestAnalysis.readiness_overall && projectedDate) {
      // Add current point again to create smooth transition
      const lastDate = historicalData.length > 0 
        ? historicalData[historicalData.length - 1].date 
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      chartData.push({
        range: lastDate,
        historical: latestAnalysis.readiness_overall,
        projected: null
      });
      
      // Add projected point with approximate date
      const projectedDateLabel = projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartData.push({
        range: `~${projectedDateLabel}`,
        historical: null,
        projected: projectedReadiness
      });
    }
    
    return {
      data: chartData,
      current: latestAnalysis.readiness_overall,
      projected: projectedReadiness,
      evidence: improvementEvidence,
      historical: historicalData,
      projectedDate: projectedDate
    };
  }, [filteredAnalyses]);

  // Memoize top missing skills computation - optimized with caching
  const topMissingSkills = useMemo(() => {
    if (filteredAnalyses.length === 0) return [];
    
    const skillCounts: Record<string, { count: number; demand: number; priority: string }> = {};
    const demandCache = new Map<string, number>(); // Cache market demand lookups

    // Always include latest analysis data
    const latestAnalysis = filteredAnalyses[0];
    
    // Limit to last 5 analyses for performance (reduced from 10)
    const analysesToProcess = filteredAnalyses.slice(0, 5);
    
    analysesToProcess.forEach((a) => {
      if (a.missing_skills && Array.isArray(a.missing_skills)) {
        a.missing_skills.forEach((ms: any) => {
          const skill = normalizeSkill(ms.skill || ms);
          if (skill && skill.length > 0) {
            if (!skillCounts[skill]) {
              skillCounts[skill] = { count: 0, demand: 0, priority: ms.priority || 'preferred' };
            }
            skillCounts[skill].count += 1;
            const demand = demandCache.has(skill) 
              ? demandCache.get(skill)! 
              : (() => {
                  const d = getMarketDemand(skill);
                  demandCache.set(skill, d);
                  return d;
                })();
            skillCounts[skill].demand = Math.max(skillCounts[skill].demand, demand);
            // Use highest priority (required > preferred)
            if (ms.priority === 'required' && skillCounts[skill].priority !== 'required') {
              skillCounts[skill].priority = 'required';
            }
          }
        });
      }
    });

    // If no skills found, use latest analysis missing skills directly
    if (Object.keys(skillCounts).length === 0 && latestAnalysis.missing_skills && Array.isArray(latestAnalysis.missing_skills)) {
      latestAnalysis.missing_skills.forEach((ms: any) => {
        const skill = normalizeSkill(ms.skill || ms);
        if (skill && skill.length > 0) {
          const demand = demandCache.has(skill) 
            ? demandCache.get(skill)! 
            : (() => {
                const d = getMarketDemand(skill);
                demandCache.set(skill, d);
                return d;
              })();
          skillCounts[skill] = {
            count: 1,
            demand,
            priority: ms.priority || 'preferred'
          };
        }
      });
    }

    const result = Object.entries(skillCounts)
      .map(([skill, data]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        count: Math.max(data.count, 1), // Ensure at least 1 for visibility
        demand: data.demand,
        priority: data.priority
      }))
      .sort((a, b) => {
        // Sort by priority first (required first), then by count, then by demand
        if (a.priority === 'required' && b.priority !== 'required') return -1;
        if (a.priority !== 'required' && b.priority === 'required') return 1;
        if (b.count !== a.count) return b.count - a.count;
        return b.demand - a.demand;
      })
      .slice(0, 10);
    
    // Ensure we have at least some data - if still empty, create placeholder from latest analysis
    if (result.length === 0 && latestAnalysis.missing_skills && Array.isArray(latestAnalysis.missing_skills) && latestAnalysis.missing_skills.length > 0) {
      return latestAnalysis.missing_skills.slice(0, 10).map((ms: any) => {
        const skill = normalizeSkill(ms.skill || ms);
        const demand = demandCache.has(skill || '') 
          ? demandCache.get(skill || '')! 
          : (() => {
              const d = getMarketDemand(skill || '');
              demandCache.set(skill || '', d);
              return d;
            })();
        return {
          skill: skill ? (skill.charAt(0).toUpperCase() + skill.slice(1)) : 'Unknown',
          count: 1,
          demand,
          priority: ms.priority || 'preferred'
        };
      });
    }
    
    return result;
  }, [filteredAnalyses, marketData, getMarketDemand]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Metrics Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and insights</p>
        </div>
        <Button onClick={() => router.push('/analyze')}>
          <Plus className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
      </div>

      <div className="flex gap-4 mb-8">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {seedRoles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAnalyses.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Hot Skills Over Time</CardTitle>
                <CardDescription>
                  {skillsOverTimeData.targetCategory 
                    ? `Industry-relevant skills for ${skillsOverTimeData.targetCategory} - showing current market demand`
                    : 'Most frequently identified skills across your analyses - set target industry in profile for personalized view'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const skillsData = skillsOverTimeData;
                  // Always show chart if we have at least one analysis, even if data is minimal
                  if (filteredAnalyses.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No analyses available. Complete an analysis to see skill trends.
                      </div>
                    );
                  }
                  
                  // If no chart data but we have analyses, create minimal data from latest
                  if (skillsData.chartData.length === 0 && filteredAnalyses.length > 0) {
                    const latestAnalysis = filteredAnalyses[0];
                    if (latestAnalysis.missing_skills && latestAnalysis.missing_skills.length > 0) {
                      const date = new Date(latestAnalysis.created_at);
                      const periodLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                      const topSkillsFromLatest = latestAnalysis.missing_skills
                        .slice(0, 5)
                        .map((ms: any) => normalizeSkill(ms.skill || ms))
                        .filter((s: string) => s && s.length > 0);
                      
                      if (topSkillsFromLatest.length > 0) {
                        const dataPoint: any = { period: periodLabel };
                        topSkillsFromLatest.forEach((skill: string) => {
                          dataPoint[skill] = 1;
                          (skillsData.skillMarketDemand as any)[skill] = getMarketDemand(skill);
                        });
                        skillsData.chartData = [dataPoint];
                        skillsData.topSkills = topSkillsFromLatest;
                      }
                    }
                  }
                  
                  if (skillsData.chartData.length === 0 || skillsData.topSkills.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        {skillsData.targetCategory 
                          ? `No ${skillsData.targetCategory} relevant skills found in your analyses yet`
                          : 'No skills data available. Complete more analyses to see skill trends.'}
                      </div>
                    );
                  }
                  
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                  
                  return (
                    <>
                <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={skillsData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any, name: string) => {
                              const skill = name;
                              const demand = (skillsData.skillMarketDemand as any)[skill];
                              return demand 
                                ? [`${value} times (${demand.toLocaleString()}+ jobs)`, skill]
                                : [`${value} times`, skill];
                            }}
                          />
                          <Legend 
                            formatter={(value: string) => {
                              const skill = value.charAt(0).toUpperCase() + value.slice(1);
                              const demand = (skillsData.skillMarketDemand as any)[value];
                              return demand ? `${skill} (${demand.toLocaleString()}+ jobs)` : skill;
                            }}
                          />
                          {skillsData.topSkills.map((skill, index) => (
                            <Line
                              key={skill}
                              type="monotone"
                              dataKey={skill}
                              stroke={colors[index % colors.length]}
                              strokeWidth={2}
                              name={skill}
                            />
                          ))}
                  </LineChart>
                </ResponsiveContainer>
                      <div className="mt-4 text-xs text-muted-foreground space-y-1">
                        <p className="font-medium">
                          {skillsData.targetCategory 
                            ? `Why these ${skillsData.targetCategory} skills matter:`
                            : 'Why these skills matter:'}
                        </p>
                        {skillsData.topSkills.slice(0, 3).map((skill, index) => {
                          const demand = (skillsData.skillMarketDemand as any)[skill];
                          const analysis = filteredAnalyses.find((a) => 
                            a.missing_skills?.some((ms: any) => 
                              (ms.skill || ms).toLowerCase() === skill
                            )
                          );
                          const explanation = analysis?.meta?.market_analysis?.explanations?.find(
                            (exp: any) => exp.skill.toLowerCase() === skill
                          );
                          
                          const isHotSkill = demand > 5000;
                          const hotSkillLabel = isHotSkill ? '🔥 Hot Skill' : '';
                          
                          return (
                            <p key={skill} className="pl-2 border-l-2" style={{ borderColor: colors[index % colors.length] }}>
                              <span className="font-medium capitalize">{skill}</span>
                              {hotSkillLabel && <span className="ml-1 text-amber-600">{hotSkillLabel}</span>}
                              {': '}
                              {explanation?.reason || 
                               (demand ? `Currently in high demand with ${demand.toLocaleString()}+ job postings. ${skillsData.targetCategory ? `Essential for ${skillsData.targetCategory} roles.` : 'Highly relevant for your career growth.'}` : 
                                'Frequently identified as a gap across your analyses.')}
                            </p>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscore Radar</CardTitle>
                <CardDescription>Latest analysis performance across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Readiness Trend & Projection</CardTitle>
                <CardDescription>Historical readiness and potential improvement</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const readinessData = readinessDistribution;
                  if (!readinessData || !readinessData.data || readinessData.data.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No readiness data available
                      </div>
                    );
                  }
                  
                  return (
                    <>
                <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={readinessData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip 
                            formatter={(value: any, name: string, props: any) => {
                              if (name === 'projected' && value) {
                                const dateLabel = props.payload?.range || 'Projected';
                                return [`${value}% (Projected)`, `Projected Readiness - ${dateLabel}`];
                              }
                              if (name === 'historical' && value) {
                                return [`${value}%`, 'Historical Readiness'];
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="historical" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            dot={{ fill: '#f59e0b', r: 4 }}
                            name="Historical"
                            connectNulls={false}
                          />
                          {readinessData.projected > readinessData.current && (
                            <Line 
                              type="monotone" 
                              dataKey="projected" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ fill: '#10b981', r: 4 }}
                              name="Projected"
                              connectNulls={false}
                            />
                          )}
                        </LineChart>
                </ResponsiveContainer>
                      {readinessData.evidence && (
                        <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            <strong>Projection Evidence:</strong> {readinessData.evidence}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Current: {readinessData.current}% → Projected: {readinessData.projected}% 
                            ({readinessData.projected - readinessData.current > 0 ? '+' : ''}{readinessData.projected - readinessData.current}%)
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Missing Skills</CardTitle>
                <CardDescription>Most frequently missing across analyses</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const topSkills = topMissingSkills;
                  if (!topSkills || topSkills.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No missing skills data available
                      </div>
                    );
                  }
                  
                  return (
                <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topSkills} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                        <YAxis dataKey="skill" type="category" width={120} />
                        <Tooltip 
                          formatter={(value: any, payload: any) => {
                            if (payload && payload[0]) {
                              const demand = payload[0].payload?.demand || 0;
                              const priority = payload[0].payload?.priority || 'preferred';
                              return [
                                `${value} ${value === 1 ? 'time' : 'times'}${demand > 0 ? ` • ${demand.toLocaleString()}+ opportunities` : ''}${priority === 'required' ? ' • Required' : ''}`,
                                'Frequency'
                              ];
                            }
                            return [value, 'Frequency'];
                          }}
                        />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {filteredAnalyses.length > 0 && (() => {
            const latestAnalysis = filteredAnalyses[0];
            const previousAnalyses = filteredAnalyses.slice(1);
            const role = seedRoles.find((r) => r.id === latestAnalysis.role_id);
            const hasResume = latestAnalysis.subscores?.ats > 0;
            const overall = hasResume
              ? Math.round(
                  (latestAnalysis.subscores?.alignment || 0) * 0.35 +
                  (latestAnalysis.readiness_overall || 0) * 0.25 +
                  (latestAnalysis.subscores?.ats || 0) * 0.15 +
                  (latestAnalysis.subscores?.impact || 0) * 0.15 +
                  ((latestAnalysis.subscores?.polish || 0) * 0.1)
                )
              : Math.round(
                  (latestAnalysis.subscores?.alignment || 0) * 0.5 +
                  (latestAnalysis.readiness_overall || 0) * 0.3 +
                  (latestAnalysis.subscores?.impact || 0) * 0.2
                );
            
            // Default to 'resources' tab for latest analysis if not set
            const activeTab = activeTabs[latestAnalysis.id] || 'resources';
            
            return (
              <>
                {/* Latest Analysis - Full Details */}
          <Card className="mb-8">
            <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <CardTitle className="text-xl">{latestAnalysis.jd_title}</CardTitle>
                        <CardDescription>
                          {role?.title || 'Unknown'} • {new Date(latestAnalysis.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <ScoreRing score={overall} size="sm" />
                          <p className="text-xs text-muted-foreground mt-1">Overall</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/results/${latestAnalysis.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
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
                          onClick={() => setActiveTab(latestAnalysis.id, 'resources')}
                        >
                          Resources
                        </Button>
                        <Button
                          variant={activeTab === 'market' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setActiveTab(latestAnalysis.id, 'market')}
                        >
                          Market Analysis
                        </Button>
                      </div>
                    </div>
            </CardHeader>
            <CardContent>
                    {activeTab === 'resources' && latestAnalysis.missing_skills.length > 0 && (
                      <div className="space-y-3">
                        {latestAnalysis.missing_skills.map((ms: any, i: number) => {
                          const marketExplanation = latestAnalysis.meta?.market_analysis?.explanations?.find(
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

                    {activeTab === 'market' && (
                      <div className="space-y-3">
                        {latestAnalysis.meta?.market_analysis ? (
                          <>
                            {latestAnalysis.meta.market_analysis.skillGaps && (
                              <div className="p-3 bg-primary/5 rounded-lg">
                                <p className="text-sm font-medium mb-1">Recommended Learning Path:</p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {latestAnalysis.meta.market_analysis.skillGaps.learningPath}
                                </p>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>Total gaps: {latestAnalysis.meta.market_analysis.skillGaps.total}</span>
                                  <span>Critical: {latestAnalysis.meta.market_analysis.skillGaps.critical}</span>
                                </div>
                              </div>
                            )}
                            {latestAnalysis.meta.market_analysis.explanations && latestAnalysis.meta.market_analysis.explanations.length > 0 ? (
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">Skill Recommendations Explained:</h4>
                                {latestAnalysis.meta.market_analysis.explanations.map((exp: any, i: number) => {
                                  // Use cached market demand lookup
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
                            ) : (
                              <div className="p-4 text-center text-muted-foreground">
                                <p className="text-sm">No market analysis explanations available for this analysis.</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            <p className="text-sm mb-2">Market analysis data not available for this analysis.</p>
                            <p className="text-xs">Market insights are generated during analysis. Try creating a new analysis to see market data.</p>
                          </div>
                        )}
                      </div>
                    )}
            </CardContent>
          </Card>

                {/* Previous Analyses - Summary Table */}
                {previousAnalyses.length > 0 && (
          <Card>
            <CardHeader>
                      <CardTitle>Previous Analyses</CardTitle>
                      <CardDescription>Summary of your past analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead className="text-right">Overall</TableHead>
                    <TableHead className="text-right">Readiness</TableHead>
                    <TableHead className="text-right">Alignment</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                          {previousAnalyses.map((analysis) => {
                            const analysisRole = seedRoles.find((r) => r.id === analysis.role_id);
                            const analysisHasResume = analysis.subscores?.ats > 0;
                            const analysisOverall = analysisHasResume
                              ? Math.round(
                                  (analysis.subscores?.alignment || 0) * 0.35 +
                        (analysis.readiness_overall || 0) * 0.25 +
                                  (analysis.subscores?.ats || 0) * 0.15 +
                                  (analysis.subscores?.impact || 0) * 0.15 +
                                  ((analysis.subscores?.polish || 0) * 0.1)
                                )
                              : Math.round(
                                  (analysis.subscores?.alignment || 0) * 0.5 +
                                  (analysis.readiness_overall || 0) * 0.3 +
                                  (analysis.subscores?.impact || 0) * 0.2
                                );
                            
                    return (
                      <TableRow
                        key={analysis.id}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => router.push(`/results/${analysis.id}`)}
                      >
                        <TableCell>
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </TableCell>
                                <TableCell>{analysisRole?.title || 'Unknown'}</TableCell>
                        <TableCell>{analysis.jd_title}</TableCell>
                                <TableCell className="text-right font-medium">{analysisOverall}</TableCell>
                        <TableCell className="text-right">{analysis.readiness_overall}</TableCell>
                        <TableCell className="text-right">{analysis.subscores?.alignment || 0}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/results/${analysis.id}`);
                                    }}
                                  >
                                    View
                                  </Button>
                                </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
                )}
              </>
            );
          })()}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No analyses yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by analyzing your first role to see metrics here
            </p>
            <Button onClick={() => router.push('/analyze')}>
              Create Your First Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

