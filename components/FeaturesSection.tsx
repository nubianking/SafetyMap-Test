
import React from 'react';
import { ICONS } from '../constants';

const FeaturesSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 px-6 md:px-12 bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="md:w-1/3 sticky top-32">
            <h2 className="text-5xl font-black tracking-tighter mb-6 leading-none">HOW TO <br /> <span className="text-orange-500">MAP.</span></h2>
            <p className="text-zinc-500 mb-8">Follow these steps to start your first session as a Safety Mapper.</p>
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <ICONS.BookOpen className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Download Mapper Guide</span>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-24">
            {[
              { 
                step: '01', 
                title: 'Mount & Calibrate', 
                desc: 'Secure your smartphone using a standard handlebar mount. Ensure the camera has a clear view of the road ahead. Our app will auto-calibrate the horizon for optimal mapping precision.' 
              },
              { 
                step: '02', 
                title: 'Activate Live Map', 
                desc: 'Open the Safety Map app and tap "GO LIVE". Your phone becomes an active node, streaming low-latency video and telemetry to our central grid.' 
              },
              { 
                step: '03', 
                title: 'Map & Withdraw', 
                desc: 'Tokens accumulate in real-time as you ride. Map "Blind Spots" for massive multipliers. Cash out anytime to your bank account.' 
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-12 group">
                <div className="text-8xl font-black text-zinc-900 group-hover:text-orange-500/20 transition-colors leading-none italic select-none">{item.step}</div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">{item.title}</h3>
                  <p className="text-lg text-zinc-500 leading-relaxed max-w-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
