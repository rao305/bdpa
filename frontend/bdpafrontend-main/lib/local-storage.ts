// Local Storage Service - Replaces Supabase for local-only storage
// Uses IndexedDB for better performance and storage limits

interface User {
  id: string;
  email: string;
  password?: string; // Hashed password
  created_at: string;
}

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
  resume_text: string | null;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  title: string;
  category: string;
  description: string | null;
  requirements: Record<string, any>[];
  created_at: string;
}

interface Resource {
  id: string;
  skill: string;
  title: string;
  url: string;
  type: string;
  created_at: string;
}

interface Analysis {
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
}

class LocalStorageService {
  private dbName = 'skillgap_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('profiles')) {
          const profileStore = db.createObjectStore('profiles', { keyPath: 'uid' });
          profileStore.createIndex('uid', 'uid', { unique: true });
        }

        if (!db.objectStoreNames.contains('roles')) {
          const roleStore = db.createObjectStore('roles', { keyPath: 'id' });
          roleStore.createIndex('id', 'id', { unique: true });
        }

        if (!db.objectStoreNames.contains('resources')) {
          const resourceStore = db.createObjectStore('resources', { keyPath: 'id', autoIncrement: true });
          resourceStore.createIndex('skill', 'skill', { unique: false });
        }

        if (!db.objectStoreNames.contains('analyses')) {
          const analysisStore = db.createObjectStore('analyses', { keyPath: 'id' });
          analysisStore.createIndex('uid', 'uid', { unique: false });
          analysisStore.createIndex('role_id', 'role_id', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  // Generic CRUD operations
  async insert<T>(table: string, data: T): Promise<T> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      const request = store.add(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async select<T>(table: string, query?: { field: string; value: any }): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], 'readonly');
      const store = transaction.objectStore(table);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result as T[];

        if (query) {
          results = results.filter((item: any) => item[query.field] === query.value);
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async selectOne<T>(table: string, key: string, value: any): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], 'readonly');
      const store = transaction.objectStore(table);
      let request: IDBRequest;

      if (key === 'id' || key === 'uid') {
        request = store.get(value);
      } else {
        const index = store.index(key);
        request = index.get(value);
      }

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? (result as T) : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(table: string, key: string, keyValue: any, updates: Partial<T>): Promise<T> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      let getRequest: IDBRequest;

      if (key === 'id' || key === 'uid') {
        getRequest = store.get(keyValue);
      } else {
        const index = store.index(key);
        getRequest = index.get(keyValue);
      }

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Record not found'));
          return;
        }

        const updated = { ...existing, ...updates };
        const putRequest = store.put(updated);

        putRequest.onsuccess = () => resolve(updated as T);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async upsert<T extends { uid?: string; id?: string }>(table: string, data: T): Promise<T> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      const key = (data.uid || data.id) as string;

      if (!key) {
        reject(new Error('Missing key for upsert'));
        return;
      }

      const getRequest = store.get(key);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const finalData = existing ? { ...existing, ...data } : data;
        const putRequest = store.put(finalData);

        putRequest.onsuccess = () => resolve(finalData as T);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async delete(table: string, key: string, keyValue: any): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], 'readwrite');
      const store = transaction.objectStore(table);
      const request = store.delete(keyValue);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Specific table methods
  async getProfile(uid: string): Promise<Profile | null> {
    return this.selectOne<Profile>('profiles', 'uid', uid);
  }

  async saveProfile(profile: Profile): Promise<Profile> {
    return this.upsert<Profile>('profiles', profile);
  }

  async getRole(roleId: string): Promise<Role | null> {
    return this.selectOne<Role>('roles', 'id', roleId);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.select<Role>('roles');
  }

  async saveRole(role: Role): Promise<Role> {
    return this.upsert<Role>('roles', role);
  }

  async getResources(skill?: string): Promise<Resource[]> {
    if (skill) {
      return this.select<Resource>('resources', { field: 'skill', value: skill });
    }
    return this.select<Resource>('resources');
  }

  async saveResource(resource: Resource): Promise<Resource> {
    return this.insert<Resource>('resources', resource);
  }

  async getAnalyses(uid: string): Promise<Analysis[]> {
    const analyses = await this.select<Analysis>('analyses', { field: 'uid', value: uid });
    return analyses.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getAnalysis(analysisId: string): Promise<Analysis | null> {
    return this.selectOne<Analysis>('analyses', 'id', analysisId);
  }

  async saveAnalysis(analysis: Analysis): Promise<Analysis> {
    return this.insert<Analysis>('analyses', analysis);
  }
}

// Singleton instance
export const localStorage = new LocalStorageService();

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  localStorage.init().catch(console.error);
}

