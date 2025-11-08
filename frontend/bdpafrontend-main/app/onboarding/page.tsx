'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { normalizeSkills, extractSkillsFromText, buildDictionary } from '@/lib/normalization';
import { seedRoles, seedResources } from '@/lib/seed-data';
import { parseResumeText } from '@/lib/resume-parser';
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
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      
      // User is authenticated - show onboarding form
      // Don't redirect away even if profile exists - let them complete/update it
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/auth');
    }
  };

  const handleResumeExtracted = async (text: string) => {
    try {
      const dictionary = buildDictionary(seedRoles, seedResources);
      
      // Parse resume to extract all information
      const parsed = parseResumeText(text, dictionary);
      
      console.log('📄 Resume parsed successfully:', {
        skillsCount: parsed.skills.length,
        courseworkCount: parsed.coursework.length,
        experienceCount: parsed.experience.length,
        skills: parsed.skills.slice(0, 10),
        coursework: parsed.coursework.slice(0, 5),
      });
      
      // Normalize and auto-fill skills (ensure unique, properly formatted)
      // First normalize for matching, then format for display
      const normalizedSkills = normalizeSkills(parsed.skills);
      // Format skills for better display (capitalize properly)
      const formattedSkills = normalizedSkills.map(skill => {
        // Handle special cases (e.g., "JavaScript", "C++", "Node.js")
        if (skill.includes('javascript')) return 'JavaScript';
        if (skill.includes('typescript')) return 'TypeScript';
        if (skill.includes('python')) return 'Python';
        if (skill.includes('java') && !skill.includes('javascript')) return 'Java';
        if (skill.includes('c++')) return 'C++';
        if (skill.includes('node.js') || skill.includes('nodejs')) return 'Node.js';
        if (skill.includes('react')) return 'React';
        if (skill.includes('tensorflow')) return 'TensorFlow';
        if (skill.includes('pytorch')) return 'PyTorch';
        if (skill.includes('machine learning')) return 'Machine Learning';
        if (skill.includes('deep learning')) return 'Deep Learning';
        if (skill.includes('data science')) return 'Data Science';
        if (skill.includes('artificial intelligence')) return 'Artificial Intelligence';
        // Capitalize first letter of each word
        return skill.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      });
      const uniqueSkills = Array.from(new Set(formattedSkills.filter(s => s.length > 0)));
      setSkills(uniqueSkills);
      setResumeText(text);
      
      console.log('✅ Auto-filled skills:', uniqueSkills.length, 'skills:', uniqueSkills.slice(0, 10));
      
      // Auto-fill education
      if (parsed.education.major) {
        setMajor(parsed.education.major);
        console.log('✅ Auto-filled major:', parsed.education.major);
      }
      if (parsed.education.year) {
        // Calculate year level from graduation year
        const currentYear = new Date().getFullYear();
        const gradYear = parseInt(parsed.education.year);
        const yearsUntilGrad = gradYear - currentYear;
        
        // Map years until graduation to year level
        if (yearsUntilGrad === 0 || yearsUntilGrad === 1) {
          setYear('Senior');
        } else if (yearsUntilGrad === 2) {
          setYear('Junior');
        } else if (yearsUntilGrad === 3) {
          setYear('Sophomore');
        } else if (yearsUntilGrad === 4 || yearsUntilGrad === 5) {
          setYear('Freshman');
        } else if (yearsUntilGrad < 0 && yearsUntilGrad >= -1) {
          // Recently graduated or graduating soon
          setYear('Senior');
        }
        console.log('✅ Auto-filled year:', parsed.education.year);
      }
      
      // Auto-fill coursework (ensure unique, properly formatted)
      if (parsed.coursework.length > 0) {
        const uniqueCoursework = Array.from(new Set(
          parsed.coursework.map(c => c.trim()).filter(c => c.length > 0)
        ));
        setCoursework(uniqueCoursework);
        console.log('✅ Auto-filled coursework:', uniqueCoursework.length, 'courses');
      }
      
      // Auto-fill experience
      if (parsed.experience.length > 0) {
        setExperience(parsed.experience);
        console.log('✅ Auto-filled experience:', parsed.experience.length, 'entries');
      }
      
      // Auto-select target category if inferred
      if (parsed.targetCategory) {
        setTargetCategory(parsed.targetCategory);
        console.log('✅ Auto-selected target category:', parsed.targetCategory);
      }
      
      // Move to questionnaire step - fields are pre-filled but user can edit
      setStep('details');
    } catch (error) {
      console.error('Error parsing resume:', error);
      // Fallback to basic skill extraction
      const dictionary = buildDictionary(seedRoles, seedResources);
      const extractedSkills = extractSkillsFromText(text, dictionary);
      const normalizedSkills = normalizeSkills(extractedSkills);
      const uniqueSkills = Array.from(new Set(normalizedSkills.map(s => s.trim()).filter(s => s.length > 0)));
      setSkills(uniqueSkills);
      setResumeText(text);
      console.log('⚠️ Fallback: Extracted', uniqueSkills.length, 'skills');
      setStep('details');
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!targetCategory) {
      alert('Please select a target industry');
      return;
    }

    if (skills.length === 0) {
      alert('Please add at least one skill');
      return;
    }

    if (isStudent && (!year || !major)) {
      alert('Please fill in all student information (year and major)');
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const normalizedSkills = normalizeSkills(skills);

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_time: false,
          is_student: isStudent,
          year: isStudent ? year : null,
          major: isStudent ? major : null,
          skills: normalizedSkills,
          coursework,
          experience,
          target_category: targetCategory,
          resume_text: resumeText || null,
        }),
      });

      const result = await response.json();

      if (result.error) {
        console.error('Error saving profile:', result.error);
        alert('Failed to save profile. Please try again.');
        setSaving(false);
        return;
      }

      // Success - redirect to analyze page
      router.push('/analyze');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
      setSaving(false);
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
          {resumeText && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Resume uploaded successfully! Information has been extracted and auto-filled below.
                  </p>
                  <div className="text-xs text-green-700 space-y-1">
                    {skills.length > 0 && <p>• {skills.length} skill{skills.length !== 1 ? 's' : ''} extracted</p>}
                    {coursework.length > 0 && <p>• {coursework.length} course{coursework.length !== 1 ? 's' : ''} extracted</p>}
                    {major && <p>• Major: {major}</p>}
                    {year && <p>• Year: {year}</p>}
                    {targetCategory && <p>• Target: {targetCategory}</p>}
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Please review and edit the information below, then complete the setup.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Please fill out all required fields</CardDescription>
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
