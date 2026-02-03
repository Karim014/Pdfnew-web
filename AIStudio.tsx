
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';
import { chatWithGemini, analyzeDocument } from '../services/geminiService';
import { fileToBase64, formatSize } from '../utils/fileHelpers';
import { chatStore } from '../services/chatStore';
import { authService } from '../services/authService';
import { marked } from 'marked';

// --- Flashcard Component ---

interface Flashcard {
  front: string;
  back: string;
}

const FlashcardUI: React.FC<{ card: Flashcard }> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      onClick={() => setIsFlipped(!isFlipped)}
      className="group perspective w-full h-56 cursor-pointer"
    >
      <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute inset-0 backface-hidden bg-surface-dark border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Question</span>
          <p className="text-base font-semibold leading-relaxed text-slate-100">{card.front}</p>
          <div className="mt-auto pt-4 flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold">
            <span className="material-symbols-outlined text-sm">touch_app</span> Tap to reveal
          </div>
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-primary/20 to-indigo-900/40 border border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4">Answer</span>
          <p className="text-lg font-black leading-relaxed text-white">{card.back}</p>
          <div className="mt-auto pt-4 flex items-center gap-2 text-primary text-[10px] uppercase font-bold">
            <span className="material-symbols-outlined text-sm">replay</span> Tap to flip back
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[\s*\{\s*"front"[\s\S]*\}\s*\]/);
  
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[0].includes('```json') ? jsonMatch[1] : jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].front) {
        return (
          <div className="w-full space-y-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">style</span>
                <h4 className="text-xs font-black uppercase tracking-widest text-primary">Generated Study Set</h4>
              </div>
              <span className="text-[10px] text-slate-500 font-bold">{parsed.length} Cards</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parsed.map((card, i) => (
                <FlashcardUI key={i} card={card} />
              ))}
            </div>
          </div>
        );
      }
    } catch (e) {
      console.error("JSON parse failed", e);
    }
  }

  const html = marked.parse(text);
  return (
    <div 
      className="prose prose-invert prose-sm max-w-none prose-headings:font-black prose-p:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const AIStudio = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [creditError, setCreditError] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    return chatStore.subscribe((msgs) => {
      if (msgs.length === 0) {
        chatStore.addMessage('model', `Hi ${user.name}! I'm your StudyFlow Assistant. Upload your study materials, and I'll help you summarize them, create flashcards, or answer specific questions.`);
      } else {
        setMessages(msgs);
      }
    });
  }, [user]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  const checkAndDeductCredits = (): boolean => {
    const currentUser = authService.getCurrentUserSync();
    if (!currentUser || currentUser.credits < 0.5) {
      setCreditError(true);
      return false;
    }
    authService.updateUser({ credits: currentUser.credits - 0.5 });
    authService.getCurrentUser().then(setUser);
    setCreditError(false);
    return true;
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    
    if (!checkAndDeductCredits()) return;

    const currentInput = inputText;
    setInputText('');
    chatStore.addMessage('user', currentInput);
    setIsTyping(true);

    try {
      const allMessages = [...messages, { role: 'user', text: currentInput } as any];
      const response = await chatWithGemini(allMessages);
      chatStore.addMessage('model', response || 'No response from engine.');
    } catch (err: any) {
      chatStore.addMessage('model', `System Error: ${err.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setUploadedFiles(prev => [...prev, ...Array.from(newFiles)]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickAction = async (task: string) => {
    if (uploadedFiles.length === 0 || !user) return;
    
    if (!checkAndDeductCredits()) return;

    const file = uploadedFiles[0];
    chatStore.addMessage('user', `Please perform ${task} on "${file.name}"`);
    setIsTyping(true);
    
    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeDocument(base64, file.type, task);
      chatStore.addMessage('model', result);
    } catch (err: any) {
      chatStore.addMessage('model', `Document Analysis Failed: ${err.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full bg-background-dark">
      <aside className="hidden lg:flex flex-col w-80 border-r border-white/5 bg-background-dark/50 p-6 gap-6 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <div>
            <h2 className="text-base font-black">AI Studio</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Workspace Context</p>
          </div>
        </div>

        <div className="space-y-4">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center group
              ${isDragging ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
          >
            <span className="material-symbols-outlined text-slate-600 mb-2 block group-hover:text-primary transition-colors">upload_file</span>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drop Study Material</p>
            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={(e) => handleFiles(e.target.files)} />
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-dark border border-white/5 group">
                <span className="material-symbols-outlined text-slate-500 text-lg">description</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{file.name}</p>
                  <p className="text-[9px] text-slate-600 font-bold">{formatSize(file.size)}</p>
                </div>
                <button onClick={() => removeFile(i)} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Context Actions</label>
            <div className="grid grid-cols-1 gap-2">
              {['summarize', 'flashcards', 'quiz', 'explain'].map((action) => (
                <button 
                  key={action}
                  disabled={uploadedFiles.length === 0}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 disabled:opacity-30 transition-all text-xs font-bold text-left capitalize"
                >
                  <span className={`material-symbols-outlined text-sm ${action === 'summarize' ? 'text-blue-400' : action === 'flashcards' ? 'text-purple-400' : action === 'quiz' ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {action === 'summarize' ? 'summarize' : action === 'flashcards' ? 'style' : action === 'quiz' ? 'quiz' : 'school'}
                  </span>
                  {action === 'flashcards' ? 'Flashcard Gen' : action}
                </button>
              ))}
            </div>
            <button 
              onClick={() => chatStore.clearHistory()}
              className="w-full mt-4 text-[10px] font-bold text-slate-600 hover:text-red-400 transition-colors uppercase tracking-widest text-center py-2"
            >
              Clear Session History
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          {creditError && (
             <div className="flex justify-center animate-in fade-in slide-in-from-top-2">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 max-w-md">
                   <span className="material-symbols-outlined text-red-500">warning</span>
                   <div className="flex-1">
                      <p className="text-xs font-bold text-red-500">Insufficient Credits</p>
                      <p className="text-[10px] text-slate-400">You need 0.5 CR per AI message. Please upgrade your plan.</p>
                   </div>
                   <button 
                     onClick={() => window.location.hash = '#/pricing-app'}
                     className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase rounded-lg shadow-lg"
                   >
                     Upgrade
                   </button>
                </div>
             </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`size-9 rounded-xl shrink-0 flex items-center justify-center font-black text-[10px] shadow-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface-dark border border-white/10 text-primary'}`}>
                  {msg.role === 'user' ? 'ME' : 'SF'}
                </div>
                <div className={`p-5 rounded-2xl shadow-xl transition-all ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-surface-dark border border-white/5 text-slate-200 rounded-tl-none'}`}>
                  {msg.role === 'user' ? (
                    <div className="text-sm font-medium whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <MessageContent text={msg.text} />
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="size-9 rounded-xl bg-surface-dark border border-white/10 flex items-center justify-center text-primary font-black text-[10px]">SF</div>
                <div className="flex items-center gap-2 p-5 rounded-2xl bg-surface-dark border border-white/5 text-slate-500 text-xs">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 md:p-8 bg-gradient-to-t from-background-dark to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-end gap-3 bg-surface-dark/80 backdrop-blur-xl rounded-[1.5rem] p-3 border border-white/10 shadow-2xl">
              <button className="p-3 text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">attach_file</span></button>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask your tutor anything... (0.5 CR)"
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-1 max-h-40 resize-none placeholder:text-slate-600"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className={`p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-all ${(!inputText.trim() || isTyping) ? 'opacity-30' : 'hover:scale-105 active:scale-95'}`}
              >
                <span className="material-symbols-outlined text-lg">arrow_upward</span>
              </button>
            </div>
          </div>
          <p className="text-center mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">0.5 Credits per request</p>
        </div>
      </div>

      <style>{`
        .perspective { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AIStudio;
