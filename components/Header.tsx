
import React from 'react';
import { ICONS } from '../constants';

interface HeaderProps {
  onExploreMap?: () => void;
  onVisualProof?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onExploreMap, onVisualProof }) => {
  return (
    <header className="fixed top-8 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl h-20 glass-pill rounded-[2.5rem] z-[1000] px-10 flex items-center justify-between shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center transition-all group-hover:bg-[#ff5f00] group-hover:scale-105 group-hover:rotate-6">
          <ICONS.Shield className="w-6 h-6 text-black group-hover:text-white transition-colors" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-black tracking-tight leading-none text-white">
            SAFETY<span className="text-[#ff5f00]">MAP</span>
          </h1>
          <span className="text-[9px] font-extrabold text-zinc-500 tracking-[0.3em] uppercase block mt-1">NIGERIA GRID</span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-12">
        <button onClick={onVisualProof} className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-all relative group">
          Visual Proof
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#ff5f00] transition-all group-hover:w-full"></span>
        </button>
        <a href="#incentives" className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-all relative group">
          Yields
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#ff5f00] transition-all group-hover:w-full"></span>
        </a>
        <a href="#how-it-works" className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-[0.2em] transition-all relative group">
          The Protocol
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#ff5f00] transition-all group-hover:w-full"></span>
        </a>
      </nav>

      <div className="flex items-center gap-4">
        <button 
          onClick={onExploreMap}
          className="bg-white text-black text-[11px] font-black tracking-widest px-8 py-3.5 rounded-2xl uppercase btn-hover-effect"
        >
          Initialize Node
        </button>
      </div>
    </header>
  );
};

export default Header;
