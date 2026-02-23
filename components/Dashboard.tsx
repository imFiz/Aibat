import React from 'react';
import { Rocket, Gem, Flame, Wallet, LogOut, CheckCircle, Lock, Gift, ExternalLink, X } from 'lucide-react';
import { User } from '../types';

interface DashboardProps {
  user: User;
  walletAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onLogout: () => void;
  onCheckIn: () => void;
  isCheckedIn: boolean;
  canCheckIn: boolean;
  pendingFollowsCount: number;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  onLogout,
  onCheckIn,
  isCheckedIn,
  canCheckIn,
  pendingFollowsCount,
  onOpenTerms,
  onOpenPrivacy
}) => {
  const calculateRank = (score: number) => {
    if (score >= 20000) return "Titan";
    if (score >= 10000) return "Whale";
    if (score >= 5000) return "Alpha";
    if (score >= 1000) return "Influencer";
    if (score >= 500) return "Resident";
    return "Tourist";
  };

  const calculateLevel = (score: number) => Math.floor(score / 500) + 1;

  const rank = calculateRank(user.score);
  const level = calculateLevel(user.score);

  let checkInText = "Daily Check-in";
  if (isCheckedIn) checkInText = "Bonus Claimed";
  else if (pendingFollowsCount > 0) checkInText = `Follow back ${pendingFollowsCount} users`;

  const getRankStyle = (r: string) => {
      if (r === "Whale" || r === "Titan") return "border-[#F2F0E9] text-black bg-[#F2F0E9]";
      if (r === "Influencer" || r === "Alpha") return "border-neutral-300 text-neutral-100";
      return "border-neutral-600 text-neutral-400";
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Main Stats Card */}
      <div className="glass-panel w-full rounded-3xl p-6 relative overflow-hidden shadow-xl">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2F0E9] opacity-5 rounded-full -mt-10 -mr-10 pointer-events-none"></div>

        {/* Seeker Badge */}
        {walletAddress && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-600 text-black text-[9px] font-black px-2 py-0.5 rounded-md border border-yellow-300 shadow-lg z-20 flex items-center gap-1">
            <Gem size={10} /> SEEKER
          </div>
        )}

        {/* Top Row: Level & Score */}
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className={`px-3 py-1 rounded-full border ${getRankStyle(rank)} backdrop-blur-md`}>
            <span className="text-[10px] font-bold uppercase tracking-widest">LVL {level}</span>
          </div>
          <div className="text-right">
            <div className="text-neutral-500 text-[10px] uppercase font-medium tracking-wider mb-1">X-Score</div>
            <div className="text-3xl font-black text-[#F2F0E9] leading-none">{user.score.toLocaleString()}</div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center space-x-4 mb-4 relative z-10">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full border-4 border-[#121212] object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-[#1A1A1A] border border-[#333] p-1 rounded-full">
                <Rocket size={12} className="text-[#F2F0E9]" />
            </div>
          </div>
          <div>
            <div className="text-[#F2F0E9] font-bold text-xl">{user.username}</div>
            <div className="text-neutral-400 text-sm font-mono">@{user.handle}</div>
          </div>
        </div>

        {/* Stats Grid - Cleaner Layout */}
        <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
            <div className="bg-[#1A1A1A]/50 rounded-xl p-2 border border-[#333] flex flex-col items-center">
                <span className="text-[#F2F0E9] font-bold text-sm">{user.following || 0}</span>
                <span className="text-neutral-500 text-[9px] uppercase tracking-wider">Following</span>
            </div>
            <div className="bg-[#1A1A1A]/50 rounded-xl p-2 border border-[#333] flex flex-col items-center">
                <span className="text-[#F2F0E9] font-bold text-sm">{user.followers || 0}</span>
                <span className="text-neutral-500 text-[9px] uppercase tracking-wider">Followers</span>
            </div>
        </div>

        {/* Bottom Row: Streak & Rank */}
        <div className="flex justify-between items-end relative z-10 pt-2 border-t border-[#333]/50">
          <div className="flex space-x-6 pt-3">
            <div>
              <div className="text-neutral-500 text-[10px] uppercase">Streak</div>
              <div className="text-[#F2F0E9] font-medium text-lg flex items-center">
                <Flame size={16} className="mr-1 text-orange-500 fill-orange-500" />
                {user.streak}
              </div>
            </div>
            <div>
              <div className="text-neutral-500 text-[10px] uppercase">Rank</div>
              <div className="text-[#F2F0E9] font-medium text-lg">{rank}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Check In Button */}
      <button 
        onClick={canCheckIn ? onCheckIn : undefined}
        disabled={!canCheckIn}
        className={`w-full py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all transform border ${
          canCheckIn 
            ? 'bg-[#F2F0E9] border-[#F2F0E9] text-black shadow-lg shadow-white/5 active:scale-[0.98] hover:bg-white'
            : 'bg-[#1A1A1A] border-[#333] text-neutral-500 cursor-not-allowed opacity-70'
        }`}
      >
        {isCheckedIn ? <CheckCircle size={20} /> : (pendingFollowsCount > 0 ? <Lock size={20} /> : <Gift size={20} />)}
        <span className="font-bold text-sm uppercase tracking-wide">{checkInText}</span>
      </button>

      {/* Wallet Actions */}
      {!walletAddress ? (
        <button 
          onClick={onConnectWallet}
          className="w-full py-3 rounded-2xl bg-[#1A1A1A] border border-dashed border-[#333] hover:border-[#F2F0E9] hover:text-[#F2F0E9] transition-all flex items-center justify-center space-x-2 group text-neutral-400"
        >
          <Wallet size={20} className="group-hover:text-[#F2F0E9]" />
          <span className="text-sm font-medium">Connect Solana Wallet</span>
        </button>
      ) : (
        <button 
          onClick={onDisconnectWallet}
          className="w-full py-3 rounded-2xl bg-red-900/10 border border-red-900/30 hover:border-red-500 transition-colors flex items-center justify-center space-x-2 group"
        >
          <span className="text-sm font-medium text-red-400 group-hover:text-red-300 font-mono">
             {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
          <X size={16} className="text-red-500 ml-2" />
        </button>
      )}

      {/* Logout */}
      <button 
        onClick={onLogout}
        className="w-full py-3 text-xs text-neutral-600 hover:text-red-400 transition-colors flex items-center justify-center space-x-2 mt-4"
      >
        <LogOut size={14} />
        <span>Log Out</span>
      </button>

      {/* Terms & Privacy (Inconspicuous) */}
      <div className="flex justify-center space-x-6 pt-4 pb-2 opacity-40 hover:opacity-80 transition-opacity">
        <button 
            onClick={onOpenTerms}
            className="text-[10px] text-neutral-600 hover:text-[#F2F0E9] uppercase tracking-widest transition-colors"
        >
            Terms
        </button>
        <button 
            onClick={onOpenPrivacy}
            className="text-[10px] text-neutral-600 hover:text-[#F2F0E9] uppercase tracking-widest transition-colors"
        >
            Privacy
        </button>
      </div>
    </div>
  );
};

export default Dashboard;