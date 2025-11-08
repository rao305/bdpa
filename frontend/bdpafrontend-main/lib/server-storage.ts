// Server-side storage for API routes
// Uses JSON file for persistence (runs in Node.js environment)

import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.local-data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

interface StorageData {
  users: any[];
  profiles: any[];
  roles: any[];
  resources: any[];
  analyses: any[];
}

let cache: StorageData | null = null;

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // File doesn't exist, create it
      await fs.writeFile(DATA_FILE, JSON.stringify({
        users: [],
        profiles: [],
        roles: [],
        resources: [],
        analyses: [],
      }));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
  }
}

async function loadData(): Promise<StorageData> {
  if (cache) return cache;

  await ensureDataFile();
  
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    cache = JSON.parse(data);
    return cache!;
  } catch (error) {
    console.error('Error loading data:', error);
    cache = {
      users: [],
      profiles: [],
      roles: [],
      resources: [],
      analyses: [],
    };
    return cache;
  }
}

async function saveData(data: StorageData): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  cache = data;
}

export const serverStorage = {
  async getUserByEmail(email: string) {
    const data = await loadData();
    return data.users.find(u => u.email === email) || null;
  },

  async getUserById(id: string) {
    const data = await loadData();
    return data.users.find(u => u.id === id) || null;
  },

  async createUser(user: any) {
    const data = await loadData();
    data.users.push(user);
    await saveData(data);
    return user;
  },

  async getProfile(uid: string) {
    const data = await loadData();
    return data.profiles.find(p => p.uid === uid) || null;
  },

  async saveProfile(profile: any) {
    const data = await loadData();
    const index = data.profiles.findIndex(p => p.uid === profile.uid);
    if (index >= 0) {
      data.profiles[index] = { ...data.profiles[index], ...profile };
    } else {
      data.profiles.push(profile);
    }
    await saveData(data);
    return data.profiles.find(p => p.uid === profile.uid)!;
  },

  async getRole(roleId: string) {
    const data = await loadData();
    return data.roles.find(r => r.id === roleId) || null;
  },

  async getAllRoles() {
    const data = await loadData();
    return data.roles;
  },

  async saveRole(role: any) {
    const data = await loadData();
    const index = data.roles.findIndex(r => r.id === role.id);
    if (index >= 0) {
      data.roles[index] = role;
    } else {
      data.roles.push(role);
    }
    await saveData(data);
    return role;
  },

  async getResources(skill?: string) {
    const data = await loadData();
    if (skill) {
      return data.resources.filter(r => r.skill === skill);
    }
    return data.resources;
  },

  async saveResource(resource: any) {
    const data = await loadData();
    if (!resource.id) {
      resource.id = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    data.resources.push(resource);
    await saveData(data);
    return resource;
  },

  async getAnalyses(uid: string) {
    const data = await loadData();
    return data.analyses
      .filter(a => a.uid === uid)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getAnalysis(analysisId: string) {
    const data = await loadData();
    return data.analyses.find(a => a.id === analysisId) || null;
  },

  async saveAnalysis(analysis: any) {
    const data = await loadData();
    if (!analysis.id) {
      analysis.id = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!analysis.created_at) {
      analysis.created_at = new Date().toISOString();
    }
    analysis.updated_at = new Date().toISOString();
    data.analyses.push(analysis);
    await saveData(data);
    return analysis;
  },

  async delete(table: string, key: string, keyValue: any): Promise<void> {
    const data = await loadData();
    const tableData = data[table as keyof StorageData] as any[];
    const index = tableData.findIndex((item: any) => item[key] === keyValue);
    if (index >= 0) {
      tableData.splice(index, 1);
      await saveData(data);
    }
  },
};

