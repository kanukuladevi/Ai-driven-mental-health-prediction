import React, { useState } from 'react';
import { AnalysisResult, AnalysisStatus, NavTab } from './types';
import { analyzeSentiment } from './services/gemini';
import { InputArea } from './components/InputArea';
import { ResultDashboard } from './components/ResultDashboard';
import { LoginPage } from './components/LoginPage';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { GameCenter } from './components/GameCenter';
import { MessageSquareHeart, Github, LogOut, Video, Gamepad2, Type } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<{name: string, avatar: string} | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('text');

  // Text Analysis State
  const [inputText, setInputText] = useState<string>('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    // Generate a deterministic avatar using DiceBear API
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    setUser({ name: username, avatar: avatarUrl });
  };

  const handleLogout = () => {
    setUser(null);
    setResult(null);
    setInputText('');
    setStatus(AnalysisStatus.IDLE);
    setActiveTab('text');
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeSentiment(inputText);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err) {
      setError("Failed to analyze text. Please try again or check your API key configuration.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setError(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <MessageSquareHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Sentimood
              </h1>
              <p className="text-xs text-slate-400 font-medium">AI Emotion Analytics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-slate-50 py-1.5 px-2 pr-4 rounded-full border border-slate-100">
              <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full bg-indigo-100" />
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-slate-700 leading-tight">{user.name}</span>
                 <span className="text-[10px] text-slate-400 font-medium leading-tight">Pro Member</span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6 -mb-px">
            <button
              onClick={() => setActiveTab('text')}
              className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'text' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              <Type className="w-4 h-4" />
              Text Analysis
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'video' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              <Video className="w-4 h-4" />
              Video Emotion AI
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={`pb-4 px-2 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'games' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              <Gamepad2 className="w-4 h-4" />
              Mind Refreshment
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {activeTab === 'text' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full animate-fade-in">
            {/* Left Panel: Input */}
            <div className={`lg:col-span-5 lg:h-[calc(100vh-200px)] lg:sticky lg:top-36 transition-all duration-500 ease-in-out`}>
               <div className="h-full">
                 <InputArea 
                   inputText={inputText}
                   setInputText={setInputText}
                   onAnalyze={handleAnalyze}
                   status={status}
                   onClear={handleClear}
                 />
               </div>
            </div>

            {/* Right Panel: Results */}
            <div className="lg:col-span-7">
              {status === AnalysisStatus.IDLE && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-60">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-3xl mb-6 shadow-inner">
                    <MessageSquareHeart className="w-16 h-16 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Ready to Analyze</h3>
                  <p className="text-slate-500 max-w-md text-lg leading-relaxed">
                    Paste a social media post to uncover emotional insights using Gemini Flash 2.5.
                  </p>
                </div>
              )}

              {status === AnalysisStatus.ERROR && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-800">
                  <p className="font-semibold">Oops! Something went wrong.</p>
                  <p className="text-sm mt-2">{error}</p>
                </div>
              )}

              {status === AnalysisStatus.ANALYZING && (
                <div className="h-64 flex flex-col items-center justify-center">
                   <div className="relative">
                     <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
                     </div>
                   </div>
                   <p className="mt-6 text-indigo-900 font-medium animate-pulse">Decoding emotions...</p>
                </div>
              )}

              {status === AnalysisStatus.SUCCESS && result && (
                <ResultDashboard result={result} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'video' && <VideoAnalyzer />}
        
        {activeTab === 'games' && <GameCenter />}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Sentimood Analyzer</p>
          <a href="#" className="flex items-center gap-2 hover:text-indigo-600 transition-colors font-medium">
            <Github className="w-4 h-4" />
            <span>Open Source</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
