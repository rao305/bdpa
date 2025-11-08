import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          uid: string;
          first_time: boolean;
          is_student: boolean;
          year: string | null;
          major: string | null;
          skills: string[];
          coursework: string[];
          experience: Record<string, any>[];
          target_category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      roles: {
        Row: {
          id: string;
          title: string;
          category: string;
          description: string | null;
          requirements: Record<string, any>[];
          created_at: string;
        };
      };
      resources: {
        Row: {
          id: string;
          skill: string;
          title: string;
          url: string;
          type: string;
          created_at: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          uid: string;
          role_id: string | null;
          jd_title: string;
          jd_text: string;
          readiness_overall: number;
          subscores: Record<string, number>;
          strengths: string[];
          improvements: string[];
          missing_skills: Record<string, any>[];
          meta: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['analyses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['analyses']['Insert']>;
      };
    };
  };
};
