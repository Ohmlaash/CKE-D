import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Copy, AlertTriangle, Trash2, KeyRound, Play, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { generateKeyMap, encodeString, decodeString, cleanKey, getDuplicateChars, isValidBase64, sanitizeBase64Input, PRESETS } from '../utils/cipherUtils';

export const CipherWorkspace: React.FC = () => {
  // State
  const [keyString, setKeyString] = useState<string>(PRESETS.BASE64);
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  
  // Validation / Feedback State
  const [validationMsg, setValidationMsg] = useState<{type: 'error' | 'warning', text: string} | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Constants
  const separator = ' ';

  // Derived State
  const keyMap = useMemo(() => generateKeyMap(keyString), [keyString]);
  const duplicates = useMemo(() => getDuplicateChars(keyString), [keyString]);
  
  // Logic
  const handleProcess = () => {
    setValidationMsg(null);
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    try {
      if (mode === 'encode') {
        const cleanInput = sanitizeBase64Input(inputText);
        const { result, hasUnmapped } = encodeString(cleanInput, keyMap, separator);
        
        setOutputText(result);
        
        if (hasUnmapped) {
          setValidationMsg({
            type: 'warning',
            text: 'Some characters in the input were not found in the Key and were left as-is.'
          });
        }
      } else {
        const { result, hasErrors } = decodeString(inputText, keyString, separator);
        
        setOutputText(result);
        
        if (hasErrors) {
          setValidationMsg({
            type: 'error',
            text: 'Input contained codes that were invalid or out of bounds for the current key.'
          });
        }
      }
    } catch (e) {
      setOutputText('Error processing text.');
    }
  };

  const swapMode = () => {
    if (outputText) {
      setInputText(outputText);
    } else {
      setInputText('');
    }
    
    setOutputText('');
    setValidationMsg(null);
    setMode(prev => prev === 'encode' ? 'decode' : 'encode');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCleanKey = () => {
    setKeyString(cleanKey(keyString));
  };

  const resetKey = () => {
    setKeyString(PRESETS.BASE64);
  };

  // Helper for input placeholder
  const inputPlaceholder = mode === 'encode' 
    ? "Paste Base64 string here..." 
    : "Paste encoded sequence here (e.g. 1 2 55 64...)";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      
      {/* Configuration Panel (Left) */}
      <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
        
        {/* Key Editor */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <h2 className="font-semibold text-neutral-200">Key Configuration</h2>
            </div>
            {duplicates.length > 0 && (
               <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                 <AlertTriangle className="w-3 h-3" /> {duplicates.length} Duplicates
               </span>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs text-neutral-500 leading-relaxed">
              This key maps characters to 1-based indices. 
              {mode === 'encode' ? ' Characters from input are found here.' : ' Codes from input look up characters here.'}
            </p>
            <textarea
              value={keyString}
              onChange={(e) => setKeyString(e.target.value)}
              className={`w-full h-40 bg-neutral-950 border rounded-lg p-3 font-mono text-sm outline-none transition-all resize-none ${
                duplicates.length > 0 ? 'border-amber-500/50 focus:border-amber-500 text-amber-100' : 'border-neutral-700 focus:border-indigo-500 text-indigo-300'
              }`}
              placeholder="Key characters..."
            />
            
            <div className="flex items-center justify-between pt-1">
               <button 
                 onClick={resetKey}
                 className="flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded transition-colors border border-neutral-700"
               >
                 <RotateCcw className="w-3 h-3" /> Reset to Base64
               </button>
               
               {duplicates.length > 0 ? (
                   <button 
                     onClick={handleCleanKey}
                     className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 decoration-amber-500/30"
                   >
                     Fix Duplicates
                   </button>
               ) : (
                   <div className="text-xs text-emerald-500/80 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid Key
                   </div>
               )}
            </div>
          </div>

          <div className="p-3 bg-neutral-950/50 border border-neutral-800 rounded-lg">
             <div className="text-xs font-mono text-neutral-500 flex justify-between">
                <span>Key Length:</span>
                <span className="text-neutral-300">{keyString.length} chars</span>
             </div>
             <div className="text-xs font-mono text-neutral-500 flex justify-between mt-1">
                <span>Mapping:</span>
                <span className="text-neutral-300">Space Separated</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Workspace (Right) */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full order-1 lg:order-2">
        
        {/* Input Section */}
        <div className="flex-1 flex flex-col min-h-[200px] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
          <div className="bg-neutral-900/80 border-b border-neutral-800 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-neutral-300">
                  {mode === 'encode' ? 'Input (Base64)' : 'Input (Encoded)'}
               </span>
               {inputText.length > 0 && mode === 'encode' && isValidBase64(inputText) && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Valid Format</span>
               )}
            </div>
            {inputText && (
              <button 
                onClick={() => setInputText('')}
                className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-neutral-800"
                title="Clear Input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 w-full bg-transparent p-4 font-mono text-sm text-neutral-200 outline-none resize-none placeholder-neutral-700"
            placeholder={inputPlaceholder}
            spellCheck={false}
          />
        </div>

        {/* Control Bar */}
        <div className="flex items-center gap-4 px-1">
           {/* Swap Button */}
           <button 
             onClick={swapMode}
             className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium rounded-lg transition-all border border-neutral-700 hover:border-neutral-600 group shadow-md"
             title="Swap Output to Input and Switch Mode"
           >
             <ArrowLeftRight className="w-4 h-4 text-indigo-400 group-hover:rotate-180 transition-transform duration-300" />
             <span className="hidden sm:inline">Swap & Switch</span>
           </button>

           <div className="flex-1 border-t border-neutral-800"></div>

           {/* Action Button */}
           <button 
             onClick={handleProcess}
             className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-900/20 transition-all hover:scale-105"
           >
             <Play className="w-4 h-4 fill-current" />
             {mode === 'encode' ? 'ENCODE' : 'DECODE'}
           </button>
        </div>

        {/* Output Section */}
        <div className="flex-1 flex flex-col min-h-[200px] bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg relative">
          <div className="bg-neutral-900/80 border-b border-neutral-800 px-4 py-3 flex items-center justify-between backdrop-blur-sm">
            <span className="text-sm font-medium text-emerald-400">
              {mode === 'encode' ? 'Result (Custom Code)' : 'Result (Base64)'}
            </span>
            <button 
              onClick={handleCopy}
              disabled={!outputText}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all border ${
                !outputText ? 'opacity-50 cursor-not-allowed bg-neutral-800 border-neutral-700 text-neutral-500' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700 cursor-pointer shadow-sm'
              }`}
            >
              {isCopied ? <span className="text-emerald-400 font-medium">Copied!</span> : <> <Copy className="w-3.5 h-3.5" /> Copy </>}
            </button>
          </div>
          
          <div className="relative flex-1 bg-neutral-950/30">
             <textarea
              readOnly
              value={outputText}
              placeholder="Result will appear here..."
              className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-sm text-emerald-100/90 outline-none resize-none placeholder-neutral-700/50"
            />
          </div>

          {/* Validation Overlay */}
          {validationMsg && (
             <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-md px-3 py-2 rounded-lg border flex items-center gap-2 text-xs shadow-lg ${
               validationMsg.type === 'error' 
                 ? 'bg-red-950/90 text-red-100 border-red-500/30' 
                 : 'bg-amber-950/90 text-amber-100 border-amber-500/30'
             }`}>
                {validationMsg.type === 'error' ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {validationMsg.text}
             </div>
          )}
        </div>

      </div>
    </div>
  );
};