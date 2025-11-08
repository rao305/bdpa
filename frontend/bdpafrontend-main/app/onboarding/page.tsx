'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { normalizeSkills, extractSkillsFromText, buildDictionary } from '@/lib/normalization';
import { seedRoles, seedResources } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResumeDropzone } from '@/components/onboarding/resume-dropzone';
import { SkillChips } from '@/components/onboarding/skill-chips';
import { Loader2 } from 'lucide-react';

const commonSkills = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Docker', 'Kubernetes',
  'AWS', 'Java', 'C++', 'Data Structures', 'Algorithms'
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'path' | 'details'>('path');
  const [path, setPath] = useState<'resume' | 'manual'>('manual');

  const [isStudent, setIsStudent] = useState(true);
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [coursework, setCoursework] = useState<string[]>([]);
  const [experience, setExperience] = useState<Array<{ type: string; duration: string; description: string }>>([]);
  const [targetCategory, setTargetCategory] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setLoading(false);
  };

  const handleResumeExtracted = (text: string) => {
    const dictionary = buildDictionary(seedRoles, seedResources);
    const extractedSkills = extractSkillsFromText(text, dictionary);
    setSkills(extractedSkills);
    setStep('details');
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const normalizedSkills = normalizeSkills(skills);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_time: false,
        is_student: isStudent,
        year: isStudent ? year : null,
        major: isStudent ? major : null,
        skills: normalizedSkills,
        coursework,
        experience,
        target_category: targetCategory,
      })
      .eq('uid', user.id);

    setSaving(false);

    if (!error) {
      router.push('/analyze');
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
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to GapFixer</h1>
        <p className="text-muted-foreground">Let's build your skill profile</p>
      </div>

      {step === 'path' && (
        <Card>
          <CardHeader>
            <CardTitle>How would you like to get started?</CardTitle>
            <CardDescription>Choose your preferred method to build your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={path} onValueChange={(v) => setPath(v as 'resume' | 'manual')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="resume" id="resume" />
                <Label htmlFor="resume" className="cursor-pointer">
                  Upload Resume (PDF) - We'll extract your skills automatically
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="cursor-pointer">
                  Enter Manually - Fill out your information step by step
                </Label>
              </div>
            </RadioGroup>

            {path === 'resume' && (
              <ResumeDropzone onTextExtracted={handleResumeExtracted} />
            )}

            {path === 'manual' && (
              <Button onClick={() => setStep('details')} className="w-full">
                Continue
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
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
              <CardDescription>Add programming languages, frameworks, and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillChips
                skills={skills}
                onChange={setSkills}
                placeholder="e.g., Python, JavaScript, React..."
                suggestions={commonSkills}
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
            <Button variant="outline" onClick={() => setStep('path')} disabled={saving}>
              Back
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
