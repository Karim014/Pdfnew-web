
export type JobStatus = 'queued' | 'processing' | 'done' | 'failed';

export interface Job {
  id: string;
  userId: string; // Associated user
  toolName: string;
  status: JobStatus;
  progress: number;
  createdAt: number;
  resultUrl?: string;
  resultText?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  userId: string; // Associated user
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Convert' | 'Optimize' | 'Organize' | 'AI Tools';
  path: string;
  isPro?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'Free' | 'Pro' | 'Premium';
  avatar: string;
  credits: number; // Remaining credits
  maxCredits: number; // Total credits allowed for plan
  joinedAt: number;
  language: string;
}