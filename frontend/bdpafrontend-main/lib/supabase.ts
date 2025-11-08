// Local Storage Supabase Replacement
// Provides a Supabase-like interface but uses local storage

import { localAuth } from './local-auth';
import { localStorage as localDB } from './local-storage';

// Mock Supabase client interface
export const supabase = {
  auth: {
    signUp: async (options: { email: string; password: string }) => {
      const { user, error } = await localAuth.signUp(options.email, options.password);
      return {
        data: user ? { user } : null,
        error: error ? { message: error.message } : null,
      };
    },
    signInWithPassword: async (options: { email: string; password: string }) => {
      const { user, error } = await localAuth.signIn(options.email, options.password);
      return {
        data: user ? { user } : null,
        error: error ? { message: error.message } : null,
      };
    },
    signOut: async () => {
      await localAuth.signOut();
      return { error: null };
    },
    getUser: async () => {
      const user = await localAuth.getUser();
      return {
        data: { user },
        error: null,
      };
    },
    resetPasswordForEmail: async (email: string) => {
      const { error } = await localAuth.resetPassword(email);
      return { error: error ? { message: error.message } : null };
    },
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          const result = await localDB.selectOne(table, column, value);
          return { data: result, error: result ? null : { code: 'PGRST116' } };
        },
        maybeSingle: async () => {
          const result = await localDB.selectOne(table, column, value);
          return { data: result || null, error: null };
        },
        then: async (callback: any) => {
          const results = await localDB.select(table, { field: column, value });
          return callback({ data: results, error: null });
        },
      }),
      order: (column: string, options?: { ascending: boolean }) => ({
        then: async (callback: any) => {
          const results = await localDB.select(table);
          const sorted = results.sort((a: any, b: any) => {
            const aVal = a[column];
            const bVal = b[column];
            if (options?.ascending === false) {
              return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          });
          return callback({ data: sorted, error: null });
        },
      }),
      then: async (callback: any) => {
        const results = await localDB.select(table);
        return callback({ data: results, error: null });
      },
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          const result = await localDB.insert(table, data);
          return { data: result, error: null };
        },
        then: async (callback: any) => {
          const result = await localDB.insert(table, data);
          return callback({ data: result, error: null });
        },
      }),
      then: async (callback: any) => {
        const result = await localDB.insert(table, data);
        return callback({ data: result, error: null });
      },
    }),
    upsert: (data: any, options?: { onConflict?: string }) => ({
      select: () => ({
        single: async () => {
          const result = await localDB.upsert(table, data);
          return { data: result, error: null };
        },
      }),
    }),
    update: (updates: any) => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => {
          const existing = await localDB.selectOne(table, column, value);
          if (!existing) {
            return callback({ data: null, error: { message: 'Not found' } });
          }
          const result = await localDB.update(table, column, value, updates);
          return callback({ data: result, error: null });
        },
        single: async () => {
          const existing = await localDB.selectOne(table, column, value);
          if (!existing) {
            return { data: null, error: { message: 'Not found' } };
          }
          const result = await localDB.update(table, column, value, updates);
          return { data: result, error: null };
        },
      }),
    }),
  }),
};

// Always use local storage (no cloud)
export const hasSupabaseCredentials = false;

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
          resume_text: string | null;
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
