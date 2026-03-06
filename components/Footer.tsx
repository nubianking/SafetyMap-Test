
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleWhitepaper = () => {
    navigate('/whitepaper');
  };

  const handlePrivacy = () => {
    navigate('/privacy');
  };

  const handleLegal = () => {
    navigate('/legal');
  };

  return (
    <footer className="bg-black border-t border-white/5 pt-48 pb-24 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <h1 className="text-[12vw] font-black tracking-tighter leading-none text-[#111] uppercase mb-24 select-none">
          SAFETY MAP
        </h1>

        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-24 items-start border-b border-white/5 pb-32">
          <div className="col-span-2 space-y-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <ICONS.Shield className="w-6 h-6 text-black" />
            </div>
            <p className="text-2xl text-zinc-400 font-medium leading-relaxed max-w-sm">
              The infrastructure for the next generation of urban safety in Africa.
            </p>
          </div>

          <div className="space-y-10">
            <h4 className="text-[11px] font-black text-zinc-600 tracking-[0.5em] uppercase">Network</h4>
            <ul className="space-y-6 text-[12px] font-black text-white uppercase tracking-widest">
              <li><a href="#" className="hover:text-[#ff5f00] transition-colors">Nodes</a></li>
              <li><a href="#" className="hover:text-[#ff5f00] transition-colors">Grids</a></li>
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="text-[11px] font-black text-zinc-600 tracking-[0.5em] uppercase">Platform</h4>
            <ul className="space-y-6 text-[12px] font-black text-white uppercase tracking-widest">
              <li><button onClick={handleWhitepaper} className="hover:text-[#ff5f00] transition-colors">Whitepaper</button></li>
              <li><button onClick={handlePrivacy} className="hover:text-[#ff5f00] transition-colors">Privacy</button></li>
              <li><button onClick={handleLegal} className="hover:text-[#ff5f00] transition-colors">Legal</button></li>
            </ul>
          </div>
        </div>
        
        <div className="w-full mt-20 flex flex-col md:flex-row justify-between items-center gap-12">
          <span className="text-[10px] font-black text-zinc-800 tracking-[0.5em] uppercase">© 2025 SAFETY MAP NIGERIA • ALL RIGHTS RESERVED</span>
          <div className="flex gap-10">
            <ICONS.Github className="w-5 h-5 text-zinc-800 hover:text-white transition-colors cursor-pointer" />
            <ICONS.Radio className="w-5 h-5 text-zinc-800 hover:text-white transition-colors cursor-pointer" />
            <ICONS.Activity className="w-5 h-5 text-zinc-800 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
