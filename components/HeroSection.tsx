
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleExploreMap = () => {
    navigate('/map');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <section className="relative pt-64 pb-40 px-6 md:px-12 bg-black overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_rgba(255,95,0,0.12)_0%,_transparent_60%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center space-y-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-zinc-900/50 border border-white/5 rounded-full backdrop-blur-xl animate-in fade-in slide-in-from-top duration-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f00] animate-pulse shadow-[0_0_10px_#ff5f00]"></span>
            <span className="text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase">Africa's Street Intelligence Oracle</span>
          </div>
          
          <h2 className="text-7xl md:text-[11rem] font-black tracking-tighter mb-10 leading-[0.8] uppercase text-reveal max-w-6xl mx-auto">
            STREET <br />
            <span className="text-[#ff5f00] italic">INTELLIGENCE</span>
          </h2>
          
          <p className="max-w-2xl text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed pb-8">
            Decentralized safety verification powered by the rhythm of urban movement. Turn your route into <span className="text-white font-bold">digital yield.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom duration-1000">
            <button 
              onClick={handleLogin}
              className="flex-1 bg-[#ff5f00] text-white font-black text-[12px] tracking-[0.2em] py-7 rounded-3xl uppercase btn-hover-effect"
            >
              Launch Session
            </button>
            <button 
              onClick={handleExploreMap}
              className="flex-1 bg-white text-black font-black text-[12px] tracking-[0.2em] py-7 rounded-3xl uppercase btn-hover-effect"
            >
              View Grid
            </button>
          </div>
        </div>

        {/* Marquee Stat Bar */}
        <div className="mt-48 overflow-hidden py-10 border-y border-white/5">
          <div className="flex whitespace-nowrap animate-marquee gap-24">
            {[
              { label: 'Active Nodes', value: '18,402' },
              { label: 'Verified Safety Events', value: '402K' },
              { label: 'Total Yield Distributed', value: '₦405.2M' },
              { label: 'Grid Latency', value: '14ms' },
              { label: 'Nodes Online', value: '18,402' },
              { label: 'Events Verified', value: '402K' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-6">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">{stat.label}</span>
                <span className="text-5xl font-black text-white italic tracking-tighter">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
