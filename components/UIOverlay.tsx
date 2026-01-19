
import React from 'react';
import { GameState } from '../types';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  highScore: number;
  onStart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, score, highScore, onStart }) => {
  if (gameState === GameState.PLAYING) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-500">
      
      {gameState === GameState.START && (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent italic">
            SPACE DODGER
          </h1>
          <p className="text-slate-400 mb-12 tracking-[0.3em] font-light">GALACTIC SURVIVAL PROTOCOL</p>
          
          <button 
            onClick={onStart}
            className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white transition-all overflow-hidden rounded-sm"
          >
            <span className="relative z-10 retro-font text-xs">INITIALIZE MISSION</span>
            <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-white/20 transition-transform duration-300"></div>
          </button>

          <div className="mt-12 grid grid-cols-2 gap-8 max-w-sm mx-auto">
            <div className="text-left border-l-2 border-slate-700 pl-4">
              <p className="text-[10px] text-slate-500 mb-1 uppercase">Best Record</p>
              <p className="text-xl font-bold text-blue-400">{highScore}</p>
            </div>
            <div className="text-left border-l-2 border-slate-700 pl-4">
              <p className="text-[10px] text-slate-500 mb-1 uppercase">Objective</p>
              <p className="text-xs text-slate-300">Survive the asteroid belt at all costs.</p>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <h2 className="text-4xl md:text-6xl font-bold mb-2 text-red-500 italic">MISSION FAILED</h2>
          <p className="text-slate-500 mb-8 tracking-widest">SHIP INTEGRITY COMPROMISED</p>
          
          <div className="bg-slate-900/50 p-8 rounded-lg mb-10 border border-slate-800 shadow-inner">
            <div className="flex justify-between gap-20 items-end mb-6">
              <div className="text-left">
                <p className="text-[10px] text-slate-500 mb-1">FINAL SCORE</p>
                <p className="text-4xl font-bold text-white">{score}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 mb-1">ALL-TIME BEST</p>
                <p className="text-2xl font-bold text-blue-400">{highScore}</p>
              </div>
            </div>
            {score >= highScore && score > 0 && (
              <div className="bg-yellow-500/10 text-yellow-500 text-[10px] py-1 px-3 rounded-full inline-block mb-4 border border-yellow-500/20">
                NEW SECTOR RECORD ACHIEVED
              </div>
            )}
          </div>

          <button 
            onClick={onStart}
            className="group relative px-12 py-4 bg-slate-100 hover:bg-white text-black transition-all overflow-hidden rounded-sm"
          >
            <span className="relative z-10 retro-font text-xs">REDEPLOY PILOT</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
