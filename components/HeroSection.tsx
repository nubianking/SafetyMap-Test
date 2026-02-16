
import React from 'react';
import { ICONS } from '../constants';

interface HeroSectionProps {
  onExploreMap?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onExploreMap }) => {
  return (
    <section className="relative pt-40 pb-24 px-6 md:px-12 overflow-hidden bg-[#050505]">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_rgba(234,88,12,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-zinc-900/80 border border-orange-500/20 rounded-full mb-10 backdrop-blur-xl shadow-[0_0_20px_rgba(234,88,12,0.1)]">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(234,88,12,1)]"></span>
            <span className="text-[10px] font-black tracking-[0.3em] text-zinc-300 uppercase">Danfo Fleet Uplink v4.5 — Lagos Grid Active</span>
          </div>
          
          <h2 className="text-6xl md:text-[9rem] font-black tracking-tighter mb-8 leading-[0.85] uppercase italic">
            MONETIZE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-500">THE STREETS.</span>
          </h2>
          
          <p className="max-w-2xl text-xl text-zinc-400 font-medium mb-14 leading-relaxed">
            Turn your daily route into a decentralized safety node. Whether you're a <span className="text-white font-black underline decoration-orange-500 underline-offset-4">Bike Dispatcher</span> or a <span className="text-white font-black underline decoration-yellow-500 underline-offset-4">Danfo Driver</span>, your live feed fuels the city's situational awareness grid.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
            <button 
              onClick={onExploreMap}
              className="group flex-1 bg-orange-600 hover:bg-orange-500 text-white font-black text-[12px] tracking-[0.2em] py-7 rounded-[2rem] uppercase transition-all shadow-[0_20px_40px_rgba(234,88,12,0.3)] border border-orange-400/20 flex items-center justify-center gap-3"
            >
              <ICONS.Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
              Engage Bike Node
            </button>
            <button 
              onClick={onExploreMap}
              className="group flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-[12px] tracking-[0.2em] py-7 rounded-[2rem] uppercase transition-all border border-white/5 flex items-center justify-center gap-3"
            >
              <ICONS.Radio className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
              Danfo Persistence
            </button>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-16">
          {[
            { label: 'Active Bike Feed', value: '14,209', icon: ICONS.Activity, color: 'text-orange-500' },
            { label: 'Danfo Grid Loops', value: '912', icon: ICONS.Radio, color: 'text-yellow-500' },
            { label: 'Verified Hazards', value: '58.4K', icon: ICONS.Shield, color: 'text-blue-500' },
            { label: 'Network Integrity', value: '99.9%', icon: ICONS.Fingerprint, color: 'text-green-500' }
          ].map((stat, i) => (
            <div key={i} className="group cursor-default">
              <div className="flex items-center gap-3 mb-3">
                 <stat.icon className={`w-4 h-4 ${stat.color}`} />
                 <div className="text-[10px] font-bold text-zinc-600 tracking-[0.3em] uppercase">{stat.label}</div>
              </div>
              <div className="text-4xl md:text-5xl font-black text-white group-hover:text-orange-500 transition-all tracking-tighter italic">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
