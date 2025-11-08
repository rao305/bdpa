'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { normalizeSkills } from '@/lib/normalization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SkillChips } from '@/components/onboarding/skill-chips';
import { Loader2, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [isStudent, setIsStudent] = useState(true);
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [coursework, setCoursework] = useState<string[]>([]);
  const [targetCategory, setTargetCategory] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.push('/auth');
      return;
    }

    setUser(authUser);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', authUser.id)
      .maybeSingle();

    if (profile) {
      setIsStudent(profile.is_student || false);
      setYear(profile.year || '');
      setMajor(profile.major || '');
      setSkills(profile.skills || []);
      setCoursework(profile.coursework || []);
      setTargetCategory(profile.target_category || '');
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const normalizedSkills = normalizeSkills(skills);

    const { error } = await supabase
      .from('profiles')
      .update({
        is_student: isStudent,
        year: isStudent ? year : null,
        major: isStudent ? major : null,
        skills: normalizedSkills,
        coursework,
        target_category: targetCategory,
      })
      .eq('uid', user.id);

    setSaving(false);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Are you a student?</Label>
              <RadioGroup value={isStudent ? 'yes' : 'no'} onValueChange={(v) => setIsStudent(v === 'yes')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="student-yes" />
                  <Label htmlFor="student-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="student-no" />
                  <Label htmlFor="student-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>

            {isStudent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Sophomore">Sophomore</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Select value={major} onValueChange={setMajor}>
                    <SelectTrigger id="major">
                      <SelectValue placeholder="Select major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Information Systems">Information Systems</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="target">Target Industry</Label>
              <Select value={targetCategory} onValueChange={setTargetCategory}>
                <SelectTrigger id="target">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Data">Data Science</SelectItem>
                  <SelectItem value="SWE">Software Engineering</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Robotics">Robotics</SelectItem>
                  <SelectItem value="Game Dev">Game Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills & Tools</CardTitle>
            <CardDescription>Programming languages, frameworks, and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillChips
              skills={skills}
              onChange={setSkills}
              placeholder="e.g., Python, JavaScript, React..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coursework</CardTitle>
            <CardDescription>Relevant courses you've completed</CardDescription>
          </CardHeader>
          <CardContent>
            <SkillChips
              skills={coursework}
              onChange={setCoursework}
              placeholder="e.g., Data Structures, Machine Learning..."
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
