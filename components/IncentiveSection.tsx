
import React from 'react';
import { ICONS } from '../constants';

interface IncentiveSectionProps {
  onOnboard?: () => void;
}

const IncentiveSection: React.FC<IncentiveSectionProps> = ({ onOnboard }) => {
  return (
    <section id="incentives" className="py-48 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-24 items-start">
          
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-8">
              <h3 className="text-[11px] font-black text-[#ff5f00] tracking-[0.6em] uppercase">Yield Dynamics</h3>
              <h2 className="text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-reveal">LIQUID <br />STREETS.</h2>
              <p className="text-zinc-500 text-xl leading-relaxed font-medium">
                The Proof-of-Street protocol. We reward persistence, fidelity, and coverage. Turn your mobility into an asset class.
              </p>
            </div>
            
            <div className="grid gap-6">
              <div className="service-card bg-[#080808] p-12 rounded-[3rem]">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8">
                    <ICONS.Zap className="w-7 h-7 text-black" />
                 </div>
                 <h4 className="text-3xl font-black text-white tracking-tighter mb-4">Bike Nodes</h4>
                 <p className="text-zinc-500 font-medium leading-relaxed">High-agility mapping across urban capillaries. Rewards optimized for tactical incident verification.</p>
              </div>
              
              <div className="service-card bg-[#080808] p-12 rounded-[3rem]">
                 <div className="w-14 h-14 bg-[#ff5f00] rounded-2xl flex items-center justify-center mb-8">
                    <ICONS.Radio className="w-7 h-7 text-white" />
                 </div>
                 <h4 className="text-3xl font-black text-white tracking-tighter mb-4">Danfo Stability</h4>
                 <p className="text-zinc-500 font-medium leading-relaxed">Long-term situational consistency along major corridors. Yield based on route persistence.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 w-full h-full pt-12">
            <div className="bg-[#080808] border border-white/5 rounded-[4rem] p-12 md:p-20 shadow-[0_40px_80px_rgba(0,0,0,0.8)] sticky top-32">
              <div className="flex justify-between items-center mb-20">
                 <div className="space-y-1">
                    <h4 className="text-[11px] font-black text-zinc-500 tracking-[0.4em] uppercase">Earnings Matrix</h4>
                    <span className="text-xs font-bold text-zinc-700">Real-time Yield Oracle v4.2</span>
                 </div>
                 <div className="px-6 py-2.5 bg-[#ff5f00]/10 text-[#ff5f00] text-[10px] font-black uppercase rounded-2xl border border-[#ff5f00]/20">Daily Settlement</div>
              </div>
              
              <div className="space-y-12">
                {[
                  { label: 'Stability Reward (Third Mainland)', value: '₦145,200', trend: '+4%' },
                  { label: 'Tactical Bounty (Oshodi Interchange)', value: '₦92,400', trend: 'Bonus' },
                  { label: 'Incident Audit (High Fidelity)', value: '₦48,150', trend: 'Live' },
                  { label: 'Sector Consistency Bonus', value: '₦22,800', trend: 'Yield' }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-white/5 pb-10 group/row">
                    <div className="space-y-2">
                       <span className="text-xl text-zinc-400 font-black tracking-tight block group-hover/row:text-white transition-colors uppercase">{row.label}</span>
                       <span className="text-[9px] font-extrabold text-[#ff5f00] uppercase tracking-widest">{row.trend} Settlement</span>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-white italic tracking-tighter">{row.value}</span>
                    </div>
                  </div>
                ))}
                
                <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-12">
                  <div className="text-center md:text-left">
                     <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.5em] block mb-4">Est. Payout Per Session</span>
                     <span className="text-7xl font-black text-white tracking-tighter italic">₦307K</span>
                  </div>
                  <button 
                    onClick={onOnboard} 
                    className="bg-[#ff5f00] text-white font-black text-[12px] tracking-[0.3em] px-12 py-7 rounded-3xl uppercase btn-hover-effect"
                  >
                    Activate Node
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default IncentiveSection;
