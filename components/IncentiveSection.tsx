
import React from 'react';
import { ICONS } from '../constants';

interface IncentiveSectionProps {
  onOnboard?: () => void;
}

const IncentiveSection: React.FC<IncentiveSectionProps> = ({ onOnboard }) => {
  return (
    <section id="incentives" className="py-32 px-6 md:px-12 bg-[#050505]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
        
        <div className="lg:w-1/2 space-y-12">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-orange-500 tracking-[0.5em] uppercase">The Sentry Economy</h3>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-[0.9]">PROOF-OF-STREET <br /><span className="text-zinc-700">PROTOCOL</span></h2>
            <p className="text-zinc-500 text-xl leading-relaxed font-medium">
              We turn movement into currency. Our Proof-of-Street protocol validates high-density urban corridors using local mobility as an oracle.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="group bg-gradient-to-br from-zinc-900/80 to-zinc-950 border-l-4 border-orange-600 p-8 rounded-r-[2.5rem] hover:translate-x-2 transition-all shadow-2xl">
               <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center border border-orange-600/20">
                     <ICONS.Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <h4 className="text-2xl font-black text-white italic tracking-tight">Bike Nodes: Agile Response</h4>
               </div>
               <p className="text-sm text-zinc-500 leading-relaxed font-medium">Bike Mappers navigate the city's capillaries. Earn <span className="text-orange-500 font-bold">2x Multipliers</span> for verified "Tactical Detections" in hard-to-reach zones.</p>
            </div>
            
            <div className="group bg-gradient-to-br from-zinc-900/80 to-zinc-950 border-l-4 border-yellow-500 p-8 rounded-r-[2.5rem] hover:translate-x-2 transition-all shadow-2xl">
               <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
                     <ICONS.Radio className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h4 className="text-2xl font-black text-white italic tracking-tight">Danfo Persistence: Grid Anchor</h4>
               </div>
               <p className="text-sm text-zinc-500 leading-relaxed font-medium">Danfo drivers are the pulse of the grid. Rewards are calculated based on <span className="text-yellow-500 font-bold">Route Loyalty</span> — the longer your bus anchors a sector, the higher your yield.</p>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          <div className="bg-zinc-900 border border-white/5 rounded-[3.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
               <ICONS.Shield className="w-64 h-64" />
            </div>
            
            <div className="flex justify-between items-center mb-12">
               <h4 className="text-[10px] font-black text-zinc-500 tracking-[0.4em] uppercase">Earning Matrix v4.2</h4>
               <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[9px] font-black uppercase rounded-full border border-green-500/20">Payouts: Daily</span>
            </div>
            
            <div className="space-y-8">
              {[
                { label: 'Danfo Stability (Third Mainland)', value: '₦145,000', unit: 'STABLE', trend: 'up' },
                { label: 'Bike Tactical Bounty (Alaba Market)', value: '₦92,000', unit: 'BONUS', trend: 'up' },
                { label: 'Live Hazard Verification', value: '₦48,000', unit: 'FLAT', trend: 'neutral' },
                { label: 'Sector Loyalty Reward', value: '₦22,000', unit: 'PASSIVE', trend: 'up' }
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center group/row">
                  <div className="space-y-1">
                     <span className="text-sm text-zinc-400 font-bold group-hover/row:text-white transition-colors block">{row.label}</span>
                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${row.unit === 'STABLE' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{row.unit}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-white italic tracking-tighter">{row.value}</span>
                    <div className="flex items-center gap-1">
                       <ICONS.TrendingUp className="w-3 h-3 text-green-500" />
                       <span className="text-[8px] font-bold text-zinc-600 uppercase">Growth Active</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-12 pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] block mb-2">Est. Node Yield</span>
                   <span className="text-5xl font-black text-orange-600 tracking-tighter italic">₦307,000</span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Grid Trust Level</span>
                   <div className="flex gap-1 justify-end">
                      {[1,2,3,4,5].map(v => <div key={v} className={`w-4 h-1 rounded-full ${v <= 4 ? 'bg-orange-500' : 'bg-zinc-800'}`}></div>)}
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
              <button 
                onClick={onOnboard}
                className="group flex-1 bg-white text-black font-black text-[11px] tracking-widest py-6 rounded-[1.5rem] uppercase hover:bg-orange-600 hover:text-white transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-2xl"
              >
                <ICONS.Plus className="w-4 h-4" />
                Danfo Node
              </button>
              <button 
                onClick={onOnboard}
                className="group flex-1 bg-zinc-800 text-white font-black text-[11px] tracking-widest py-6 rounded-[1.5rem] uppercase hover:bg-orange-600 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <ICONS.Navigation className="w-4 h-4" />
                Bike Node
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default IncentiveSection;
