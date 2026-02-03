
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

export const AuthPage: React.FC<{ type: 'login' | 'signup' }> = ({ type }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError(null);
    try {
      let user;
      if (type === 'login') {
        user = await authService.signIn(email, password, rememberMe);
      } else {
        user = await authService.signUp(email, password, rememberMe);
      }

      if (user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background-dark">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[128px] opacity-40"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[460px] bg-surface-dark/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl p-8 sm:p-12"
      >
        <div className="flex flex-col items-center gap-6 mb-8">
          <Link to="/" className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined text-3xl">school</span>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {type === 'login' ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-sm text-slate-500">
              {type === 'login' ? 'Sign in to your student cloud' : 'Create your secure study account'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu" 
              className="w-full h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••" 
              className="w-full h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-white/10 bg-background-dark text-primary focus:ring-primary focus:ring-offset-background-dark transition-all"
              />
              <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium">Remember me</span>
            </label>
            {type === 'login' && (
              <a href="#" className="text-xs text-primary hover:underline font-bold">Forgot?</a>
            )}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-black text-sm rounded-xl shadow-lg shadow-primary/25 transition-all mt-4 flex items-center justify-center gap-2"
          >
            {isLoading && <span className="material-symbols-outlined animate-spin text-lg">sync</span>}
            {isLoading ? 'Processing...' : (type === 'login' ? 'Log In' : 'Create Account')}
          </motion.button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-xs text-slate-500 pt-4">
            {type === 'login' ? 'New here?' : 'Already have an account?'}
            <Link to={type === 'login' ? '/auth/signup' : '/auth/login'} className="text-primary font-bold ml-1 hover:underline">
              {type === 'login' ? 'Create Account' : 'Log In'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
