
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Asteroid extends GameObject {
  rotation: number;
  rotationSpeed: number;
  size: 'small' | 'medium' | 'large';
  radius: number;
}

export interface Particle extends GameObject {
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface PowerUp extends GameObject {
  type: 'shield' | 'slowmo' | 'bonus';
  radius: number;
}

export interface Player extends GameObject {
  radius: number;
  shieldActive: boolean;
  shieldTimer: number;
}
