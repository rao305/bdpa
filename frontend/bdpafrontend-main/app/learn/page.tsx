'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, ExternalLink, Calendar } from 'lucide-react';

interface Task {
  id: string;
  day: number;
  skill: string;
  task: string;
  completed: boolean;
}

export default function LearnPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [savedResources, setSavedResources] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    const { data: analyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('uid', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (analyses && analyses.length > 0) {
      const latestAnalysis = analyses[0];
      const generatedTasks = generateTasks(latestAnalysis.missing_skills.slice(0, 7));
      setTasks(generatedTasks);

      const resources = latestAnalysis.missing_skills
        .slice(0, 10)
        .flatMap((ms: any) =>
          (ms.resources || []).map((r: any) => ({
            ...r,
            skill: ms.skill,
          }))
        );
      setSavedResources(resources);
    }

    setLoading(false);
  };

  const generateTasks = (missingSkills: any[]): Task[] => {
    const tasks: Task[] = [];
    let dayCounter = 1;

    missingSkills.forEach((ms, index) => {
      tasks.push({
        id: `${ms.skill}-intro`,
        day: dayCounter++,
        skill: ms.skill,
        task: `Introduction to ${ms.skill}`,
        completed: false,
      });

      tasks.push({
        id: `${ms.skill}-practice`,
        day: dayCounter++,
        skill: ms.skill,
        task: `Practice exercises for ${ms.skill}`,
        completed: false,
      });
    });

    return tasks.slice(0, 14);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const inProgressTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Hub</h1>
        <p className="text-muted-foreground">
          Your personalized 14-day learning plan and saved resources
        </p>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="saved">
            Saved Resources ({savedResources.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          {inProgressTasks.length > 0 ? (
            inProgressTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Day {task.day}</Badge>
                      <Badge variant="secondary">{task.skill}</Badge>
                    </div>
                    <p className="font-medium">{task.task}</p>
                  </div>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Complete an analysis to generate your learning plan
                </p>
                <Button onClick={() => router.push('/analyze')}>
                  Start an Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {savedResources.length > 0 ? (
            savedResources.map((resource, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{resource.skill}</CardTitle>
                    <Badge>{resource.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {resource.title}
                  </a>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved resources</h3>
                <p className="text-muted-foreground text-center">
                  Resources from your analyses will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <Card key={task.id} className="opacity-60">
                <CardContent className="flex items-center gap-4 p-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Day {task.day}</Badge>
                      <Badge variant="secondary">{task.skill}</Badge>
                    </div>
                    <p className="font-medium line-through">{task.task}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed tasks yet</h3>
                <p className="text-muted-foreground text-center">
                  Completed tasks will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
