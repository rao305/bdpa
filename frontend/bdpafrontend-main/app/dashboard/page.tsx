'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { seedRoles } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, TrendingUp, FileText, Target, Award, Plus } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [analyses, roleFilter, dateFilter]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Use API endpoint instead of direct Supabase query
      const response = await fetch('/api/analyses');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth');
          return;
        }
        throw new Error('Failed to load analyses');
      }

      const data = await response.json();
      setAnalyses(data.analyses || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analyses:', error);
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

  const getTrendData = () => {
    return filteredAnalyses
      .slice()
      .reverse()
      .map((a) => {
        const overall = Math.round(
          ((a.subscores?.alignment || 0) * 0.35 +
            (a.readiness_overall || 0) * 0.25 +
            (a.subscores?.impact || 0) * 0.2 +
            (a.subscores?.potential || 0) * 0.2) || 0
        );
        return {
          date: new Date(a.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          score: overall,
        };
      });
  };

  const getRadarData = () => {
    if (filteredAnalyses.length === 0) return [];

    const avgAts =
      filteredAnalyses.reduce((sum, a) => sum + (a.subscores?.ats || 0), 0) /
      filteredAnalyses.length;
    const avgAlignment =
      filteredAnalyses.reduce((sum, a) => sum + (a.subscores?.alignment || 0), 0) /
      filteredAnalyses.length;
    const avgImpact =
      filteredAnalyses.reduce((sum, a) => sum + (a.subscores?.impact || 0), 0) /
      filteredAnalyses.length;
    const avgPolish =
      filteredAnalyses.reduce((sum, a) => sum + (a.subscores?.polish || 0), 0) /
      filteredAnalyses.length;
    const avgPotential =
      filteredAnalyses.reduce((sum, a) => sum + (a.subscores?.potential || 0), 0) /
      filteredAnalyses.length;
    const avgReadiness =
      filteredAnalyses.reduce((sum, a) => sum + (a.readiness_overall || 0), 0) /
      filteredAnalyses.length;

    return [
      { category: 'Alignment', value: Math.round(avgAlignment) },
      { category: 'Readiness', value: Math.round(avgReadiness) },
      { category: 'Impact', value: Math.round(avgImpact) },
      { category: 'Potential', value: Math.round(avgPotential) },
    ];
  };

  const getReadinessDistribution = () => {
    const buckets = [0, 0, 0, 0, 0];
    filteredAnalyses.forEach((a) => {
      const readiness = a.readiness_overall;
      if (readiness < 20) buckets[0]++;
      else if (readiness < 40) buckets[1]++;
      else if (readiness < 60) buckets[2]++;
      else if (readiness < 80) buckets[3]++;
      else buckets[4]++;
    });

    return [
      { range: '0-20', count: buckets[0] },
      { range: '20-40', count: buckets[1] },
      { range: '40-60', count: buckets[2] },
      { range: '60-80', count: buckets[3] },
      { range: '80-100', count: buckets[4] },
    ];
  };

  const getTopMissingSkills = () => {
    const skillCounts: Record<string, number> = {};

    filteredAnalyses.forEach((a) => {
      a.missing_skills.forEach((ms: any) => {
        skillCounts[ms.skill] = (skillCounts[ms.skill] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  };

  const getRoleDistribution = () => {
    const roleCounts: Record<string, number> = {};

    filteredAnalyses.forEach((a) => {
      const role = seedRoles.find((r) => r.id === a.role_id);
      const roleName = role?.title || 'Unknown';
      roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
    });

    return Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const kpis = calculateKPIs();
  const { avgReadiness } = calculateKPIs();

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Overall Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgOverall}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.count}</div>
            <p className="text-xs text-muted-foreground">Roles analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Alignment</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgAlignment}</div>
            <p className="text-xs text-muted-foreground">JD keyword match</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Readiness</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgReadiness}</div>
            <p className="text-xs text-muted-foreground">Skills met</p>
          </CardContent>
        </Card>
      </div>

      {filteredAnalyses.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Score Trend</CardTitle>
                <CardDescription>Overall score over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscore Radar</CardTitle>
                <CardDescription>Average performance across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData()}>
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
                <CardTitle>Readiness Distribution</CardTitle>
                <CardDescription>Score ranges across analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getReadinessDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Missing Skills</CardTitle>
                <CardDescription>Most frequently missing across analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTopMissingSkills()} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="skill" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Role Coverage</CardTitle>
              <CardDescription>Distribution of analyzed roles</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getRoleDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getRoleDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Analyses</CardTitle>
              <CardDescription>Click a row to view details</CardDescription>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalyses.map((analysis) => {
                    const role = seedRoles.find((r) => r.id === analysis.role_id);
                    const overall = Math.round(
                      ((analysis.subscores?.alignment || 0) * 0.35 +
                        (analysis.readiness_overall || 0) * 0.25 +
                        (analysis.subscores?.impact || 0) * 0.2 +
                        (analysis.subscores?.potential || 0) * 0.2) || 0
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
                        <TableCell>{role?.title || 'Unknown'}</TableCell>
                        <TableCell>{analysis.jd_title}</TableCell>
                        <TableCell className="text-right font-medium">{overall}</TableCell>
                        <TableCell className="text-right">{analysis.readiness_overall}</TableCell>
                        <TableCell className="text-right">{analysis.subscores?.alignment || 0}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
