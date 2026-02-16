
import React, { useEffect, useRef } from 'react';
import { ICONS } from '../constants';

interface LiveGridSectionProps {
  onExpand?: () => void;
  onUpload?: () => void;
}

const LiveGridSection: React.FC<LiveGridSectionProps> = ({ onExpand, onUpload }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = (window as any).L.map(mapContainerRef.current, {
      center: [6.467, 3.585], // Lekki/Ajah area, Lagos
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    (window as any).L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    const routePoints = [
      [6.465, 3.580], [6.468, 3.585], [6.472, 3.588], [6.475, 3.592], [6.478, 3.600]
    ];
    
    (window as any).L.polyline(routePoints, {
      color: '#ff5f00',
      weight: 8,
      opacity: 0.1,
      lineCap: 'round'
    }).addTo(map);

    (window as any).L.polyline(routePoints, {
      color: '#ff5f00',
      weight: 3,
      opacity: 0.8,
      dashArray: '10, 10',
      lineCap: 'round'
    }).addTo(map);

    const createDataIcon = (type: 'video' | 'image', label: string) => (window as any).L.divIcon({
      className: 'custom-data-icon',
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-10 h-10 bg-black border-2 border-orange-500 rounded-lg flex items-center justify-center shadow-lg overflow-hidden group">
            ${type === 'video' ? '<div class="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>' : '<div class="w-4 h-3 bg-white/20 rounded-sm"></div>'}
            <div class="absolute inset-0 bg-orange-500/20 animate-pulse"></div>
          </div>
          <div class="mt-1 bg-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded text-white tracking-widest uppercase">
            ${label}
          </div>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 50]
    });

    (window as any).L.marker([6.468, 3.585], { icon: createDataIcon('video', '+15 RGT') }).addTo(map);
    (window as any).L.marker([6.475, 3.592], { icon: createDataIcon('image', '+5 RGT') }).addTo(map);

    const driverIcon = (window as any).L.divIcon({
      className: 'driver-icon',
      html: `<div class="w-4 h-4 bg-white rounded-full border-4 border-orange-500 shadow-[0_0_15px_rgba(255,95,0,1)]"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    (window as any).L.marker([6.478, 3.600], { icon: driverIcon }).addTo(map);

    return () => map.remove();
  }, []);

  return (
    <section id="map-preview" className="py-24 px-6 md:px-12 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-10 bg-orange-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black group/map">
              <div ref={mapContainerRef} className="w-full h-[500px]" />
              
              {/* Expand Button Overlay */}
              <button 
                onClick={onExpand}
                className="absolute top-6 left-6 z-[500] bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 p-3 rounded-full text-white transition-all transform hover:scale-110 opacity-0 group-hover/map:opacity-100"
              >
                <ICONS.LayoutGrid className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 right-6 w-48 bg-black/90 border border-white/10 p-4 rounded-xl backdrop-blur-md z-[500]">
                <h4 className="text-[9px] font-black text-zinc-500 tracking-[0.2em] uppercase mb-3">Mapper Telemetry</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white font-medium">Map Segment</span>
                    <span className="text-[10px] text-orange-500 font-bold">+15.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white font-medium">Grid Sync</span>
                    <span className="text-[10px] text-orange-500 font-bold">+2.4</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-400">Map Session</span>
                    <span className="text-xs text-white font-black">42.8 RGT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-[10px] font-black text-orange-500 tracking-[0.4em] uppercase mb-4">Visual Data Proof</h3>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
              MAPPING SAFETY <br /> THROUGH <span className="text-zinc-500 italic">YOUR LENS.</span>
            </h2>
            <div className="space-y-6">
              <p className="text-zinc-400 text-lg leading-relaxed">
                As a <span className="text-white font-bold">Safety Mapper</span>, you are not just a driver; you are a mobile sensor. Our network relies on your live camera feed to verify road conditions and security nodes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 cursor-pointer hover:border-orange-500/50 transition-colors" onClick={onUpload}>
                  <ICONS.Radio className="w-6 h-6 text-orange-500 mb-4" />
                  <h4 className="text-sm font-bold text-white mb-2">Video Verification</h4>
                  <p className="text-xs text-zinc-500">Provide 1080p footage of security checkpoints for maximum token multipliers.</p>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 cursor-pointer hover:border-blue-500/50 transition-colors" onClick={onExpand}>
                  <ICONS.MapPin className="w-6 h-6 text-blue-500 mb-4" />
                  <h4 className="text-sm font-bold text-white mb-2">Grid Sync</h4>
                  <p className="text-xs text-zinc-500">Your GPS data allows the network to predict and avoid high-risk traffic zones.</p>
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
