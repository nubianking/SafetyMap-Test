
import React from 'react';
import { Award, Wallet } from 'lucide-react';

interface TrustCardProps {
  rank: string;
  score: number;
  balance: number;
}

export const TrustCard: React.FC<TrustCardProps> = ({ rank, score, balance }) => {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 overflow-hidden relative shadow-2xl">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full -mr-20 -mt-20" />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Current Node Rank</p>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{rank}</h2>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
          <Award className="text-blue-400" size={36} />
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Trust Score Bar */}
        <div>
          <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
            <span className="text-slate-500">Grid Trust Score</span>
            <span className="text-white">{score}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000" 
              style={{ width: `${score}%` }} 
            />
          </div>
        </div>

        {/* Wallet Section */}
        <div className="flex items-center justify-between bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
              <Wallet className="text-slate-400" size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Yield Balance</p>
              <p className="text-2xl font-black text-white italic tracking-tighter">{balance.toLocaleString()} <span className="text-xs text-slate-500 not-italic">RGT</span></p>
            </div>
          </div>
          <button className="bg-white text-black text-[10px] font-black px-6 py-3 rounded-xl hover:bg-blue-400 transition-all active:scale-95 uppercase tracking-widest">
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
};
