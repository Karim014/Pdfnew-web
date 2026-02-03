
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../constants';

const ToolsHub = () => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Convert', 'Optimize', 'Organize', 'AI Tools'];

  const filteredTools = filter === 'All' 
    ? TOOLS 
    : TOOLS.filter(t => t.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col gap-8 items-center text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight">Explore Tools</h1>
        
        <div className="w-full max-w-2xl relative">
          <div className="absolute inset-y-0 left-4 flex items-center text-primary">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input 
            type="text" 
            placeholder="Search for a tool (e.g., 'Merge PDF')..." 
            className="w-full h-14 pl-12 pr-4 bg-surface-dark border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 bg-surface-dark p-1.5 rounded-2xl border border-white/5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${filter === cat ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => (
          <Link key={tool.id} to={tool.path} className="group relative p-6 rounded-3xl border border-white/5 bg-surface-dark/50 hover:bg-surface-hover hover:border-primary/40 transition-all duration-300 tool-card flex flex-col justify-between min-h-[220px]">
            {tool.isPro && (
              <span className="absolute top-4 right-4 bg-gradient-to-r from-amber-200 to-yellow-500 text-yellow-900 text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm">PRO</span>
            )}
            <div>
              <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-3xl">{tool.icon}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{tool.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{tool.description}</p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{tool.category}</span>
              <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-lg shadow-primary/20">Open</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ToolsHub;
