
import { User } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_USER_KEY = 'studyflow_active_user';
const LOCAL_USERS_DB = 'studyflow_users_database';
const REMEMBER_ME_KEY = 'studyflow_remember_me';

const getLocalUsers = (): any[] => {
  const db = localStorage.getItem(LOCAL_USERS_DB);
  return db ? JSON.parse(db) : [];
};

export const authService = {
  // إنشاء حساب جديد
  signUp: async (email: string, password: string, rememberMe: boolean = true): Promise<User | null> => {
    const name = email.split('@')[0];
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { name, avatar } }
      });
      if (error) throw error;
      
      const user: User = { 
        id: data.user!.id, 
        email: data.user!.email!, 
        name, 
        plan: 'Free', 
        avatar,
        credits: 5,
        maxCredits: 5,
        joinedAt: Date.now(),
        language: 'English'
      };
      if (rememberMe) localStorage.setItem(REMEMBER_ME_KEY, 'true');
      return user;
    } else {
      const users = getLocalUsers();
      if (users.find(u => u.email === email)) {
        throw new Error("This email is already registered.");
      }

      const newUser: User & { password?: string } = {
        id: `local_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password,
        name,
        plan: 'Free',
        avatar,
        credits: 5,
        maxCredits: 5,
        joinedAt: Date.now(),
        language: 'English'
      };

      users.push(newUser);
      localStorage.setItem(LOCAL_USERS_DB, JSON.stringify(users));
      
      if (rememberMe) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      } else {
        sessionStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      }
      return newUser;
    }
  },

  // تسجيل الدخول
  signIn: async (email: string, password: string, rememberMe: boolean = true): Promise<User | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
        plan: 'Pro',
        avatar: data.user.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
        credits: 100,
        maxCredits: 100,
        joinedAt: Date.now(),
        language: 'English'
      };
      if (rememberMe) localStorage.setItem(REMEMBER_ME_KEY, 'true');
      return user;
    } else {
      const users = getLocalUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error("Invalid email or password.");
      }

      if (rememberMe) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
      } else {
        sessionStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
      return user;
    }
  },

  getCurrentUserSync: (): User | null => {
    // التحقق من التخزين الدائم أولاً إذا كان تذكرني مفعلاً
    const isRemembered = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    const localUser = isRemembered 
      ? localStorage.getItem(LOCAL_USER_KEY) 
      : sessionStorage.getItem(LOCAL_USER_KEY);
    
    if (localUser) return JSON.parse(localUser);

    if (isSupabaseConfigured && isRemembered) {
      // Supabase يدير الجلسة في LocalStorage تلقائياً
      const session = JSON.parse(localStorage.getItem(`sb-${process.env.VITE_SUPABASE_URL}-auth-token`) || 'null');
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          plan: 'Pro',
          avatar: session.user.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
          credits: 100,
          maxCredits: 100,
          joinedAt: Date.now(),
          language: 'English'
        };
      }
    }
    return null;
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return authService.getCurrentUserSync();
    }
    return authService.getCurrentUserSync();
  },

  updateUser: (updates: Partial<User>) => {
    const current = authService.getCurrentUserSync();
    if (current) {
      const updated = { ...current, ...updates };
      const isRemembered = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
      
      if (isRemembered) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      } else {
        sessionStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      }
      
      if (!isSupabaseConfigured) {
        const users = getLocalUsers();
        const index = users.findIndex(u => u.id === current.id);
        if (index !== -1) {
          users[index] = { ...users[index], ...updates };
          localStorage.setItem(LOCAL_USERS_DB, JSON.stringify(users));
        }
      }
      return updated;
    }
    return null;
  },

  logout: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    sessionStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
};
