import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface Profile {
  uid: string;
  first_time: boolean;
  is_student: boolean;
  year: string | null;
  major: string | null;
  skills: string[];
  coursework: string[];
  experience: Record<string, any>[];
  target_category: string | null;
}

interface AppState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
}));
