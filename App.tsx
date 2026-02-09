
import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AudioPlayer } from './components/AudioPlayer';
import { UploadedFile } from './types';
import { analyzeMedicalReports } from './services/geminiService';

const App: React.FC = () => {
  // Navigation View
  const [view, setView] = useState<'home' | 'privacy'>('home');

  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'light' | 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authView, setAuthView] = useState<'signin' | 'signup' | null>(null);
  const [authFormData, setAuthFormData] = useState({ email: '', password: '', name: '' });
  const [authLoading, setAuthLoading] = useState(false);

  // App Content State
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Establishing secure connection...",
    "Scanning document structure...",
    "Extracting biomarkers...",
    "Simplifying medical jargon...",
    "Finalizing interpretation..."
  ];

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingStep(s => (s < steps.length - 1 ? s + 1 : s));
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleAuthAction = (action: 'signin' | 'signup' | 'signout') => {
    if (action === 'signout') {
      setUser(null);
      setResult(null);
      setFiles([]);
      setAuthView(null);
    } else {
      setAuthView(action);
      setResult(null); 
      // Ensure page scrolls to top on auth view change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setTimeout(() => {
      // PERSIST ACCOUNT FLAG: help smart routing in the future
      localStorage.setItem('medi_sense_account_exists', 'true');
      
      setUser({ 
        name: authFormData.name || authFormData.email.split('@')[0], 
        email: authFormData.email 
      });
      setAuthLoading(false);
      setAuthView(null);
      setAuthFormData({ email: '', password: '', name: '' });
    }, 1200);
  };

  const checkAuthGate = () => {
    if (!user) {
      const accountExists = localStorage.getItem('medi_sense_account_exists');
      handleAuthAction(accountExists ? 'signin' : 'signup');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles].slice(0, 5));
      setError(null);
    }
  };

  const handleUploadClick = () => {
    if (isAnalyzing) return;
    if (checkAuthGate()) {
      fileInputRef.current?.click();
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!checkAuthGate()) return;
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const base64Images = await Promise.all(files.map(f => fileToBase64(f.file)));
      const analysis = await analyzeMedicalReports(base64Images);
      setResult(analysis);
    } catch (err: any) {
      setError("An error occurred during analysis. Please check your internet connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const renderHome = () => (
    <div className="space-y-12 lg:space-y-20 max-w-none mx-auto">
      {/* Hero Section - Visible only when not in results or auth mode */}
      {!result && !authView && (
        <div className="text-center space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-top duration-700 lg:pt-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-700 dark:text-teal-400 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
            Clinical Data Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[10rem] 2xl:text-[12rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] text-balance max-w-[95%] mx-auto">
            Understand Your Health <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-teal-500 to-indigo-600">
              Clearer & Faster.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-slate-600 dark:text-slate-400 max-w-[80%] mx-auto leading-relaxed font-semibold px-4 opacity-80">
            Securely translate your complex medical reports into simple, empathetic, and actionable summaries instantly.
          </p>
        </div>
      )}

      {authView ? (
        <div className="max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-500 py-10">
          <div className="glass-panel rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-14 shadow-3xl relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                {authView === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-bold">
                Access your secure clinical interpretation suite.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-5 sm:space-y-6">
              {authView === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-3">Full Name</label>
                  <input required type="text" placeholder="John Doe" value={authFormData.name} onChange={(e) => setAuthFormData({...authFormData, name: e.target.value})} className="w-full px-6 py-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none transition-all dark:text-white font-bold text-lg" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-3">Email Address</label>
                <input required type="email" placeholder="name@email.com" value={authFormData.email} onChange={(e) => setAuthFormData({...authFormData, email: e.target.value})} className="w-full px-6 py-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none transition-all dark:text-white font-bold text-lg" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-3">Secure Password</label>
                <input required type="password" placeholder="••••••••" value={authFormData.password} onChange={(e) => setAuthFormData({...authFormData, password: e.target.value})} className="w-full px-6 py-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none transition-all dark:text-white font-bold text-lg" />
              </div>
              <button disabled={authLoading} type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-5 sm:py-6 rounded-2xl font-black text-xl hover:bg-teal-600 dark:hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center mt-6 shadow-2xl shadow-teal-500/10">
                {authLoading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <span>{authView === 'signin' ? 'Sign In' : 'Join Workspace'}</span>}
              </button>
            </form>

            <div className="mt-10 text-center space-y-6">
              <p className="text-sm sm:text-base font-bold text-slate-500">
                {authView === 'signin' ? "Don't have an account?" : "Already a member?"}
                <button onClick={() => setAuthView(authView === 'signin' ? 'signup' : 'signin')} className="ml-2 text-teal-600 dark:text-teal-400 hover:underline font-black">{authView === 'signin' ? 'Join Now' : 'Sign In'}</button>
              </p>
              <button onClick={() => setAuthView(null)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-800 dark:hover:text-white border-t border-slate-100 dark:border-slate-800 w-full pt-8">Cancel and return</button>
            </div>
          </div>
        </div>
      ) : !result ? (
        <div className="max-w-[1400px] mx-auto px-2">
          <div className="glass-panel rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-14 lg:p-16 border border-white dark:border-slate-800 shadow-2xl overflow-hidden">
            <div onClick={handleUploadClick} className={`relative border-2 border-dashed rounded-[1.5rem] sm:rounded-[2.5rem] p-12 sm:p-20 lg:p-32 text-center transition-all cursor-pointer ${isAnalyzing ? 'border-teal-500 bg-teal-50/10' : 'border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/20 shadow-inner'}`}>
              {isAnalyzing && <div className="scanning-line"></div>}
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <div className="flex flex-col items-center gap-10">
                {isAnalyzing ? (
                  <div className="space-y-10 w-full max-w-md">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight animate-pulse">{steps[loadingStep]}</p>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner p-1">
                      <div className="h-full bg-teal-500 transition-all duration-1000 ease-out shimmer" style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 sm:w-32 bg-teal-50 dark:bg-teal-900/20 rounded-[2rem] flex items-center justify-center text-teal-600 shadow-xl border border-teal-100 dark:border-teal-900/30 group-hover:scale-110 transition-transform">
                      <svg className="w-12 h-12 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <div className="space-y-4">
                      <p className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">Interpret Lab Scans</p>
                      <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] sm:text-sm lg:text-base">Secure Clinical E2EE Encryption</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {files.length > 0 && !isAnalyzing && (
              <div className="mt-16 space-y-12 animate-in fade-in duration-500">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-8">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 sm:w-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-black text-xl sm:text-3xl">{files.length}</div>
                      <h3 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">Documents Ready</h3>
                   </div>
                   <button onClick={() => setFiles([])} className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-rose-600 transition-colors">Discard All</button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 sm:gap-10">
                  {files.map((file) => (
                    <div key={file.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl group border border-slate-100 dark:border-slate-800 ring-4 ring-transparent transition-all hover:ring-teal-500 hover:-translate-y-4">
                      <img src={file.preview} alt="Scan" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md">
                         <button onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} className="bg-white text-rose-600 p-3 sm:p-4 rounded-xl shadow-2xl hover:scale-110 active:scale-95 transition-all"><svg className="w-6 h-6 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6" /></svg></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center pt-10">
                  <button onClick={handleAnalyze} className="w-full sm:w-auto bg-teal-600 text-white px-14 py-6 sm:py-8 rounded-[2rem] font-black text-xl sm:text-2xl shadow-4xl hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Analyze Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-16 lg:space-y-24 animate-in fade-in slide-in-from-bottom-10 duration-700 max-w-none mx-auto pb-32 lg:pb-48 px-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8 lg:gap-14 px-4 xl:px-10">
            <button onClick={reset} className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-10 py-6 sm:py-8 rounded-[2rem] text-slate-800 dark:text-slate-200 hover:text-teal-600 flex items-center justify-center gap-4 font-black text-xl lg:text-2xl shadow-xl transition-all hover:shadow-4xl">
              <svg className="w-6 h-6 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              New Interpretation
            </button>
            <div className="w-full sm:w-auto">
              <AudioPlayer text={result} />
            </div>
          </div>

          <div className="glass-panel rounded-[2.5rem] sm:rounded-[4rem] shadow-4xl p-8 sm:p-16 lg:p-24 2xl:p-32 border border-white dark:border-slate-800">
            <div className="space-y-16 sm:space-y-24">
              {result.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('###')) {
                  return (
                    <div key={idx} className="flex flex-col gap-8 pt-16 sm:pt-24 first:pt-0">
                      <div className="flex items-center gap-6 sm:gap-8">
                        <div className="w-2 sm:w-3 h-10 sm:h-16 bg-teal-500 rounded-full shadow-2xl"></div>
                        <h3 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{trimmed.replace('###', '').trim()}</h3>
                      </div>
                      <div className="h-[2px] w-full bg-slate-100 dark:bg-slate-800/40"></div>
                    </div>
                  );
                }
                if (trimmed.startsWith('|')) {
                  const parts = trimmed.split('|').filter(p => p.trim() !== '');
                  if (parts[0].includes('Test Name') || parts[0].includes('---')) return null;
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] sm:rounded-[3rem] p-8 lg:p-12 xl:p-16 flex flex-col xl:flex-row xl:items-center gap-8 lg:gap-16 hover:shadow-2xl transition-all border-l-8 lg:border-l-[16px] hover:border-l-teal-500 relative overflow-hidden group">
                      <div className="flex-1 space-y-2 lg:space-y-4">
                        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Biomarker Identification</p>
                        <p className="text-xl sm:text-3xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-teal-600 transition-colors">{parts[0]?.trim()}</p>
                      </div>
                      <div className="shrink-0 flex flex-col items-center xl:items-start space-y-2 lg:space-y-4">
                        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Measured Value</p>
                        <span className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 px-6 py-3 sm:px-8 sm:py-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">{parts[1]?.trim()}</span>
                      </div>
                      <div className="xl:w-2/5 px-8 py-6 lg:px-10 lg:py-10 rounded-2xl lg:rounded-3xl bg-teal-50/30 dark:bg-teal-900/10 text-teal-800 dark:text-teal-400 border border-teal-100 dark:border-teal-900/20 text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold leading-relaxed shadow-sm">
                        {parts[3]?.trim()}
                      </div>
                    </div>
                  );
                }
                if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                  return (
                    <div key={idx} className="flex gap-6 items-center bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-8 sm:p-12 xl:p-16 rounded-[2rem] lg:rounded-[3rem] hover:shadow-xl transition-all group">
                      <div className="w-12 h-12 sm:w-16 lg:w-20 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 shrink-0 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xl">
                        <svg className="w-8 h-8 lg:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-xl sm:text-2xl lg:text-4xl text-slate-800 dark:text-slate-200 font-black tracking-tight">{trimmed.substring(1).trim()}</p>
                    </div>
                  );
                }
                if (trimmed === '') return null;
                return <p key={idx} className="text-lg sm:text-2xl lg:text-4xl text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic opacity-80">{trimmed}</p>;
              })}
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 rounded-[2.5rem] lg:rounded-[5rem] p-10 lg:p-20 xl:p-32 relative overflow-hidden group border border-slate-800 shadow-4xl">
            <div className="flex flex-col lg:flex-row gap-10 sm:gap-16 items-center relative z-10">
              <div className="w-20 h-20 sm:w-28 xl:w-40 xl:h-40 rounded-3xl xl:rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center text-teal-400 shrink-0 shadow-3xl">
                <svg className="w-10 h-10 sm:w-14 xl:w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div className="space-y-6 text-center lg:text-left">
                <h4 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-black text-white tracking-tight">Interpretive Safety Disclaimer</h4>
                <p className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl text-slate-400 font-bold opacity-80 leading-relaxed">
                  Final clinical diagnostic decisions and therapeutic pathways must be established by your certified healthcare professional. Do not modify treatments based on this analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPrivacy = () => (
    <div className="max-w-[1400px] mx-auto space-y-16 lg:space-y-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-6 lg:space-y-10">
        <h1 className="text-5xl sm:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white tracking-tighter">Privacy Protocol</h1>
        <p className="text-xl sm:text-3xl lg:text-4xl text-slate-500 font-bold max-w-4xl mx-auto leading-relaxed">Your medical data is temporary and secure. We do not persist sensitive files or clinical biomarkers.</p>
      </div>
      
      <div className="glass-panel rounded-[3rem] sm:rounded-[5rem] p-10 sm:p-24 lg:p-32 space-y-16 sm:space-y-24 border border-white dark:border-slate-800 shadow-4xl relative overflow-hidden">
        <section className="space-y-8 sm:space-y-12">
          <div className="flex items-center gap-6">
             <div className="w-2 h-10 sm:h-16 bg-teal-500 rounded-full shadow-2xl"></div>
             <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-widest">Data Ephemerality</h2>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Medi-Sense parses your reports in real-time. Uploaded images are converted into temporary memory strings for processing via the Google Gemini API and are never permanently stored on our servers. Closing the browser session or starting a new interpretation wipes all trace from active memory.
          </p>
        </section>

        <section className="space-y-8 sm:space-y-12">
          <div className="flex items-center gap-6">
             <div className="w-2 h-10 sm:h-16 bg-teal-500 rounded-full shadow-2xl"></div>
             <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-widest">Hardened Protection</h2>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Communication between your browser and our secure analysis engine is protected by AES-256 SSL/TLS encryption. We do not monetize your health data, nor do we share clinical markers with advertising brokers.
          </p>
        </section>

        <div className="pt-12 sm:pt-20 border-t border-slate-100 dark:border-slate-800 flex justify-center lg:justify-start">
           <button onClick={() => setView('home')} className="bg-teal-600 text-white px-12 py-6 sm:px-16 sm:py-8 rounded-3xl font-black uppercase tracking-widest text-lg sm:text-2xl shadow-4xl hover:bg-teal-700 transition-all hover:scale-105">
              Back to workspace
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout 
      theme={theme} 
      toggleTheme={toggleTheme} 
      user={user} 
      onAuthAction={handleAuthAction} 
      onNavigate={(v) => { setView(v); window.scrollTo(0,0); }}
      currentView={view}
    >
      {view === 'home' ? renderHome() : renderPrivacy()}
    </Layout>
  );
};

export default App;
