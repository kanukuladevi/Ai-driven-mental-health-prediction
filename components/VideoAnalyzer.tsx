import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Zap, VideoOff, Timer, StopCircle, ScanFace } from 'lucide-react';
import { analyzeImageEmotion } from '../services/gemini';
import { VideoAnalysisResult } from '../types';

export const VideoAnalyzer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-analysis state
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user" 
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure we play only after metadata is loaded to avoid blank frames
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
          } catch (e) {
            console.error("Video play failed:", e);
          }
        };
      }
      setIsStreamActive(true);
      setError(null);
    } catch (err: any) {
      console.error("Camera error:", err);
      let msg = "Unable to access camera.";
      if (err.name === 'NotAllowedError') msg = "Camera permission denied. Please allow access in your browser settings.";
      else if (err.name === 'NotFoundError') msg = "No camera device found.";
      else if (err.name === 'NotReadableError') msg = "Camera is currently in use by another application.";
      
      setError(msg);
      setIsStreamActive(false);
    }
  };

  const stopCamera = () => {
    setIsAutoMode(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreamActive(false);
    setResult(null);
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    // Don't clear result immediately in auto mode to prevent flickering
    if (!isAutoMode) setResult(null); 
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Check if video is actually ready
    if (video.readyState !== 4) {
      if (!isAutoMode) setError("Video stream not ready yet.");
      setIsAnalyzing(false);
      return;
    }
    
    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      
      try {
        const data = await analyzeImageEmotion(base64Image);
        setResult(data);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!isAutoMode) setError("Failed to analyze video frame.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [isAnalyzing, isAutoMode]);

  // Handle Auto Mode Logic
  useEffect(() => {
    let intervalId: any;
    
    if (isAutoMode && isStreamActive) {
      // Immediate first capture if idle
      if (!result && !isAnalyzing) {
        captureAndAnalyze();
      }

      // Set up periodic capture
      intervalId = setInterval(() => {
        if (!isAnalyzing) {
          setCountdown((prev) => {
            if (prev <= 1) {
              captureAndAnalyze();
              return 4; // Reset countdown (4 seconds interval)
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      setCountdown(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoMode, isStreamActive, isAnalyzing, captureAndAnalyze, result]);

  // Map emotions to emoji/colors
  const getEmotionDetails = (state: string) => {
    const map: Record<string, { emoji: string, color: string, gradient: string }> = {
      happy: { emoji: '😊', color: 'bg-green-100 text-green-700', gradient: 'from-green-400 to-emerald-500' },
      joy: { emoji: '🤩', color: 'bg-yellow-100 text-yellow-700', gradient: 'from-yellow-400 to-amber-500' },
      sad: { emoji: '😢', color: 'bg-blue-100 text-blue-700', gradient: 'from-blue-400 to-indigo-500' },
      depression: { emoji: '🌫️', color: 'bg-slate-200 text-slate-700', gradient: 'from-slate-400 to-slate-600' },
      anger: { emoji: '😡', color: 'bg-red-100 text-red-700', gradient: 'from-red-500 to-rose-600' },
      sorrow: { emoji: '💔', color: 'bg-indigo-100 text-indigo-700', gradient: 'from-indigo-400 to-violet-600' },
      excited: { emoji: '🎉', color: 'bg-orange-100 text-orange-700', gradient: 'from-orange-400 to-red-500' },
      overthinking: { emoji: '🤔', color: 'bg-purple-100 text-purple-700', gradient: 'from-purple-400 to-fuchsia-500' },
      hungry: { emoji: '🍔', color: 'bg-amber-100 text-amber-700', gradient: 'from-amber-400 to-orange-500' },
      neutral: { emoji: '😐', color: 'bg-gray-100 text-gray-700', gradient: 'from-gray-300 to-slate-400' },
    };
    return map[state.toLowerCase()] || map.neutral;
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Video Feed Section */}
      <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-4">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center group">
          
          {/* Always render video but hide/mask when inactive to preserve ref */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isAnalyzing && !isAutoMode ? 'opacity-50' : 'opacity-100'}`} 
          />

          {/* Inactive Overlay */}
          {!isStreamActive && (
             <div className="absolute inset-0 z-20 bg-slate-100 flex flex-col items-center justify-center text-slate-500">
                <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Camera is off</p>
             </div>
          )}
          
          {/* Live Indicator */}
          {isAutoMode && isStreamActive && (
             <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full z-20">
               <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
               <span className="text-white text-xs font-bold uppercase tracking-wider">Live Analysis</span>
               <span className="text-white/70 text-xs border-l border-white/20 pl-2">{countdown}s</span>
             </div>
          )}

          {/* Scanner Effect */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-indigo-500/10 z-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-scan-down"></div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isStreamActive ? (
            <button 
              onClick={startCamera}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/30"
            >
              <Camera className="w-5 h-5" />
              Start Camera
            </button>
          ) : (
            <>
              <button 
                onClick={stopCamera}
                className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-semibold transition-all border border-red-100"
              >
                <StopCircle className="w-6 h-6" />
              </button>
              
              <div className="flex-1 flex gap-2">
                <button 
                  onClick={() => captureAndAnalyze()}
                  disabled={isAnalyzing || isAutoMode}
                  className={`
                    flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                    ${isAutoMode 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    }
                  `}
                >
                  <ScanFace className="w-5 h-5" />
                  Capture
                </button>

                <button
                  onClick={() => {
                    const newMode = !isAutoMode;
                    setIsAutoMode(newMode);
                    if (newMode) setCountdown(4);
                  }}
                  className={`
                    px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all border
                    ${isAutoMode 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <Timer className={`w-5 h-5 ${isAutoMode ? 'animate-spin-slow' : ''}`} />
                  <span className="hidden sm:inline">Auto</span>
                </button>
              </div>
            </>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Results Section */}
      <div className="flex flex-col gap-4">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100 h-full relative overflow-hidden">
           {/* Background decoration */}
           {result && (
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${getEmotionDetails(result.detectedState).gradient} opacity-10 rounded-bl-full pointer-events-none transition-all duration-700`}></div>
           )}

           <div className="flex items-center justify-between mb-8 relative z-10">
             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                 <Zap className="w-6 h-6 fill-current" />
               </div>
               AI Mental State
             </h3>
             {result && (
               <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wide">
                 {result.confidence}% Confidence
               </span>
             )}
           </div>

           {!result ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 min-h-[300px]">
               <ScanFace className="w-16 h-16 mb-4 text-slate-300" />
               <p className="font-medium">Waiting for input...</p>
               <p className="text-sm mt-1">Start camera to analyze emotions</p>
             </div>
           ) : (
             <div className="space-y-6 animate-fade-in-up relative z-10">
               
               <div className={`p-8 rounded-3xl bg-gradient-to-br ${getEmotionDetails(result.detectedState).gradient} text-white text-center transform transition-all duration-500 shadow-xl shadow-indigo-100`}>
                  <div className="text-7xl mb-4 filter drop-shadow-md transform hover:scale-110 transition-transform cursor-default">{getEmotionDetails(result.detectedState).emoji}</div>
                  <h2 className="text-4xl font-black capitalize tracking-tight mb-1 drop-shadow-sm">{result.detectedState}</h2>
                  <p className="text-white/80 font-medium text-sm">Detected Emotion</p>
               </div>

               <div className="grid grid-cols-1 gap-4">
                 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visual Observation</h4>
                   <p className="text-slate-700 text-lg font-medium leading-snug">{result.observation}</p>
                 </div>

                 <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                   <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Mental Health Vibe</h4>
                   <p className="text-indigo-800 font-medium">{result.mentalHealthIndicator}</p>
                 </div>
               </div>
             </div>
           )}
           
           {error && (
             <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center font-medium flex items-center justify-center gap-2 animate-pulse">
               <span className="text-xl">⚠️</span> {error}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};