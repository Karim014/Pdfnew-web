
import { Job, JobStatus } from '../types';
import { authService } from './authService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

type Subscriber = (jobs: Job[]) => void;

class JobStore {
  private subscribers: Subscriber[] = [];

  constructor() {
    if (isSupabaseConfigured && supabase) {
      this.setupRealtime();
    }
  }

  private setupRealtime() {
    supabase!
      .channel('public:jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        this.notify();
      })
      .subscribe();
  }

  subscribe(callback: Subscriber) {
    this.subscribers.push(callback);
    this.notify();
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private getLocalStorageKey(userId: string) {
    return `studyflow_jobs_${userId}`;
  }

  private async notify() {
    const user = authService.getCurrentUserSync();
    if (!user) return;

    let jobs: Job[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      if (!error && data) jobs = data;
    } else {
      const saved = localStorage.getItem(this.getLocalStorageKey(user.id));
      jobs = saved ? JSON.parse(saved) : [];
    }

    this.subscribers.forEach(s => s(jobs));
  }

  async addJob(toolName: string): Promise<Job> {
    const user = authService.getCurrentUserSync();
    if (!user) throw new Error("No user logged in");

    // التحقق من الرصيد (كل عملية تكلفتها 0.5 كريدت)
    const cost = 0.5;
    if (user.credits < cost) {
      throw new Error("Insufficient credits. Please upgrade your plan.");
    }

    // خصم الرصيد
    const updatedUser = authService.updateUser({ 
      credits: Math.max(0, user.credits - cost) 
    });

    if (!updatedUser) throw new Error("Failed to process credits");

    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      toolName,
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('jobs').insert([newJob]).select();
      if (error) throw error;
      this.notify();
      return data[0];
    } else {
      const key = this.getLocalStorageKey(user.id);
      const saved = localStorage.getItem(key);
      const jobs = saved ? JSON.parse(saved) : [];
      const updated = [newJob, ...jobs];
      localStorage.setItem(key, JSON.stringify(updated));
      this.notify();
      return newJob;
    }
  }

  async updateJob(id: string, updates: Partial<Job>) {
    const user = authService.getCurrentUserSync();
    if (!user) return;

    if (isSupabaseConfigured && supabase) {
      await supabase.from('jobs').update(updates).eq('id', id);
    } else {
      const key = this.getLocalStorageKey(user.id);
      const saved = localStorage.getItem(key);
      if (saved) {
        const jobs: Job[] = JSON.parse(saved);
        const updated = jobs.map(j => j.id === id ? { ...j, ...updates } : j);
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
    this.notify();
  }

  async runSimulation(jobId: string, duration = 3000, resultUrl?: string, resultText?: string) {
    await this.updateJob(jobId, { status: 'processing', progress: 10 });
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, duration / steps));
      await this.updateJob(jobId, { progress: Math.min(90, i * (100 / steps)) });
    }
    await this.updateJob(jobId, { 
      status: 'done', 
      progress: 100, 
      resultUrl: resultUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      resultText: resultText
    });
  }
}

export const jobStore = new JobStore();
