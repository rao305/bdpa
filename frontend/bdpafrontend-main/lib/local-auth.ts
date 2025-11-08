// Local Authentication Service - Replaces Supabase Auth
// Simple email/password authentication stored locally

import { localStorage as localDB } from './local-storage';

interface User {
  id: string;
  email: string;
  password: string; // Hashed
  created_at: string;
}

// Simple hash function (for demo purposes - not cryptographically secure)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

class LocalAuthService {
  private currentUser: User | null = null;
  private sessionKey = 'skillgap_session';

  constructor() {
    // Restore session from localStorage
    if (typeof window !== 'undefined') {
      const sessionData = window.localStorage.getItem(this.sessionKey);
      if (sessionData) {
        try {
          this.currentUser = JSON.parse(sessionData);
        } catch (e) {
          // Invalid session
          this.clearSession();
        }
      }
    }
  }

  private saveSession(user: User): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.sessionKey, JSON.stringify(user));
      // Also set cookie for server-side API routes
      document.cookie = `${this.sessionKey}=${JSON.stringify(user)}; path=/; max-age=86400`; // 24 hours
      this.currentUser = user;
    }
  }

  private clearSession(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.sessionKey);
      // Clear cookie
      document.cookie = `${this.sessionKey}=; path=/; max-age=0`;
      this.currentUser = null;
    }
  }

  async signUp(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Check if user already exists
      const existingUser = await localDB.selectOne<User>('users', 'email', email);
      if (existingUser) {
        return { user: null, error: new Error('User already exists') };
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
      };

      await localDB.insert<User>('users', user);

      // Create profile
      await localDB.saveProfile({
        uid: user.id,
        first_time: true,
        is_student: false,
        year: null,
        major: null,
        skills: [],
        coursework: [],
        experience: [],
        target_category: null,
        resume_text: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Save session (without password)
      const { password: _, ...sessionUser } = user;
      this.saveSession(sessionUser as any);

      return { user: sessionUser as any, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const user = await localDB.selectOne<User>('users', 'email', email);
      if (!user) {
        return { user: null, error: new Error('Invalid email or password') };
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return { user: null, error: new Error('Invalid email or password') };
      }

      // Save session (without password)
      const { password: _pwd, ...sessionUser } = user;
      this.saveSession(sessionUser as any);

      return { user: sessionUser as any, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  async signOut(): Promise<void> {
    this.clearSession();
  }

  async getUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from session
    if (typeof window !== 'undefined') {
      const sessionData = window.localStorage.getItem(this.sessionKey);
      if (sessionData) {
        try {
          this.currentUser = JSON.parse(sessionData);
          return this.currentUser;
        } catch (e) {
          this.clearSession();
        }
      }
    }

    return null;
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    // For local storage, we'll just return success
    // In a real app, you'd send an email, but for local-only, we skip this
    return { error: null };
  }
}

// Singleton instance
export const localAuth = new LocalAuthService();

// Helper to get current user (for use in components)
export async function getCurrentUser() {
  return localAuth.getUser();
}

