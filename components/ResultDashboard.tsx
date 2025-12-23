import React from 'react';
import { AnalysisResult } from '../types';
import { EmotionChart } from './EmotionChart';
import { Brain, Sparkles, Zap, Activity } from 'lucide-react';

interface ResultDashboardProps {
  result: AnalysisResult;
}

// Helper to get emotion-specific styles and icons
const getEmotionMetadata = (emotion: string) => {
  const e = emotion.toLowerCase();
  
  const map: Record<string, { gradient: string; icon: string; bg: string; text: string }> = {
    joy: { gradient: 'from-amber-400 to-orange-500', icon: '🤩', bg: 'bg-amber-50', text: 'text-amber-700' },
    happiness: { gradient: 'from-yellow-400 to-amber-500', icon: '😊', bg: 'bg-yellow-50', text: 'text-yellow-700' },
    excitement: { gradient: 'from-orange-400 to-red-500', icon: '🎉', bg: 'bg-orange-50', text: 'text-orange-700' },
    anger: { gradient: 'from-red-500 to-rose-600', icon: '🤬', bg: 'bg-red-50', text: 'text-red-700' },
    sadness: { gradient: 'from-blue-400 to-indigo-500', icon: '😢', bg: 'bg-blue-50', text: 'text-blue-700' },
    fear: { gradient: 'from-purple-500 to-violet-600', icon: '😨', bg: 'bg-purple-50', text: 'text-purple-700' },
    surprise: { gradient: 'from-teal-400 to-emerald-500', icon: '😲', bg: 'bg-teal-50', text: 'text-teal-700' },
    disgust: { gradient: 'from-lime-500 to-green-600', icon: '🤢', bg: 'bg-lime-50', text: 'text-lime-700' },
    trust: { gradient: 'from-cyan-400 to-blue-500', icon: '🤝', bg: 'bg-cyan-50', text: 'text-cyan-700' },
    neutral: { gradient: 'from-slate-400 to-gray-500', icon: '😐', bg: 'bg-slate-50', text: 'text-slate-700' },
  };

  // Default fallback
  return map[e] || { gradient: 'from-indigo-500 to-purple-600', icon: '✨', bg: 'bg-indigo-50', text: 'text-indigo-700' };
};

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ result }) => {
  const metadata = getEmotionMetadata(result.primaryEmotion);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      
      {/* Top Hero Section */}
      <div className={`rounded-3xl p-1 bg-gradient-to-r ${metadata.gradient} shadow-xl shadow-indigo-100`}>
        <div className="bg-white rounded-[20px] p-6 md:p-8 relative overflow-hidden h-full">
          {/* Background decoration */}
          <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-10 blur-3xl bg-gradient-to-br ${metadata.gradient}`}></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-500 font-medium text-sm uppercase tracking-wide">
                <Activity className="w-4 h-4" />
                Dominant Emotion
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-6xl filter drop-shadow-md hover:scale-110 transition-transform cursor-default">
                   {metadata.icon}
                 </span>
                 <div>
                   <h2 className="text-4xl font-extrabold text-slate-900 capitalize tracking-tight">
                     {result.primaryEmotion}
                   </h2>
                   <div className="flex items-center gap-2 mt-1">
                     <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full rounded-full bg-gradient-to-r ${metadata.gradient}`} 
                         style={{ width: `${result.intensity}%` }}
                       />
                     </div>
                     <span className="text-sm font-semibold text-slate-400">{result.intensity}% Intensity</span>
                   </div>
                 </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-sm font-semibold text-slate-600">Sentiment Polarity</span>
                 <span className={`text-lg font-bold ${result.sentimentScore > 0 ? 'text-green-600' : result.sentimentScore < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                   {result.sentimentScore > 0 ? '+' : ''}{result.sentimentScore.toFixed(2)}
                 </span>
               </div>
               
               {/* Advanced Gauge Bar */}
               <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  {/* Center Marker */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-20"></div>
                  
                  {/* Fill */}
                  <div 
                    className={`absolute top-0 bottom-0 transition-all duration-1000 ease-out z-10 ${
                      result.sentimentScore >= 0 
                        ? 'bg-gradient-to-r from-slate-200 to-green-500 left-1/2 rounded-r-full' 
                        : 'bg-gradient-to-l from-slate-200 to-red-500 right-1/2 rounded-l-full'
                    }`}
                    style={{ 
                      width: `${Math.abs(result.sentimentScore) * 50}%`,
                    }} 
                  />
               </div>
               <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                 <span>Negative (-1.0)</span>
                 <span>Positive (+1.0)</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg shadow-slate-100 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" />
            Emotional Spectrum
          </h3>
          <EmotionChart data={result.emotions} />
        </div>

        {/* Analysis & Insight Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              AI Analysis
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              {result.explanation}
            </p>
          </div>

          <div className={`${metadata.bg} p-6 rounded-3xl border border-transparent`}>
            <h3 className={`text-lg font-bold ${metadata.text} mb-3 flex items-center gap-2`}>
              <Zap className="w-5 h-5 fill-current" />
              Strategic Insight
            </h3>
            <p className={`${metadata.text} leading-relaxed opacity-90 font-medium`}>
              {result.actionableInsight}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};