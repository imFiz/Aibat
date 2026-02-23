import React from 'react';
import { Zap, Users, Gem } from 'lucide-react';
import { User, BoostOption, ActiveBoost } from '../types';
import { BOOST_OPTIONS } from '../constants';

interface BoostProps {
  user: User;
  activeBoosts: ActiveBoost[];
  onBuyBoost: (option: BoostOption) => void;
  onPremiumClick: () => void;
}

const Boost: React.FC<BoostProps> = ({ user, activeBoosts, onBuyBoost, onPremiumClick }) => {
  return (
    <div className="space-y-6 text-center pt-8 pb-24 animate-fade-in">
      <div className="w-24 h-24 bg-[#1A1A1A] border border-[#333] rounded-full mx-auto flex items-center justify-center mb-6 relative">
        <Zap size={40} className="text-[#F2F0E9]" fill="currentColor" />
        <div className="absolute inset-0 bg-[#F2F0E9] opacity-10 blur-xl rounded-full"></div>
      </div>
      
      <div>
        <h2 className="text-2xl font-black text-[#F2F0E9] mb-2">Boost Profile</h2>
        <p className="text-neutral-500 text-sm max-w-[250px] mx-auto">
          Get to the top of the feed instantly and gain organic followers.
        </p>
      </div>

      {/* ACTIVE BOOSTS SECTION */}
      {activeBoosts.length > 0 && (
        <div className="w-full space-y-3">
          <h3 className="text-left text-[#F2F0E9] font-bold text-sm ml-1">Active Boosts</h3>
          {activeBoosts.map((boost) => (
            <div key={boost.id} className="glass-panel p-4 rounded-2xl border border-indigo-500/30 relative overflow-hidden">
              <div className="flex justify-between items-center mb-2 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Zap size={12} fill="currentColor" />
                  </div>
                  <span className="text-sm text-[#F2F0E9] font-bold">
                    {boost.type === 'followers' ? 'Follower Boost' : 'Boost'}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${boost.status === 'completed' ? 'text-green-400' : 'text-indigo-400'}`}>
                  {boost.status === 'completed' ? 'COMPLETED' : 'ACTIVE'}
                </span>
              </div>
              
              <div className="flex justify-between text-xs text-neutral-400 mb-1 relative z-10">
                <span>Progress</span>
                <span>{boost.currentCount} / {boost.targetCount}</span>
              </div>
              
              <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden relative z-10">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${(boost.currentCount / boost.targetCount) * 100}%` }}
                ></div>
              </div>

              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel p-6 rounded-3xl text-left">
        <div className="flex justify-between items-center mb-4">
          <span className="text-neutral-500 text-sm">Balance</span>
          <span className="text-[#F2F0E9] font-bold font-mono text-xl">{user.score.toLocaleString()}</span>
        </div>
        
        <div className="space-y-3">
          {BOOST_OPTIONS.map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => onBuyBoost(opt)}
              className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all mb-3 active:scale-95 hover:bg-[#222] ${
                opt.best 
                  ? 'bg-[#1A1A1A] border-[#F2F0E9]' 
                  : 'bg-[#1A1A1A] border-[#333]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  opt.best ? 'bg-[#F2F0E9] text-black' : 'bg-[#333] text-neutral-400'
                }`}>
                  <Users size={14} />
                </div>
                <div className="text-left">
                  <div className="text-[#F2F0E9] font-bold text-sm">+{opt.count} Followers</div>
                  {opt.best && <div className="text-[10px] text-[#F2F0E9] font-bold">BEST VALUE</div>}
                </div>
              </div>
              <div className="bg-[#333] px-3 py-1.5 rounded-lg text-[#F2F0E9] font-mono text-xs font-bold">
                {opt.price} pts
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-[#333]">
          <button 
            onClick={onPremiumClick}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/20 active:scale-95"
          >
            <Gem size={20} />
            <span>Get Premium with $SKR</span>
          </button>
          <p className="text-center text-[10px] text-neutral-600 mt-2">Exclusive for Solana Seeker holders</p>
        </div>
      </div>
    </div>
  );
};

export default Boost;