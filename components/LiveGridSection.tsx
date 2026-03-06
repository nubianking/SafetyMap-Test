
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';

declare global {
  interface Window {
    google: any;
  }
}

const LiveGridSection: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [gridData, setGridData] = useState({
    predictiveAccuracy: 94.2,
    activeVectors: 128,
    activeYield: 1240,
    latestIntel: "Northbound escalation precursor detected at Grid-049. Rerouting active sentries."
  });

  const handleExpand = () => {
    navigate('/map');
  };

  const handleUpload = () => {
    navigate('/upload');
  };

  // Simulate real-time grid intelligence updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGridData(prev => ({
        ...prev,
        predictiveAccuracy: Math.max(90, Math.min(99, prev.predictiveAccuracy + (Math.random() - 0.5) * 2)),
        activeVectors: Math.max(100, Math.min(200, prev.activeVectors + Math.floor((Math.random() - 0.5) * 10))),
        activeYield: Math.max(1000, Math.min(2000, prev.activeYield + Math.floor((Math.random() - 0.5) * 50)))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Wait for Google Maps API to load
    const checkGoogleMaps = () => {
      if (!window.google || !window.google.maps) {
        setTimeout(checkGoogleMaps, 100);
        return;
      }

      initializeMap();
    };

    const initializeMap = () => {
    const lagosCenter = { lat: 6.467, lng: 3.585 };

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: lagosCenter,
      zoom: 14,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#242f3e' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#242f3e' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }]
        }
      ],
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      gestureHandling: 'none'
    });

    mapRef.current = map;

    // Create route path
    const routePath = [
      { lat: 6.465, lng: 3.580 },
      { lat: 6.468, lng: 3.585 },
      { lat: 6.472, lng: 3.588 },
      { lat: 6.475, lng: 3.592 },
      { lat: 6.478, lng: 3.600 }
    ];

    const routePolyline = new window.google.maps.Polyline({
      path: routePath,
      geodesic: true,
      strokeColor: '#ff5f00',
      strokeOpacity: 0.6,
      strokeWeight: 4,
    });
    routePolyline.setMap(map);

    // Create custom markers
    const createDataMarker = (position: google.maps.LatLngLiteral, label: string) => {
      const marker = new window.google.maps.Marker({
        position,
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="20" cy="20" r="16" fill="#ff5f00" stroke="rgba(255,255,255,0.2)" stroke-width="2" filter="url(#glow)"/>
              <circle cx="20" cy="20" r="3" fill="white" class="animate-pulse"/>
              <rect x="8" y="38" width="24" height="12" rx="6" fill="rgba(0,0,0,0.9)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
              <text x="20" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="white" letter-spacing="0.1em">${label}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50)
        }
      });
      return marker;
    };

    const createDriverMarker = (position: google.maps.LatLngLiteral) => {
      const marker = new window.google.maps.Marker({
        position,
        map,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="12" fill="rgba(34,197,94,0.2)" class="animate-ping"/>
              <circle cx="15" cy="15" r="8" fill="#22c55e" stroke="white" stroke-width="2" style="filter: drop-shadow(0 0 8px rgba(34,197,94,0.8))"/>
              <path d="M15 8 L20 18 L15 15 L10 18 Z" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 30),
          anchor: new window.google.maps.Point(15, 15)
        }
      });
      return marker;
    };

    // Add markers
    const dataMarker = createDataMarker({ lat: 6.468, lng: 3.585 }, '+15.4 RGT');
    const driverMarker1 = createDriverMarker({ lat: 6.465, lng: 3.580 });
    const driverMarker2 = createDriverMarker({ lat: 6.475, lng: 3.592 });

    // Add traffic layer for real-time intelligence
    const trafficLayer = new window.google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    // Add heatmap for grid intelligence zones
    const heatmapData = [
      { location: new window.google.maps.LatLng(6.467, 3.585), weight: 0.8 },
      { location: new window.google.maps.LatLng(6.465, 3.580), weight: 0.6 },
      { location: new window.google.maps.LatLng(6.475, 3.592), weight: 0.7 },
      { location: new window.google.maps.LatLng(6.472, 3.588), weight: 0.5 },
      { location: new window.google.maps.LatLng(6.478, 3.600), weight: 0.9 }
    ];

    const heatmap = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: 50,
      opacity: 0.3,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    });
    };

    checkGoogleMaps();

    return () => {
      if (mapRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(mapRef.current);
      }
    };
  }, [gridData]);

  return (
    <section id="map-preview" className="py-40 px-6 md:px-12 bg-black border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black group/map h-[600px]">
              <div ref={mapContainerRef} className="w-full h-full transition-transform duration-700 ease-in-out group-hover/map:scale-105" />

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
                    <span className="text-[11px] text-[#ff5f00] font-black">{gridData.predictiveAccuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-400 font-bold">Active Vectors</span>
                    <span className="text-[11px] text-blue-500 font-black">{gridData.activeVectors}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-400 font-bold">Heatmap Zones</span>
                    <span className="text-[11px] text-purple-500 font-black">5</span>
                  </div>
                  <div className="pt-6 mt-2 border-t border-white/5 space-y-4">
                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Latest Intel</div>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-zinc-400 italic leading-relaxed">"{gridData.latestIntel}"</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[11px] text-white font-bold uppercase tracking-widest">Active Yield</span>
                    <span className="text-xl text-white font-black italic">{gridData.activeYield.toLocaleString()} RGT</span>
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
              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/10 cursor-pointer transition-all flex items-center gap-8" onClick={handleUpload}>
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

              <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/10 cursor-pointer transition-all flex items-center gap-8">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-3xl flex items-center justify-center border border-cyan-500/20 shrink-0">
                  <ICONS.Zap className="w-7 h-7 text-cyan-500" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white italic tracking-tighter mb-2">Real-Time Analytics</h4>
                  <p className="text-sm text-zinc-500 font-medium">Live traffic patterns and predictive routing optimization.</p>
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
