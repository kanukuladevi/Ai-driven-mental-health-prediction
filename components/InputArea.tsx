import React from 'react';
import { SAMPLE_TEXTS, AnalysisStatus } from '../types';
import { Sparkles, Play, RotateCcw } from 'lucide-react';

interface InputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
  status: AnalysisStatus;
  onClear: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  inputText, 
  setInputText, 
  onAnalyze, 
  status,
  onClear
}) => {
  const isAnalyzing = status === AnalysisStatus.ANALYZING;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          Input Data
        </h2>
        <div className="flex gap-2">
           {SAMPLE_TEXTS.map((sample, idx) => (
             <button
                key={idx}
                onClick={() => setInputText(sample.text)}
                disabled={isAnalyzing}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
             >
               {sample.label}
             </button>
           ))}
        </div>
      </div>

      <textarea
        className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400"
        placeholder="Paste a tweet, comment, or post here to analyze..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isAnalyzing}
      />

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClear}
          disabled={!inputText || isAnalyzing}
          className="px-4 py-2.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-medium transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
        <button
          onClick={onAnalyze}
          disabled={!inputText.trim() || isAnalyzing}
          className={`
            px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all flex items-center gap-2
            ${isAnalyzing 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:transform active:scale-95'
            }
          `}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Analyze Sentiment
            </>
          )}
        </button>
      </div>
    </div>
  );
};