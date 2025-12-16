import React from 'react';
import { CipherWorkspace } from './components/CipherWorkspace';
import { Terminal, Eraser } from 'lucide-react';

const App: React.FC = () => {
  
  const handleEraseTraces = () => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies (simple brute force for current path)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Hard reload to reset application state and clear JS heap
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-indigo-500/30 font-sans flex flex-col">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-800/50 rounded-lg border border-neutral-700/50 shadow-inner">
              <Terminal className="w-5 h-5 text-neutral-100" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-neutral-100">
              Custom Key <span className="text-indigo-400">Encoder & Decoder</span>
            </h1>
          </div>
          
          <button 
            onClick={handleEraseTraces}
            className="group flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wide rounded-md border border-red-500/20 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95"
            title="Purge all data and reload"
          >
            <Eraser className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Erase my traces!</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <CipherWorkspace />
        </div>
      </main>

      <footer className="py-6 text-center text-neutral-600 text-sm border-t border-neutral-800/50">
        <p>Optimized for performance with O(1) lookups.</p>
      </footer>
    </div>
  );
};

export default App;