
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants';
import { FileUpload } from '../components/FileUpload';
import { jobStore } from '../services/jobStore';
import { formatSize, fileToBase64 } from '../utils/fileHelpers';
import { performOCR } from '../services/geminiService';
import { authService } from '../services/authService';

const ToolWorkspace = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const tool = TOOLS.find(t => t.id === toolId) || TOOLS[0];
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.initialFiles) {
      setFiles(location.state.initialFiles);
    }
  }, [location.state]);

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    setError(null);
    setIsProcessing(true);
    
    try {
      const job = await jobStore.addJob(tool.name);
      
      if (tool.id === 'ocr') {
        const base64 = await fileToBase64(files[0]);
        const text = await performOCR(base64, files[0].type);
        jobStore.updateJob(job.id, { resultText: text });
        jobStore.runSimulation(job.id, 2000, undefined, text);
      } else {
        await jobStore.runSimulation(job.id);
      }
      setFiles([]);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("credits")) {
        // Option to navigate to pricing if credits are low
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-black mb-1">{tool.name}</h1>
            <p className="text-slate-500">{tool.description}</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-500 text-sm font-bold">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
              {error.includes("credits") && (
                <button 
                  onClick={() => navigate('/pricing-app')}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          )}

          {files.length === 0 ? (
            <FileUpload onFilesSelected={setFiles} multiple={tool.id === 'merge'} />
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-white/5 group">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{formatSize(file.size)}</p>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-slate-600 hover:text-red-500 p-2"><span className="material-symbols-outlined text-lg">delete</span></button>
                  </div>
                ))}
                {tool.id === 'merge' && (
                  <button 
                    onClick={() => setFiles([])}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-white/5 hover:border-primary/50 text-slate-500 hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined">add</span>
                    <span className="text-xs font-bold">Add more</span>
                  </button>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-6">
                <button onClick={() => setFiles([])} className="px-6 py-3 rounded-xl border border-white/5 text-sm font-bold hover:bg-white/5">Cancel</button>
                <button 
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className={`px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                  {isProcessing ? 'Processing...' : `Process ${files.length} File(s) (0.5 CR)`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="w-full lg:w-80 bg-surface-dark/50 border-l border-white/5 p-6 flex flex-col gap-8 shrink-0">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined">settings</span>
          <h2 className="text-sm font-bold uppercase tracking-widest">Configuration</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Output Filename</label>
            <input type="text" className="w-full h-11 bg-surface-dark border border-white/10 rounded-xl px-4 text-sm" placeholder="Processed_Document" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quality Level</label>
            <div className="flex bg-background-dark p-1 rounded-xl">
              <button className="flex-1 py-1.5 text-[10px] font-bold rounded-lg text-slate-500 hover:text-white">Low</button>
              <button className="flex-1 py-1.5 text-[10px] font-bold rounded-lg bg-white/5 text-primary">Standard</button>
              <button className="flex-1 py-1.5 text-[10px] font-bold rounded-lg text-slate-500 hover:text-white">High</button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
             <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-xs text-primary">info</span>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Cost Estimate</p>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              This operation will deduct <b>0.5 Credits</b> from your balance. Total duration estimated at ~3 seconds.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ToolWorkspace;
