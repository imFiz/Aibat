export interface User {
  uid: string;
  username: string;
  handle: string;
  avatar: string;
  score: number;
  streak: number;
  lastCheckIn?: string; // Date string
  followers: number;
  following: number;
}

export interface Task {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isOnline: boolean;
  price: number;
  isFollowBack?: boolean;
}

export interface HistoryItem {
  type: 'earn' | 'checkin' | 'boost';
  desc: string;
  points: number;
  date: string;
  link?: string | null;
}

export interface ActiveBoost {
  id: string;
  type: 'followers';
  targetCount: number;
  currentCount: number;
  status: 'active' | 'completed';
  timestamp: number;
}

export interface BoostOption {
  count: number;
  price: number;
  best?: boolean;
}

export type Tab = 'dashboard' | 'earn' | 'boost';

// Solana Window Provider Interface
export interface SolanaProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: any) => void) => void;
  request: (method: string, params: any) => Promise<any>;
}

declare global {
  interface Window {
    solana?: SolanaProvider;
    solflare?: SolanaProvider;
  }
}