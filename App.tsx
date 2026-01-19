
import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spaceDodgerHighScore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GAMEOVER);
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('spaceDodgerHighScore', finalScore.toString());
    }
  }, [highScore]);

  const startGame = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-slate-950 text-white overflow-hidden">
      {/* Stars Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      <div className="relative w-full max-w-4xl aspect-[16/9] shadow-2xl border-4 border-slate-800 rounded-lg overflow-hidden bg-black">
        <GameCanvas 
          gameState={gameState} 
          onGameOver={handleGameOver}
        />
        
        <UIOverlay 
          gameState={gameState} 
          score={score} 
          highScore={highScore} 
          onStart={startGame} 
        />
      </div>

      {/* Control Info Bar */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-8 text-slate-500 text-sm uppercase tracking-widest hidden md:flex">
        <span>[WASD] MOVE</span>
        <span>[ESC] PAUSE</span>
        <span>[R] RESTART</span>
      </div>
    </div>
  );
};

export default App;
