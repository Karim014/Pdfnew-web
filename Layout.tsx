
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TOOLS } from '../constants';
import { jobStore } from '../services/jobStore';
import { authService } from '../services/authService';
import { Job, User } from '../types';

const Sidebar = ({ user }: { user: User | null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-background-dark border-r border-white/5 h-screen sticky top-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">school</span>
          </div>
          <span className="text-xl font-bold tracking-tight">StudyFlow</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar pb-20">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu</p>
          <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link to="/tools" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/tools') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            <span className="text-sm font-medium">Tools Hub</span>
          </Link>
          <Link to="/ai-studio" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive('/ai-studio') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            <span className="text-sm font-medium">AI Studio</span>
          </Link>

          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-8">Tools</p>
          {TOOLS.map(tool => (
            <Link key={tool.id} to={tool.path} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(tool.path) ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <span className="material-symbols-outlined text-[20px]">{tool.icon}</span>
              <span className="text-sm font-medium truncate">{tool.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section with Popover */}
        <div className="p-4 border-t border-white/5 relative" ref={menuRef}>
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl p-2 z-[60]"
              >
                <Link 
                  to="/profile" 
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold"
                >
                  <span className="material-symbols-outlined text-lg text-primary">account_circle</span>
                  Profile Details
                </Link>
                <Link 
                  to="/settings" 
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold"
                >
                  <span className="material-symbols-outlined text-lg text-slate-400">settings</span>
                  Settings
                </Link>
                <div className="h-px bg-white/5 my-2"></div>
                <button 
                  onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-sm font-bold"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer group transition-all ${showProfileMenu ? 'bg-white/5' : 'hover:bg-white/5'}`}
          >
            <div className="relative">
              <img src={user.avatar} className="size-9 rounded-full bg-primary/20 border border-white/10" alt={user.name} />
              <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-green-500 border-2 border-background-dark"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate capitalize text-white">{user.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">{user.plan}</span>
                <span className="text-[9px] text-slate-500">•</span>
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                   {user.credits}/{user.maxCredits} CR
                </span>
              </div>
            </div>
            <span className={`material-symbols-outlined text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}>expand_less</span>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface-dark border border-white/10 rounded-3xl shadow-2xl p-8 z-[110] text-center"
            >
              <div className="size-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-3xl">logout</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Sign Out?</h3>
              <p className="text-slate-500 text-sm mb-8">Are you sure you want to log out of your StudyFlow account?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const Navbar = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background-dark/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-slate-400"><span className="material-symbols-outlined">menu</span></button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>StudyFlow</span>
          <span>/</span>
          <span className="text-white font-bold capitalize">{useLocation().pathname.split('/').pop() || 'Dashboard'}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
           <span className="material-symbols-outlined text-primary text-sm">token</span>
           <span className="text-[10px] font-black uppercase tracking-widest">
             {user?.credits || 0} Credits Left
           </span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <button className="text-slate-400 hover:text-white transition-colors relative">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-background-dark"></span>
        </button>
        <Link to="/pricing-app" className="h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg shadow-primary/20">
          Upgrade
        </Link>
      </div>
    </header>
  );
};

const JobsPanel = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return jobStore.subscribe(setJobs);
  }, []);

  const activeJobsCount = jobs.filter(j => j.status === 'processing' || j.status === 'queued').length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl transition-all ${activeJobsCount > 0 ? 'bg-primary text-white' : 'bg-surface-dark text-slate-400 border border-white/5'}`}
      >
        <span className={`material-symbols-outlined text-[20px] ${activeJobsCount > 0 ? 'animate-spin' : ''}`}>
          {activeJobsCount > 0 ? 'sync' : 'history'}
        </span>
        <span className="text-sm font-bold">
          {activeJobsCount > 0 ? `${activeJobsCount} Processing...` : 'History'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 bg-surface-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60]"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="text-sm font-bold">Recent Activity</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {jobs.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-20">inventory_2</span>
                  <p className="text-xs">No records found.</p>
                </div>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${job.status === 'done' ? 'text-green-500' : job.status === 'failed' ? 'text-red-500' : 'text-primary animate-spin'}`}>
                          {job.status === 'done' ? 'check_circle' : job.status === 'failed' ? 'error' : 'sync'}
                        </span>
                        <p className="text-xs font-bold truncate max-w-[120px]">{job.toolName}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{new Date(job.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {job.status === 'processing' && (
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <motion.div 
                          className="bg-primary h-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                    {job.status === 'done' && job.resultUrl && (
                      <a href={job.resultUrl} download className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[12px]">download</span> Save Results
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background-dark selection:bg-primary/30">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto bg-background-dark text-white relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <JobsPanel />
    </div>
  );
};
