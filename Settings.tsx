
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('English');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then(u => {
      if (u) {
        setUser(u);
        setName(u.name);
        setLanguage(u.language);
      }
    });
  }, []);

  const handleSave = () => {
    if (user) {
      authService.updateUser({ name, language });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-black mb-1">Account Settings</h1>
        <p className="text-slate-500">Customize your workspace experience.</p>
      </div>

      <div className="space-y-8">
        <section className="p-8 rounded-[2rem] bg-surface-dark border border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">person</span>
            <h3 className="text-sm font-black uppercase tracking-widest">Public Profile</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
            <div className="space-y-2 opacity-50 cursor-not-allowed">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email (Immutable)</label>
              <input type="email" value={user.email} disabled className="w-full h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm outline-none" />
            </div>
          </div>
        </section>

        <section className="p-8 rounded-[2rem] bg-surface-dark border border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">language</span>
            <h3 className="text-sm font-black uppercase tracking-widest">General Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Interface Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option>English</option>
                <option>Arabic (العربية)</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Theme</label>
              <div className="flex bg-background-dark p-1 rounded-xl">
                 <button className="flex-1 py-1.5 text-[10px] font-black rounded-lg bg-primary text-white shadow-lg">Dark Mode</button>
                 <button className="flex-1 py-1.5 text-[10px] font-black rounded-lg text-slate-500 hover:text-white">Light Mode</button>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between pt-4">
           {isSaved ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 font-bold text-sm">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Settings saved successfully!
             </motion.div>
           ) : <div></div>}
           <div className="flex gap-4">
              <button className="px-6 py-3 rounded-xl border border-white/5 text-sm font-bold hover:bg-white/5 transition-colors">Discard</button>
              <button 
                onClick={handleSave}
                className="px-8 py-3 rounded-xl bg-primary text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Save Changes
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;