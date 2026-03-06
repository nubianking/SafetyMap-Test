
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

const LiveGridSection: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => {
    navigate('/map');
  };

  const handleUpload = () => {
    navigate('/upload');
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Ensure Leaflet is available
    if (!(window as any).L) {
      console.warn('Leaflet not loaded yet');
      return;
    }

    const map = (window as any).L.map(mapContainerRef.current, {
      center: [6.467, 3.585], 
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    const tileLayer = (window as any).L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    const routePoints = [
      [6.465, 3.580], [6.468, 3.585], [6.472, 3.588], [6.475, 3.592], [6.478, 3.600]
    ];
    
    const polyline = (window as any).L.polyline(routePoints, {
      color: '#ff5f00',
      weight: 4,
      opacity: 0.6,
      lineCap: 'round'
    }).addTo(map);

    const createDataIcon = (label: string) => (window as any).L.divIcon({
      className: 'custom-data-icon',
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-8 h-8 bg-[#ff5f00] rounded-xl flex items-center justify-center shadow-2xl border-2 border-white/20">
            <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          </div>
          <div class="mt-2 bg-black/90 border border-white/10 text-[9px] font-black px-2 py-1 rounded-lg text-white tracking-widest uppercase backdrop-blur-md">
            ${label}
          </div>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 50]
    });

    const createDriverIcon = () => (window as any).L.divIcon({
      className: 'driver-marker',
      html: `
        <div class="relative flex flex-col items-center justify-center">
          <div class="w-8 h-8 bg-green-500/20 rounded-full absolute animate-ping"></div>
          <div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.8)] relative z-10">
             <svg class="w-3 h-3 text-white transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
             </svg>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const m1 = (window as any).L.marker([6.468, 3.585], { icon: createDataIcon('+15.4 RGT') }).addTo(map);
    const m2 = (window as any).L.marker([6.465, 3.580], { icon: createDriverIcon() }).addTo(map);
    const m3 = (window as any).L.marker([6.475, 3.592], { icon: createDriverIcon() }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <section id="map-preview" className="py-40 px-6 md:px-12 bg-black border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black group/map h-[600px]">
              <div ref={mapContainerRef} className="w-full h-full grayscale-[0.8] contrast-[1.2] transition-transform duration-700 ease-in-out group-hover/map:scale-105" />
              
              <button 
                onClick={handleExpand}
                className="absolute top-10 left-10 z-[500] bg-white text-black p-5 rounded-3xl transition-all transform hover:scale-110 opacity-0 group-hover/map:opacity-100 shadow-2xl"
              >
                <ICONS.LayoutGrid className="w-6 h-6" />
              </button>

              <div className="absolute bottom-10 right-10 w-72 bg-black/90 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl z-[500] shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-extrabold text-zinc-500 tracking-[0.3em] uppercase">Grid Intelligence</h4>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-400 font-bold">Predictive Accuracy</span>
                    <span className="text-[11px] text-[#ff5f00] font-black">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-400 font-bold">Active Vectors</span>
                    <span className="text-[11px] text-blue-500 font-black">128</span>
                  </div>
                  <div className="pt-6 mt-2 border-t border-white/5 space-y-4">
                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Latest Intel</div>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-400 italic leading-relaxed">"Northbound escalation precursor detected at Grid-049. Rerouting active sentries."</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[11px] text-white font-bold uppercase tracking-widest">Active Yield</span>
                    <span className="text-xl text-white font-black italic">1,240 RGT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-12">
            <div>
              <h3 className="text-[11px] font-extrabold text-[#ff5f00] tracking-[0.4em] uppercase mb-6">Predictive Intelligence Protocol</h3>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9] uppercase text-gradient">
                PREDICT THE CITY. <br /> <span className="italic">SECURE THE GRID.</span>
              </h2>
              <p className="text-zinc-500 text-xl leading-relaxed font-medium">
                Our network doesn't just see the present—it calculates the future. Use high-fidelity predictive intelligence to stay ahead of urban volatility.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/10 cursor-pointer transition-all flex items-center gap-8" onClick={onUpload}>
                <div className="w-16 h-16 bg-purple-500/10 rounded-3xl flex items-center justify-center border border-purple-500/20 shrink-0">
                  <ICONS.Cpu className="w-7 h-7 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white italic tracking-tighter mb-2">Forensic Intelligence</h4>
                  <p className="text-sm text-zinc-500 font-medium">Execute 6-task forensic audits for high-yield intelligence rewards.</p>
                </div>
              </div>
              
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/10 cursor-pointer transition-all flex items-center gap-8" onClick={handleExpand}>
                <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20 shrink-0">
                  <ICONS.MapPin className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white italic tracking-tighter mb-2">GPS Persistence</h4>
                  <p className="text-sm text-zinc-500 font-medium">Maintain route stability for consistent yield accumulation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveGridSection;
