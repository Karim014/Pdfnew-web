
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';

// --- Internal Auth Modal Component ---

const AuthModal = ({ isOpen, onClose, type: initialType }: { 
  isOpen: boolean, 
  onClose: () => void, 
  type: 'login' | 'signup'
}) => {
  const navigate = useNavigate();
  const [type, setType] = useState(initialType);
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
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background-dark/80 backdrop-blur-md"
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[460px] bg-surface-dark border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 z-[110]"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight mb-1">
                  {type === 'login' ? 'Welcome Back' : 'Join StudyFlow'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">Safe, secure, and isolated learning data</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@university.edu" className="w-full h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 bg-background-dark border border-white/10 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" />
              </div>
              
              <div className="flex items-center px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-white/10 bg-background-dark text-primary focus:ring-primary focus:ring-offset-background-dark transition-all"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium">Remember me</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-primary hover:bg-primary-hover text-white font-black text-sm rounded-xl shadow-lg transition-all mt-4 flex items-center justify-center gap-2"
              >
                {isLoading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                {isLoading ? 'Processing...' : (type === 'login' ? 'Log In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <p className="text-xs text-slate-500">
                {type === 'login' ? "Don't have an account?" : "Already a member?"}
                <button onClick={() => setType(type === 'login' ? 'signup' : 'login')} className="text-primary font-bold ml-1 hover:underline">
                  {type === 'login' ? 'Create one' : 'Log in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Landing Page Component ---

export default function Landing() {
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState<{ open: boolean, type: 'login' | 'signup' }>({ open: false, type: 'login' });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // التحقق من الجلسة عند التحميل لتسجيل الدخول التلقائي
    const checkSession = async () => {
      const user = await authService.getCurrentUser();
      if (user) navigate('/dashboard');
    };
    checkSession();

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-background-dark font-display text-white antialiased min-h-screen selection:bg-primary/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <h1 className="text-xl font-black tracking-tighter">STUDYFLOW</h1>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['Tools', 'Reviews', 'Pricing'].map(item => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setAuthModal({ open: true, type: 'login' })} className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white transition-colors">Log In</button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthModal({ open: true, type: 'signup' })}
              className="h-11 items-center px-6 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary-hover text-white transition-all shadow-glow"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-32 overflow-hidden min-h-screen flex items-center">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-30"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10"
              >
                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">New: Cloud Sync 2.0 Released</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10"
              >
                Supercharge Your <br /> <span className="text-primary italic">Learning Curve.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-12"
              >
                The all-in-one AI platform for students to manage PDFs, generate study guides, and ace exams with private cloud storage.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-6"
              >
                <button 
                  onClick={() => setAuthModal({ open: true, type: 'signup' })}
                  className="h-16 px-10 rounded-2xl bg-white text-background-dark font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-primary hover:text-white transition-all active:scale-95"
                >
                  Create Free Account
                </button>
                <button 
                   onClick={() => scrollToSection('tools')}
                   className="h-16 px-10 rounded-2xl bg-white/5 border border-white/10 font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Explore Tools
                </button>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5"
            >
              {[
                { label: 'Documents Processed', value: '1.2M+' },
                { label: 'Active Students', value: '500K+' },
                { label: 'AI Accuracy', value: '99.4%' },
                { label: 'Uptime', value: '99.9%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" className="py-32 bg-background-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div className="max-w-xl">
                <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Toolkit</h2>
                <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Everything you need <br /> in one cloud.</h3>
              </div>
              <p className="text-slate-500 max-w-xs text-sm font-medium">No more switching between tabs. Merge, split, compress, and analyze documents in a single workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Unified Merge', icon: 'call_merge', desc: 'Secure cloud merging for all your handouts.' },
                { name: 'Smart Split', icon: 'call_split', desc: 'Extract exactly what you need from lectures.' },
                { name: 'Ultra Compress', icon: 'compress', desc: 'Shrink files without losing readability.' },
                { name: 'Gemini OCR', icon: 'document_scanner', desc: 'Convert scans to searchable text instantly.' },
              ].map((tool, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -10 }}
                  className="p-10 rounded-3xl border border-white/5 bg-surface-dark/40 hover:bg-surface-hover hover:border-primary/50 transition-all group"
                >
                  <div className="size-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-white text-3xl">{tool.icon}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-4">{tool.name}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{tool.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-full h-[500px] bg-primary/5 blur-[120px] -translate-y-1/2 rounded-full opacity-30 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-20">Loved by Students.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah J.', role: 'Law Student', text: 'The OCR feature saved me hours of typing up library notes. Truly a game changer.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                { name: 'Michael K.', role: 'Pre-Med', text: 'StudyFlow helps me organize massive lecture slides into clean, compressed study sets.', avatar: 'https://i.pravatar.cc/150?u=mike' },
                { name: 'Elena R.', role: 'Engineering', text: 'The AI summarizer is shockingly accurate. It picks out the core concepts perfectly.', avatar: 'https://i.pravatar.cc/150?u=elena' },
              ].map((rev, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-[2.5rem] bg-surface-dark border border-white/5 text-left flex flex-col justify-between h-full"
                >
                  <p className="text-lg text-slate-300 italic mb-8">"{rev.text}"</p>
                  <div className="flex items-center gap-4">
                    <img src={rev.avatar} className="size-12 rounded-full object-cover border-2 border-primary" alt={rev.name} />
                    <div>
                      <h5 className="font-bold text-white">{rev.name}</h5>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{rev.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 bg-background-dark/50">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Pricing</h2>
            <h3 className="text-4xl md:text-5xl font-black mb-16 tracking-tight">Flexible Plans for Every Student.</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { name: 'Free', price: '$0', desc: 'Basic PDF tools for occasional use.', features: ['Standard Compression', '5 Cloud Jobs / day', 'Basic OCR', 'Community Support'] },
                { name: 'Student Pro', price: '$8', desc: 'Advanced AI tools for serious learners.', features: ['Unlimited Cloud Jobs', 'Advanced AI Summarizer', 'Batch OCR Processing', 'Priority Support', 'Pro Study Guides'], popular: true },
                { name: 'Study Group', price: '$20', desc: 'Perfect for collaborative projects.', features: ['Everything in Pro', 'Shared Workspaces', 'Collaborative Notes', 'Admin Dashboard'] },
              ].map((plan, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className={`p-10 rounded-[2.5rem] border text-left flex flex-col h-full relative ${plan.popular ? 'border-primary bg-primary/5 shadow-2xl z-10' : 'border-white/5 bg-surface-dark'}`}
                >
                  {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">Most Popular</span>}
                  <div className="mb-8">
                    <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                    <p className="text-sm text-slate-500">{plan.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-black">{plan.price}</span>
                    <span className="text-sm text-slate-500 font-bold">/mo</span>
                  </div>
                  <button 
                    onClick={() => setAuthModal({ open: true, type: 'signup' })}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest mb-10 transition-all ${plan.popular ? 'bg-primary text-white shadow-glow' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    Select Plan
                  </button>
                  <ul className="space-y-4 mt-auto">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="p-16 rounded-[3rem] bg-gradient-to-br from-primary to-indigo-700 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">auto_awesome</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-none">Ready to transform your <br /> academic life?</h2>
              <p className="text-white/80 max-w-xl mx-auto text-lg font-medium mb-12">Join over 500,000 students who are already using StudyFlow to study smarter, not harder.</p>
              <button 
                onClick={() => setAuthModal({ open: true, type: 'signup' })}
                className="h-16 px-12 rounded-2xl bg-white text-primary font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
              >
                Start Your Free Trial
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 bg-background-dark/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
             <div className="flex items-center gap-3 mb-6">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">school</span>
              </div>
              <h1 className="text-lg font-black tracking-tighter">STUDYFLOW</h1>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Making academic success accessible for every student through AI innovation.</p>
          </div>
          {[
            { title: 'Platform', links: ['Tools', 'AI Studio', 'Mobile App', 'Desktop Client'] },
            { title: 'Company', links: ['About', 'Reviews', 'Privacy', 'Terms'] },
            { title: 'Social', links: ['X / Twitter', 'Discord', 'Instagram', 'LinkedIn'] },
          ].map((col, i) => (
            <div key={i}>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{col.title}</h5>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">© 2024 StudyFlow Platform. All rights reserved.</p>
          <div className="flex gap-6">
             <a href="#" className="text-slate-600 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">public</span></a>
             <a href="#" className="text-slate-600 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">verified_user</span></a>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={authModal.open} 
        onClose={() => setAuthModal({ ...authModal, open: false })} 
        type={authModal.type} 
      />
    </div>
  );
}
