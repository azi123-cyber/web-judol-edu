export type SpinResultType = 'ZONK' | 'BIG_WIN' | 'MEGA_WIN' | 'MAXWIN';
export type GameType = 'MAHJONG' | 'SLOT' | 'CRASH' | 'WHEEL' | 'MINES';

export interface SpinResult {
  type: SpinResultType;
  multiplier: number;
  winAmount: number;
  message: string;
}

export interface Banner {
  id: string;
  title: string;
  provider: string;
  image: string;
  gameType: GameType;
  minBet: number;
  maxBet: number;
  rtp: number;
  tag?: 'HOT' | 'NEW' | 'EVENT' | 'GACOR';
}

export interface UserState {
  isLoggedIn: boolean;
  username: string;
  userId: string;
  balance: number;
  role: 'user' | 'admin' | 'demo';
  spinCount: number; // Untuk tracking honeypot (menang dulu di spin pertama)
}

export interface TopUpRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: string;
  status: 'pending' | 'success';
  timestamp: number;
}
