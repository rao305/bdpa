'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface SkillChipsProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function SkillChips({ skills, onChange, placeholder, suggestions = [] }: SkillChipsProps) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  const filteredSuggestions = suggestions.filter(
    (s) => !skills.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(input);
              }
            }}
            placeholder={placeholder || 'Type a skill and press Enter'}
          />
          <Button
            type="button"
            size="icon"
            onClick={() => addSkill(input)}
            disabled={!input.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 8).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent text-sm"
                onClick={() => addSkill(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-2 hover:bg-background/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
