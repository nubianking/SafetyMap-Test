import React, { useState } from 'react';
import { ICONS } from '../../constants';
import { UserProfileData } from '../profile/MapperProfile';

interface MapperLoginProps {
  onLoginSuccess: (user: UserProfileData) => void;
  onBack: () => void;
}

const MapperLogin: React.FC<MapperLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [nodeId, setNodeId] = useState('');
  const [passkey, setPasskey] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      setIsAuthenticating(false);
      if (nodeId.trim().toLowerCase() === 'oba' && passkey === 'Test') {
        onLoginSuccess({
          alias: 'Oba',
          rank: 'Apex Elite',
          score: 98,
          balance: 45200.50,
          history: [
            { date: 'MAR 03, 2026', qualityScore: 99, incidents: 3, yield: 120.50, status: 'PAID' },
            { date: 'MAR 02, 2026', qualityScore: 95, incidents: 1, yield: 45.20, status: 'PAID' },
            { date: 'MAR 01, 2026', qualityScore: 98, incidents: 0, yield: 15.00, status: 'PAID' },
            { date: 'FEB 28, 2026', qualityScore: 99, incidents: 2, yield: 85.00, status: 'PAID' },
          ]
        });
      } else {
        setError('Invalid Node ID or Passkey. Access Denied.');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff5f00]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={onBack}>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center transition-all group-hover:bg-white group-hover:scale-105">
            <ICONS.Shield className="w-5 h-5 text-white group-hover:text-black transition-colors" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none text-white">
              SAFETY<span className="text-[#ff5f00]">MAP</span>
            </h1>
            <span className="text-[8px] font-extrabold text-zinc-500 tracking-[0.3em] uppercase block mt-1">Return to Grid</span>
          </div>
        </div>
      </div>

      {/* Login Container */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 border border-white/10 rounded-3xl mb-2 shadow-2xl">
              <ICONS.Cpu className="w-10 h-10 text-[#ff5f00]" />
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Node <span className="text-[#ff5f00]">Authentication</span></h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Secure Sentry Access Protocol</p>
          </div>

          <form onSubmit={handleLogin} className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center animate-in fade-in slide-in-from-top-2">
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-2">Node ID / Mapper Alias</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ICONS.User className="w-5 h-5 text-zinc-600" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:border-[#ff5f00]/50 focus:ring-1 focus:ring-[#ff5f00]/50 transition-all font-mono text-sm"
                    placeholder="NODE-8492-ALPHA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-2">Secure Passkey</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ICONS.Lock className="w-5 h-5 text-zinc-600" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-700 focus:outline-none focus:border-[#ff5f00]/50 focus:ring-1 focus:ring-[#ff5f00]/50 transition-all font-mono text-sm tracking-widest"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-white text-black font-black text-[11px] tracking-[0.2em] uppercase py-5 rounded-2xl hover:bg-[#ff5f00] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none group"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent"></div>
                  Verifying Identity...
                </>
              ) : (
                <>
                  Initialize Connection
                  <ICONS.ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                New to the grid? <button type="button" className="text-white hover:text-[#ff5f00] transition-colors ml-1">Request Node Access</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MapperLogin;
