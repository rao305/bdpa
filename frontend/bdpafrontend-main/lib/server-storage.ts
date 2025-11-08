// Server-side storage using Supabase
import { createSupabaseServerClient } from './supabase-server';
import type { Database } from './supabase-types';

// Use authenticated client for user operations
async function getSupabaseClient() {
  return await createSupabaseServerClient();
}

export const serverStorage = {
  async getUserByEmail(email: string) {
    try {
      const supabase = await getSupabaseClient();
      // For regular users, we can only get current user, not list all users
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user || user.email !== email) {
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return null;
    }
  },

  async getUserById(id: string) {
    try {
      const supabase = await getSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user || user.id !== id) {
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  },

  // Note: createUser removed as it requires admin privileges
  // User creation is handled by the authentication flow

  async getProfile(uid: string) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('uid', uid)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  },

  async saveProfile(profile: any) {
    try {
      console.log('💾 Attempting to save profile:', { uid: profile.uid, skillCount: profile.skills?.length });
      const supabase = await getSupabaseClient();
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'uid' })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Profile save failed:', error);
        throw new Error(`Failed to save profile: ${error.message}`);
      }
      
      console.log('✅ Profile saved successfully:', { id: data.uid });
      return data;
    } catch (error) {
      console.error('Error in saveProfile:', error);
      throw error;
    }
  },

  async getRole(roleId: string) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching role:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in getRole:', error);
      return null;
    }
  },

  async getAllRoles() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      return [];
    }
  },

  async saveRole(role: any) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to save role: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Error in saveRole:', error);
      throw error;
    }
  },

  async getResources(skill?: string) {
    try {
      const supabase = await getSupabaseClient();
      let query = supabase
        .from('resources')
        .select('*');
      
      if (skill) {
        query = query.eq('skill', skill);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching resources:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error in getResources:', error);
      return [];
    }
  },

  async saveResource(resource: any) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('resources')
        .insert(resource)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to save resource: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Error in saveResource:', error);
      throw error;
    }
  },

  async getAnalyses(uid: string) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('uid', uid)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching analyses:', error);
        return [];
      }
    return data || [];
    } catch (error) {
      console.error('Error in getAnalyses:', error);
      return [];
    }
  },

  async getAnalysis(analysisId: string) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching analysis:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in getAnalysis:', error);
      return null;
    }
  },

  async saveAnalysis(analysis: any) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('analyses')
        .insert(analysis)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to save analysis: ${error.message}`);
      }
      return data;
    } catch (error) {
      console.error('Error in saveAnalysis:', error);
      throw error;
    }
  },

  async delete(table: string, key: string, keyValue: any): Promise<void> {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(key, keyValue);
      
      if (error) {
        throw new Error(`Failed to delete from ${table}: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  },
};
