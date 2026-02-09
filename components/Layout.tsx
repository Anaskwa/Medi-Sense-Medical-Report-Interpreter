
import React, { useState, useRef, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: any;
  onAuthAction: (type: 'signin' | 'signup' | 'signout') => void;
  onNavigate: (view: 'home' | 'privacy') => void;
  currentView: 'home' | 'privacy';
}

export const Layout: React.FC<LayoutProps> = ({ children, theme, toggleTheme, user, onAuthAction, onNavigate, currentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col selection:bg-teal-500 selection:text-white transition-colors duration-500 overflow-x-hidden">
      <header className="sticky top-0 z-50">
        <div className="glass-panel border-b border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-8 lg:px-12 xl:px-20 2xl:px-32">
          <div className="max-w-[1800px] mx-auto h-16 sm:h-20 lg:h-24 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer shrink-0" onClick={() => onNavigate('home')}>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex items-center justify-center">
                <div className="absolute inset-0 bg-teal-500/10 rounded-xl sm:rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-indigo-500/10 rounded-xl sm:rounded-2xl -rotate-6 group-hover:-rotate-12 transition-transform duration-700"></div>
                <div className="relative bg-white dark:bg-slate-900 shadow-sm rounded-lg sm:rounded-[1.25rem] p-2 sm:p-2.5 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full text-teal-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 12L9.5 16L12.5 8L15 14L17.5 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Medi<span className="text-teal-600">Sense</span>
                </span>
                <span className="text-[7px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 dark:text-slate-500 mt-1">AI Interpreter</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="group relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-all hover:border-teal-500/50"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0z" /></svg>
                )}
              </button>

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:border-teal-500 group/btn"
                  >
                    <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white tracking-widest uppercase">Menu</span>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-[10px] sm:text-sm shadow-md transition-transform group-hover/btn:scale-110">
                      {user.name.charAt(0).toLowerCase()}
                    </div>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-60 sm:w-64 glass-panel rounded-2xl p-3 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                      <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Account</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate lowercase">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 truncate mt-1">{user.email}</p>
                      </div>
                      <button 
                        onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-all font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] ${currentView === 'home' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                         Interpreter
                      </button>
                      <button 
                        onClick={() => { onNavigate('privacy'); setIsMenuOpen(false); }}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-all font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] ${currentView === 'privacy' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                         Privacy
                      </button>
                      <button 
                        onClick={() => { onAuthAction('signout'); setIsMenuOpen(false); }}
                        className="w-full text-left px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] border-t border-slate-100 dark:border-slate-800 mt-2"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <button 
                    onClick={() => onAuthAction('signin')}
                    className="px-3 sm:px-5 py-2 text-[10px] sm:text-xs lg:text-sm font-black text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => onAuthAction('signup')}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-black hover:bg-teal-600 dark:hover:bg-teal-500 hover:text-white transition-all shadow-lg uppercase tracking-widest"
                  >
                    Join
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-20 2xl:px-32 py-8 sm:py-12 lg:py-16 relative z-10">
        {children}
      </main>

      <footer className="bg-slate-950 text-slate-400 py-12 sm:py-16 lg:py-20 relative overflow-hidden mt-auto border-t border-slate-900">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-20 2xl:px-32 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 relative z-10">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-4 cursor-pointer" onClick={() => onNavigate('home')}>
              Medi<span className="text-teal-400">Sense</span>
            </h2>
            <p className="max-w-md mx-auto md:mx-0 text-base lg:text-lg font-medium leading-relaxed opacity-60">
              Clear clinical intelligence for the modern patient.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end justify-center gap-6">
            <div className="flex flex-wrap justify-center md:justify-end gap-6 sm:gap-10 text-[9px] sm:text-xs lg:text-sm font-black uppercase tracking-widest text-slate-500">
              <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
              <span className="text-teal-500 whitespace-nowrap">HIPAA Secure</span>
            </div>
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-700 uppercase tracking-widest">&copy; {new Date().getFullYear()} Medi-Sense Labs</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
