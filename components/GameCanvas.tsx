
import React, { useRef, useEffect, useState } from 'react';
import { GameState, Asteroid, Particle, PowerUp, Player } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game persistent references (avoiding state for performance)
  const playerRef = useRef<Player>({
    x: 0, y: 0, width: 40, height: 40, speed: 6, radius: 15, shieldActive: false, shieldTimer: 0
  });
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const scoreRef = useRef(0);
  const difficultyRef = useRef(1);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const initGame = (width: number, height: number) => {
    playerRef.current = {
      x: width / 2,
      y: height - 80,
      width: 40,
      height: 40,
      speed: 7,
      radius: 18,
      shieldActive: false,
      shieldTimer: 0
    };
    asteroidsRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    scoreRef.current = 0;
    difficultyRef.current = 1;
  };

  const createParticle = (x: number, y: number, color: string) => {
    for (let i = 0; i < 12; i++) {
      particlesRef.current.push({
        x, y,
        width: 3, height: 3,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        speed: 0,
        color
      });
    }
  };

  const spawnAsteroid = (width: number) => {
    const sizeRoll = Math.random();
    let size: 'small' | 'medium' | 'large' = 'medium';
    let radius = 25;
    if (sizeRoll < 0.2) { size = 'small'; radius = 12; }
    else if (sizeRoll > 0.8) { size = 'large'; radius = 45; }

    asteroidsRef.current.push({
      x: Math.random() * width,
      y: -50,
      width: radius * 2,
      height: radius * 2,
      speed: (1.5 + Math.random() * 3) * difficultyRef.current,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      size,
      radius
    });
  };

  const spawnPowerUp = (width: number) => {
    const types: PowerUp['type'][] = ['shield', 'slowmo', 'bonus'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUpsRef.current.push({
      x: Math.random() * width,
      y: -50,
      width: 30,
      height: 30,
      speed: 2,
      type,
      radius: 15
    });
  };

  const update = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    const player = playerRef.current;

    // Movement
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) player.y -= player.speed;
    if (keysRef.current['ArrowDown'] || keysRef.current['s']) player.y += player.speed;
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) player.x -= player.speed;
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) player.x += player.speed;

    // Boundary check
    player.x = Math.max(player.radius, Math.min(width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));

    // Powerup Timers
    if (player.shieldActive) {
      player.shieldTimer--;
      if (player.shieldTimer <= 0) player.shieldActive = false;
    }

    // Difficulty and Score
    difficultyRef.current += 0.0002;
    scoreRef.current += 1;

    // Spawning
    if (Math.random() < 0.03 * difficultyRef.current) spawnAsteroid(width);
    if (Math.random() < 0.002) spawnPowerUp(width);

    // Update Asteroids
    asteroidsRef.current = asteroidsRef.current.filter(ast => {
      ast.y += ast.speed;
      ast.rotation += ast.rotationSpeed;

      // Collision Detection (Circle based)
      const dx = ast.x - player.x;
      const dy = ast.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ast.radius + player.radius) {
        if (player.shieldActive) {
          player.shieldActive = false;
          player.shieldTimer = 0;
          createParticle(ast.x, ast.y, '#38bdf8');
          return false; // Remove asteroid
        } else {
          onGameOver(Math.floor(scoreRef.current / 10));
          return false;
        }
      }
      return ast.y < height + 100;
    });

    // Update PowerUps
    powerUpsRef.current = powerUpsRef.current.filter(p => {
      p.y += p.speed;
      const dx = p.x - player.x;
      const dy = p.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < p.radius + player.radius) {
        if (p.type === 'shield') {
          player.shieldActive = true;
          player.shieldTimer = 300; // ~5 seconds
        } else if (p.type === 'slowmo') {
          asteroidsRef.current.forEach(a => a.speed *= 0.5);
        } else {
          scoreRef.current += 1000;
        }
        createParticle(p.x, p.y, '#facc15');
        return false;
      }
      return p.y < height + 100;
    });

    // Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw PowerUps
    powerUpsRef.current.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = p.type === 'shield' ? '#38bdf8' : p.type === 'slowmo' ? '#818cf8' : '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Asteroids
    asteroidsRef.current.forEach(ast => {
      ctx.save();
      ctx.translate(ast.x, ast.y);
      ctx.rotate(ast.rotation);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sides = ast.size === 'small' ? 5 : ast.size === 'medium' ? 7 : 10;
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const r = ast.radius * (0.8 + Math.random() * 0.4);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.restore();
    });

    // Draw Player
    const player = playerRef.current;
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Shield
    if (player.shieldActive) {
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.3 + Math.sin(Date.now() / 100) * 0.2})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Ship Body
    ctx.fillStyle = '#f8fafc';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -player.radius);
    ctx.lineTo(player.radius, player.radius);
    ctx.lineTo(0, player.radius / 2);
    ctx.lineTo(-player.radius, player.radius);
    ctx.closePath();
    ctx.fill();

    // Engine Fire
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-5, player.radius);
      ctx.lineTo(0, player.radius + 15);
      ctx.lineTo(5, player.radius);
      ctx.fill();
    }
    
    ctx.restore();

    // UI - Score (Simple in-game display)
    ctx.fillStyle = '#fff';
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${Math.floor(scoreRef.current / 10)}`, 20, 35);
  };

  const loop = (time: number) => {
    if (gameState === GameState.PLAYING) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        update(ctx);
        draw(ctx);
      }
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    requestRef.current = requestAnimationFrame(loop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.PLAYING && canvasRef.current) {
      initGame(canvasRef.current.width, canvasRef.current.height);
    }
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      className="w-full h-full block bg-black"
    />
  );
};

export default GameCanvas;
