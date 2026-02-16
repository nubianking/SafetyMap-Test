
import React from 'react';
import { ICONS } from '../constants';

interface HeaderProps {
  onExploreMap?: () => void;
  onVisualProof?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExploreMap, onVisualProof }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-md border-b border-white/5 z-[1000] px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.4)]">
          <ICONS.Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter leading-none">
            SAFETY<span className="text-orange-500">MAP</span>
          </h1>
          <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase leading-none mt-1 block">Mapper Network</span>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-8">
        <button onClick={onVisualProof} className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-colors">Visual Proof</button>
        <a href="#incentives" className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-colors">Earnings Flow</a>
        <a href="#how-it-works" className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-colors">Onboarding</a>
      </nav>

      <div className="flex items-center gap-4">
        <button 
          onClick={onExploreMap}
          className="hidden sm:block text-[10px] font-black tracking-widest text-zinc-400 hover:text-white uppercase px-4 py-2"
        >
          Explore Grid
        </button>
        <button 
          onClick={onExploreMap}
          className="bg-orange-600 text-white text-[10px] font-black tracking-widest px-6 py-3 rounded-full uppercase hover:bg-orange-500 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
        >
          Start Mapping
        </button>
      </div>
    </header>
  );
};

export default Header;
