
import React, { useState, useRef } from 'react';
import { generateSpeech, decodeAudio } from '../services/geminiService';

interface AudioPlayerProps {
  text: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handlePlay = async () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const audioData = await generateSpeech(text);
      if (!audioData) throw new Error("Audio generation failed");

      const buffer = await decodeAudio(audioData);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };

      source.start(0);
      sourceRef.current = source;
      setIsPlaying(true);
    } catch (error) {
      console.error("TTS Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading}
      className={`relative group flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-[2rem] shadow-2xl transition-all duration-500 active:scale-95 w-full sm:w-auto ${
        isPlaying 
          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
          : 'glass-panel text-slate-900 dark:text-white border border-white dark:border-slate-800 hover:border-teal-500'
      }`}
    >
      <div className={`relative flex items-center justify-center p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-500 ${isPlaying ? 'bg-teal-500 text-white' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600'}`}>
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : isPlaying ? (
          <div className="flex items-end gap-0.5 h-5 sm:h-6">
            <div className="w-0.5 sm:w-1 bg-white animate-[bounce_0.6s_infinite] h-2"></div>
            <div className="w-0.5 sm:w-1 bg-white animate-[bounce_0.8s_infinite] h-4 sm:h-5"></div>
            <div className="w-0.5 sm:w-1 bg-white animate-[bounce_0.7s_infinite] h-3"></div>
            <div className="w-0.5 sm:w-1 bg-white animate-[bounce_0.9s_infinite] h-3.5 sm:h-4"></div>
          </div>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="flex flex-col items-start pr-1 sm:pr-2">
        <span className="font-black text-xs sm:text-sm tracking-tight leading-none uppercase">
          {isPlaying ? 'Pause' : 'Play Audio'}
        </span>
        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mt-1 sm:mt-1.5 ${isPlaying ? 'text-teal-400' : 'text-slate-400'}`}>
          {isLoading ? 'Synthesizing...' : isPlaying ? 'Voice Active' : 'Listen with Voice'}
        </span>
      </div>
    </button>
  );
};
