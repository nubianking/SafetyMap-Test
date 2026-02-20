
import React from 'react';
import { ICONS } from '../constants';

const FeaturesSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-48 px-6 md:px-12 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-32 items-start">
          <div className="space-y-10 sticky top-48">
            <h3 className="text-[11px] font-black text-[#ff5f00] tracking-[0.6em] uppercase">Onboarding</h3>
            <h2 className="text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-reveal">JOIN THE <br />GRID.</h2>
            <p className="text-zinc-500 text-xl leading-relaxed font-medium max-w-md">Follow our high-fidelity deployment protocol to start your first session.</p>
          </div>
          
          <div className="space-y-32">
            {[
              { 
                step: '01', 
                title: 'Deployment', 
                desc: 'Mount your device with a stable chassis lock. Precision imaging requires an unobstructed field of vision of the urban corridor.' 
              },
              { 
                step: '02', 
                title: 'Activation', 
                desc: 'Initialize your node with a single tap. Our system binds your device signature to the grid, establishing a secure telemetry uplink.' 
              },
              { 
                step: '03', 
                title: 'Settlement', 
                desc: 'Observe the accumulation of RGT yield in real-time. Verified anomalies and persistence streaks provide compounded multipliers.' 
              }
            ].map((item, i) => (
              <div key={i} className="group space-y-8 pb-16 border-b border-white/5">
                <div className="text-[12px] font-black text-[#ff5f00] tracking-[0.5em] uppercase">{item.step}</div>
                <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic">{item.title}</h3>
                <p className="text-xl text-zinc-500 leading-relaxed font-medium max-w-xl">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
