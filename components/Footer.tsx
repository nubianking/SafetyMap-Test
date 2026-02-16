
import React from 'react';
import { ICONS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
              <ICONS.Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-sm font-black tracking-tighter">SAFETYMAP</h1>
          </div>
          <p className="text-zinc-600 text-xs leading-relaxed uppercase font-bold tracking-widest">
            The infrastructure for a safer Africa. Powered by thousands of independent Mappers across the continent.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
          <div>
            <h4 className="text-[10px] font-black text-white tracking-widest uppercase mb-6">Network</h4>
            <ul className="space-y-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Lagos Grid</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Nairobi Hub</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Accra Sync</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white tracking-widest uppercase mb-6">Legal</h4>
            <ul className="space-y-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Mapper Ethics</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-[10px] font-black text-zinc-700 tracking-[0.4em] uppercase">© 2025 SAFETY MAP AFRICA</span>
        <div className="flex items-center gap-6">
           <ICONS.Github className="w-4 h-4 text-zinc-700 hover:text-white transition-colors cursor-pointer" />
           <ICONS.Radio className="w-4 h-4 text-zinc-700 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
