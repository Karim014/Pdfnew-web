
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants';
import { FileUpload } from '../components/FileUpload';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleInitialUpload = (files: File[]) => {
    if (files.length > 1 && files[0].type === 'application/pdf') {
      navigate('/tools/merge', { state: { initialFiles: files } });
    } else {
      navigate('/tools', { state: { initialFiles: files } });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Dashboard Header */}
      <div className="space-y-6 mb-12 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Student Dashboard</h1>
            <p className="text-slate-400">Welcome back, Alex. Ready to supercharge your studies?</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/ai-studio" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              New Session
            </Link>
          </div>
        </div>
        
        <div className="max-w-3xl">
          <FileUpload onFilesSelected={handleInitialUpload} />
        </div>
      </div>

      {/* Recommended Tools Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">Recommended for You</h2>
          <Link to="/tools" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            View all tools <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map(tool => (
            <Link key={tool.id} to={tool.path} className="group p-6 rounded-2xl border border-white/5 bg-surface-dark/50 hover:bg-surface-hover hover:border-primary/30 transition-all tool-card">
              <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors text-slate-500 group-hover:text-white">
                <span className="material-symbols-outlined">{tool.icon}</span>
              </div>
              <h3 className="font-bold mb-1">{tool.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Studio Quick Access */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <span className="material-symbols-outlined text-9xl">auto_awesome</span>
        </div>
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <h2 className="text-2xl font-bold tracking-tight">AI Study Studio</h2>
          </div>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Generate flashcards, summaries, and quizzes from your documents instantly. Let AI be your personal tutor.
          </p>
          <Link to="/ai-studio" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20">
            Open AI Studio
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
