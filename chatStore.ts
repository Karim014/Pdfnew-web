
import { ChatMessage } from '../types';
import { authService } from './authService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

type Subscriber = (messages: ChatMessage[]) => void;

class ChatStore {
  private subscribers: Subscriber[] = [];

  constructor() {
    if (isSupabaseConfigured && supabase) {
      this.setupRealtime();
    }
  }

  private setupRealtime() {
    supabase!
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
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
    return `studyflow_chat_${userId}`;
  }

  private async notify() {
    const user = authService.getCurrentUserSync();
    if (!user) return;

    let messages: ChatMessage[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: true });
      if (!error && data) messages = data;
    } else {
      const saved = localStorage.getItem(this.getLocalStorageKey(user.id));
      messages = saved ? JSON.parse(saved) : [];
    }

    this.subscribers.forEach(s => s(messages));
  }

  async addMessage(role: 'user' | 'model', text: string): Promise<ChatMessage> {
    const user = authService.getCurrentUserSync();
    if (!user) throw new Error("Authentication required");

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      role,
      text,
      timestamp: Date.now(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('messages').insert([newMessage]).select();
      if (error) throw error;
      this.notify();
      return data[0];
    } else {
      const key = this.getLocalStorageKey(user.id);
      const saved = localStorage.getItem(key);
      const messages = saved ? JSON.parse(saved) : [];
      const updated = [...messages, newMessage];
      localStorage.setItem(key, JSON.stringify(updated));
      this.notify();
      return newMessage;
    }
  }

  async clearHistory() {
    const user = authService.getCurrentUserSync();
    if (!user) return;

    if (isSupabaseConfigured && supabase) {
      await supabase.from('messages').delete().eq('userId', user.id);
    } else {
      localStorage.removeItem(this.getLocalStorageKey(user.id));
    }
    this.notify();
  }
}

export const chatStore = new ChatStore();
