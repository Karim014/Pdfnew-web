
import React, { useState, useEffect } from 'react';
import { User, Job } from '../types';
import { authService } from '../services/authService';
import { jobStore } from '../services/jobStore';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
    return jobStore.subscribe(setJobs);
  }, []);

  if (!user) return null;

  const toolStats = jobs.reduce((acc, job) => {
    acc[job.toolName] = (acc[job.toolName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const successfulJobs = jobs.filter(j => j.status === 'done').length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-black mb-1">User Profile</h1>
        <p className="text-slate-500">Manage your identity and track your learning progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 rounded-[2rem] bg-surface-dark border border-white/5 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <img src={user.avatar} className="size-24 rounded-full bg-primary/20 border-4 border-white/5 shadow-2xl" alt={user.name} />
              <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary border-4 border-surface-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-[12px] text-white">verified</span>
              </div>
            </div>
            <h2 className="text-xl font-black capitalize">{user.name}</h2>
            <p className="text-xs text-slate-500 mb-6">{user.email}</p>
            <div className="w-full pt-6 border-t border-white/5">
               <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                 {user.plan} Active
               </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-dark border border-white/5 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <span className="text-xs text-slate-500">Member Since</span>
                 <span className="text-xs font-bold">{new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-xs text-slate-500">Language</span>
                 <span className="text-xs font-bold">{user.language}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-surface-dark border border-white/5">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Credits Left</p>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-black">{user.credits}</span>
                 <span className="text-xs text-slate-600 font-bold mb-1">/ {user.maxCredits}</span>
               </div>
            </div>
            <div className="p-6 rounded-3xl bg-surface-dark border border-white/5">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Jobs</p>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-primary">{successfulJobs}</span>
                 <span className="text-xs text-slate-600 font-bold mb-1">Done</span>
               </div>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-surface-dark border border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8">Recent Usage by Tool</h3>
            <div className="space-y-6">
              {Object.entries(toolStats).length === 0 ? (
                <p className="text-sm text-slate-500 italic">No tools used yet. Start a job to see stats!</p>
              ) : (
                Object.entries(toolStats).map(([name, count]) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">{name}</span>
                      <span className="text-primary">{count} Actions</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / jobs.length) * 100}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-white/5">
             <div className="flex items-start justify-between">
                <div>
                   <h4 className="text-lg font-black mb-1">Unlock Pro Power</h4>
                   <p className="text-sm text-slate-400 mb-6">Get unlimited credits, faster processing, and advanced AI features.</p>
                   <button className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                     Upgrade Plan
                   </button>
                </div>
                <span className="material-symbols-outlined text-5xl text-primary/20">auto_awesome</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;