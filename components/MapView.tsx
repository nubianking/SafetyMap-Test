
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_INCIDENTS, ICONS, HAZARD_TYPES } from '../constants';
import { LiveAlert } from '../types';
import { useSentryRewards } from '../hooks/useSentryRewards';
import { SentryTelemetry } from '../types/rewards';
import { mapsService } from '../services/mapsService';

interface MapViewProps {
  liveAlerts?: LiveAlert[];
}

interface Driver {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  eta: number;
  status: string;
}

const INITIAL_DRIVERS: Driver[] = [
  { id: 'NODE-A1', name: 'Alpha Unit', location: { lat: 6.5244, lng: 3.3792 }, destination: { lat: 6.5400, lng: 3.3900 }, eta: 12, status: 'MAPPING' },
  { id: 'NODE-B2', name: 'Bravo Unit', location: { lat: 6.5100, lng: 3.3600 }, destination: { lat: 6.5300, lng: 3.3800 }, eta: 8, status: 'MAPPING' },
  { id: 'NODE-C3', name: 'Charlie Unit', location: { lat: 6.5350, lng: 3.3700 }, destination: { lat: 6.5150, lng: 3.3650 }, eta: 15, status: 'MAPPING' },
  { id: 'NODE-D4', name: 'Delta Unit', location: { lat: 6.5200, lng: 3.3850 }, destination: { lat: 6.5000, lng: 3.3500 }, eta: 22, status: 'MAPPING' },
];

const MapView: React.FC<MapViewProps> = ({ liveAlerts = [] }) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [gridLog, setGridLog] = useState<string[]>(['Grid Secure', 'Forensic Audit Armed', 'Landmark OCR Syncing...']);
  const [markers, setMarkers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [activeRouteInfo, setActiveRouteInfo] = useState<{ eta: string, distance: string, fare: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const driverMarkersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);

  // Tactical HUD Rewards Integration
  const [mockTelemetry, setMockTelemetry] = useState<SentryTelemetry>({
    trustRank: 'Oracle',
    geminiQualityScore: 0.95,
    isHighSeverityEvent: false,
    isFirstReporter: false,
    isInGrayZone: false
  });

  const { sessionTotal, currentRate, isSyncing } = useSentryRewards(mockTelemetry);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Ensure Leaflet is available
    if (!(window as any).L) {
      console.warn('Leaflet not loaded yet');
      return;
    }

    const map = (window as any).L.map(mapContainerRef.current, {
      center: [6.5244, 3.3792],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    (window as any).L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    mapRef.current = map;
    
    return () => { 
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Driver movement simulation — adaptive interval based on simulated speed
  const driverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const EARTH_R_KM = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;

    /** Haversine distance in km */
    const hDist = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return EARTH_R_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    /** Adaptive interval (mirrors useLocationTracker tiers) */
    const getInterval = (speed: number) => {
      if (speed > 60) return 5000;
      if (speed > 30) return 10000;
      if (speed > 5)  return 15000;
      return 30000;
    };

    let lastTick = Date.now();

    const tick = () => {
      const now = Date.now();
      const dtH = (now - lastTick) / 3_600_000; // hours
      lastTick = now;

      let maxSpeed = 0;

      setDrivers(prev => prev.map(driver => {
        const latDiff = driver.destination.lat - driver.location.lat;
        const lngDiff = driver.destination.lng - driver.location.lng;

        // If reached destination, pick a new one
        if (Math.abs(latDiff) < 0.002 && Math.abs(lngDiff) < 0.002) {
          return {
            ...driver,
            destination: { lat: 6.51 + Math.random() * 0.04, lng: 3.35 + Math.random() * 0.04 },
            eta: Math.floor(Math.random() * 15) + 5,
          };
        }

        const newLat = driver.location.lat + latDiff * 0.15;
        const newLng = driver.location.lng + lngDiff * 0.15;

        // Simulated speed from position delta
        const distKm = hDist(driver.location.lat, driver.location.lng, newLat, newLng);
        const speed = dtH > 0 ? distKm / dtH : 0;
        if (speed > maxSpeed) maxSpeed = speed;

        return {
          ...driver,
          location: { lat: newLat, lng: newLng },
          eta: Math.max(1, Math.floor(driver.eta - 0.25)),
        };
      }));

      // Schedule next tick using the fastest driver's speed tier
      const nextInterval = getInterval(maxSpeed);
      driverTimerRef.current = setTimeout(tick, nextInterval);
    };

    // Start with a default 15s tick
    driverTimerRef.current = setTimeout(tick, 15000);

    return () => {
      if (driverTimerRef.current) clearTimeout(driverTimerRef.current);
    };
  }, []);

  // Fetch Route and ETA when activeDriver changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeDriver) {
      if (routeLayerRef.current && map) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      setActiveRouteInfo(null);
      return;
    }

    const fetchRouteData = async () => {
      try {
        const origin = `${activeDriver.location.lat},${activeDriver.location.lng}`;
        const destination = `${activeDriver.destination.lat},${activeDriver.destination.lng}`;
        
        // Fetch Distance Matrix for ETA and Distance
        const distanceData = await mapsService.getDistanceMatrix({ origins: origin, destinations: destination });
        if (distanceData.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = distanceData.rows[0].elements[0];
          const distanceValue = element.distance.value; // in meters
          const baseFare = 500; // Base fare in local currency (e.g., NGN)
          const perKmFare = 150;
          const calculatedFare = baseFare + (distanceValue / 1000) * perKmFare;
          
          setActiveRouteInfo({
            eta: element.duration.text,
            distance: element.distance.text,
            fare: `₦${calculatedFare.toFixed(2)}`
          });
        }

        // Fetch Directions for Polyline
        const directionsData = await mapsService.getDirections({ origin, destination });
        if (directionsData.routes && directionsData.routes.length > 0) {
          const encodedPolyline = directionsData.routes[0].overview_polyline.points;
          
          // Simple polyline decoder (since we don't have google.maps library loaded)
          const decodePolyline = (str: string, precision = 5) => {
            let index = 0, lat = 0, lng = 0, coordinates = [], shift = 0, result = 0, byte = null, latitude_change, longitude_change, factor = Math.pow(10, precision);
            while (index < str.length) {
              byte = null; shift = 0; result = 0;
              do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
              latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
              shift = result = 0;
              do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
              longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
              lat += latitude_change; lng += longitude_change;
              coordinates.push([lat / factor, lng / factor]);
            }
            return coordinates;
          };

          const points = decodePolyline(encodedPolyline);
          
          if (routeLayerRef.current) {
            map.removeLayer(routeLayerRef.current);
          }
          
          routeLayerRef.current = (window as any).L.polyline(points, {
            color: '#22c55e',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10',
            lineCap: 'round'
          }).addTo(map);
          
          map.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });
        }
      } catch (error) {
        console.error("Failed to fetch route data:", error);
      }
    };

    fetchRouteData();
  }, [activeDriver]);

  // Render Alert Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markers.forEach(m => map.removeLayer(m));
    const newMarkers: any[] = [];

    const allReports = [
      ...MOCK_INCIDENTS.map((m: any) => ({
        id: m.id,
        label: m.title.toUpperCase(),
        severity: m.severity.toUpperCase(),
        location: m.location,
        verificationScore: m.verificationScore || { aggregate: 92, objectConfidence: 94, deepfakeScore: 98, metadataValidity: 100, locationMatch: 95, audioCorrelation: 85 },
        forensics: m.forensics || { deepfakeProbability: 0.02, forensicNotes: m.description, tamperingDetected: false, integrityScore: 98 },
        telemetry: { mediaHash: 'sha256-mock', deviceId: 'NODE-001', encryptionProtocol: 'TLS 1.3' },
        audioEvents: [],
        detectedObjects: m.title.toLowerCase().includes('weapon') ? ['Weapon'] : []
      })),
      ...liveAlerts
    ];

    allReports.forEach(alert => {
      const isCritical = alert.severity === 'CRITICAL';
      const isHigh = alert.severity === 'HIGH';
      const color = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#3b82f6';
      
      const iconSize = isCritical ? 60 : 40;
      const pulseSize = isCritical ? 'w-16 h-16' : 'w-12 h-12';
      const innerSize = isCritical ? 'w-8 h-8' : 'w-6 h-6';
      
      const icon = (window as any).L.divIcon({
        className: 'tactical-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute inset-0 ${pulseSize} rounded-full animate-ping opacity-30" style="background-color: ${color}"></div>
            ${isCritical ? `<div class="absolute inset-0 w-20 h-20 rounded-full animate-pulse opacity-10" style="background-color: ${color}"></div>` : ''}
            <div class="relative ${innerSize} rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]" style="background-color: ${color}">
               <div class="w-2 h-2 bg-white rounded-full ${isCritical ? 'animate-ping' : 'animate-pulse'}"></div>
            </div>
            ${isCritical ? `
              <div class="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-tighter shadow-xl">
                CRITICAL
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2]
      });

      const marker = (window as any).L.marker([alert.location.lat, alert.location.lng], { icon }).addTo(map);
      marker.on('click', () => {
        setActiveAlert(alert);
        setActiveDriver(null);
        map.setView([alert.location.lat, alert.location.lng], 16);
      });
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [liveAlerts]);

  // Render Driver Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    driverMarkersRef.current.forEach(m => map.removeLayer(m));
    const newMarkers: any[] = [];

    drivers.forEach(driver => {
      const icon = (window as any).L.divIcon({
        className: 'driver-marker',
        html: `
          <div class="relative flex flex-col items-center justify-center group">
            <div class="w-10 h-10 bg-green-500/20 rounded-full absolute animate-ping"></div>
            <div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.8)] relative z-10">
               <svg class="w-4 h-4 text-white transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
               </svg>
            </div>
            <div class="absolute top-10 bg-black/90 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black text-white whitespace-nowrap shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20">
              ETA: ${driver.eta} MIN
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = (window as any).L.marker([driver.location.lat, driver.location.lng], { icon }).addTo(map);
      marker.on('click', () => {
        setActiveDriver(driver);
        setActiveAlert(null);
        map.setView([driver.location.lat, driver.location.lng], 15);
      });
      newMarkers.push(marker);
    });

    driverMarkersRef.current = newMarkers;
  }, [drivers]);

  // Handle Search
  useEffect(() => {
    if (searchQuery.length > 2) {
      const fetchPlaces = async () => {
        try {
          // Add a location bias for Lagos, Nigeria
          const data = await mapsService.getPlaces({ input: searchQuery, location: '6.5244,3.3792', radius: '50000' });
          if (data.predictions) {
            setSearchResults(data.predictions);
          }
        } catch (error) {
          console.error("Failed to fetch places:", error);
        }
      };
      const timeoutId = setTimeout(fetchPlaces, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handlePlaceSelect = async (placeId: string, description: string) => {
    setSearchQuery(description);
    setSearchResults([]);
    try {
      // Geocode the selected place to get coordinates
      const data = await mapsService.geocode({ address: description });
      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        const map = mapRef.current;
        if (map) {
          map.setView([location.lat, location.lng], 15);
          
          // Optionally, dispatch a driver to this location
          if (drivers.length > 0) {
             const closestDriver = drivers[0]; // Simplified: just pick the first driver
             setActiveDriver({
               ...closestDriver,
               destination: { lat: location.lat, lng: location.lng }
             });
          }
        }
      }
    } catch (error) {
      console.error("Failed to geocode selected place:", error);
    }
  };

  const ScoreBar = ({ label, score, color = 'bg-blue-500' }: { label: string, score: number, color?: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
        <span>{label}</span>
        <span className="text-white">{score.toFixed(0)}%</span>
      </div>
      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full relative bg-black flex flex-col md:flex-row overflow-hidden">
      {/* Tactical HUD Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-10 pointer-events-none flex justify-between">
         <div className="flex items-center gap-6 pointer-events-auto">
            <button onClick={() => navigate('/')} className="w-16 h-16 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-2xl">
              <ICONS.LayoutGrid className="w-6 h-6 text-zinc-400" />
            </button>
            <div className="bg-black/90 border border-white/5 px-10 py-5 rounded-full flex items-center gap-10 shadow-2xl backdrop-blur-3xl">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.5em]">Forensic Command Desk</span>
               </div>
               <div className="hidden lg:flex items-center gap-6 border-l border-white/10 pl-10">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Nodes: <span className="text-white">{1402 + drivers.length}</span></div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Risk: <span className="text-orange-500">LOW</span></div>
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full grayscale-[0.8] contrast-[1.4] brightness-[0.8]" />
        
        {/* Tactical Yield HUD Overlay */}
        <div className="absolute bottom-10 left-10 z-[1000] pointer-events-auto">
           <div className={`bg-black/90 backdrop-blur-3xl border ${mockTelemetry.geminiQualityScore < 0.4 ? 'border-amber-500/50' : 'border-white/10'} p-8 rounded-[2.5rem] shadow-2xl space-y-6 min-w-[280px] transition-all duration-500`}>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-[#ff5f00] animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                       {isSyncing ? 'Syncing Pulse...' : 'Node Synchronized'}
                    </span>
                 </div>
                 {mockTelemetry.isInGrayZone && (
                    <div className="bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-lg animate-pulse">
                       <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">2x Gray Zone</span>
                    </div>
                 )}
              </div>

              <div className="space-y-1">
                 <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Session Yield</div>
                 <div className="flex items-baseline gap-2">
                    <div className="text-5xl font-black text-white italic tracking-tighter">
                       {sessionTotal.toFixed(2)}
                    </div>
                    <span className="text-sm font-black text-[#ff5f00]">RGT</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                 <div className="space-y-1">
                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Current Rate</div>
                    <div className={`text-xl font-black italic tracking-tighter ${mockTelemetry.isInGrayZone ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]' : 'text-white'}`}>
                       +{currentRate.toFixed(4)}
                    </div>
                 </div>
                 <div className="text-right space-y-1">
                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Integrity</div>
                    <div className={`text-xs font-black ${mockTelemetry.geminiQualityScore < 0.4 ? 'text-amber-500 animate-pulse' : 'text-green-500'}`}>
                       {mockTelemetry.geminiQualityScore < 0.4 ? 'LOW FIDELITY' : 'OPTIMAL'}
                    </div>
                 </div>
              </div>

              {mockTelemetry.geminiQualityScore < 0.4 && (
                 <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-center">
                       Adjust Sensor – Obstructed Feed Detected
                    </p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Intelligence Dashboard Panel */}
      <div className="w-full md:w-[600px] h-full bg-[#050505] border-l border-white/5 z-[1000] flex flex-col shadow-2xl overflow-y-auto">
        <div className="p-12 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-3xl">
           <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase italic text-white">Grid Intelligence</h3>
              <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.4em]">Audit Trail v4.0.1</p>
           </div>
           <div className="w-14 h-14 bg-orange-600/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
              <ICONS.Shield className="w-7 h-7 text-orange-600" />
           </div>
        </div>

        <div className="p-12 space-y-12">
           {activeAlert ? (
             <div className="animate-in fade-in slide-in-from-right duration-700 space-y-12">
                {/* Visual Header */}
                <div className="space-y-4">
                   <div className="flex justify-between items-start">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activeAlert.severity === 'CRITICAL' ? 'bg-red-600' : activeAlert.severity === 'HIGH' ? 'bg-orange-600' : 'bg-blue-600'} text-white`}>
                        {activeAlert.severity} LEVEL THREAT
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600">{activeAlert.id}</span>
                   </div>
                   <h4 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{activeAlert.label}</h4>
                </div>

                {/* Score Engine Overview */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-10">
                      <div className="text-center">
                        <div className="text-4xl font-black text-orange-500 tracking-tighter italic leading-none">{activeAlert.verificationScore.aggregate.toFixed(0)}</div>
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Trust Score</div>
                      </div>
                   </div>

                   <div className="space-y-6 max-w-[70%]">
                      <ScoreBar label="Object Confidence" score={activeAlert.verificationScore.objectConfidence} color="bg-orange-500" />
                      <ScoreBar label="Deepfake Forensic" score={activeAlert.verificationScore.deepfakeScore} color="bg-blue-500" />
                      <ScoreBar label="Location Consistency" score={activeAlert.verificationScore.locationMatch} color="bg-green-500" />
                   </div>
                </div>

                {/* AI Detection Timeline / Objects */}
                <div className="space-y-6">
                   <h5 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em]">Visual Payload Timeline</h5>
                   <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                      {activeAlert.detectedObjects?.map((obj: string, i: number) => (
                        <div key={i} className="shrink-0 bg-zinc-900 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-3">
                           <ICONS.Scan className="w-4 h-4 text-orange-500" />
                           <span className="text-[11px] font-black text-white uppercase tracking-widest">{obj}</span>
                        </div>
                      ))}
                      {activeAlert.audioEvents?.map((evt: any, i: number) => (
                        <div key={i} className="shrink-0 bg-zinc-900 border border-blue-500/30 px-6 py-4 rounded-2xl flex items-center gap-3">
                           <ICONS.Radio className="w-4 h-4 text-blue-500" />
                           <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">{evt.label}</span>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Forensic Deep Dive */}
                <div className="bg-black border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                   <div className="flex items-center gap-3">
                      <ICONS.Fingerprint className="w-5 h-5 text-zinc-500" />
                      <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Forensic Metadata Summary</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8 text-[10px] font-mono">
                      <div className="space-y-4">
                         <div className="text-zinc-600">DEEPFAKE_PROB: <span className={activeAlert.forensics.deepfakeProbability > 0.4 ? 'text-red-500' : 'text-green-500'}>{(activeAlert.forensics.deepfakeProbability * 100).toFixed(2)}%</span></div>
                         <div className="text-zinc-600">TAMPER_DETECT: <span className="text-white">{activeAlert.forensics.tamperingDetected ? 'POSSIBLE' : 'CLEAN'}</span></div>
                         <div className="text-zinc-600">ENC_PROTO: <span className="text-blue-500">TLS 1.3 / AES-256</span></div>
                      </div>
                      <div className="space-y-4">
                         <div className="text-zinc-600">GPS_VALID: <span className="text-white">{activeAlert.telemetry.gpsValid ? 'TRUE' : 'FALSE'}</span></div>
                         <div className="text-zinc-600">TIMESTAMP_VALID: <span className="text-white">{activeAlert.telemetry.timestampValid ? 'TRUE' : 'FALSE'}</span></div>
                         <div className="text-zinc-600">NODE_ID: <span className="text-white">{activeAlert.telemetry.deviceId}</span></div>
                      </div>
                   </div>

                   <div className="p-8 bg-zinc-950/50 rounded-2xl border border-white/5 italic text-[11px] text-zinc-500 leading-relaxed font-medium">
                     "{activeAlert.forensics.forensicNotes}"
                   </div>
                </div>

                <button 
                  onClick={() => setActiveAlert(null)}
                  className="w-full py-8 bg-zinc-900 hover:bg-white hover:text-black text-white rounded-[2rem] font-black text-[12px] tracking-[0.3em] uppercase transition-all shadow-2xl active:scale-95"
                >
                  Clear Command Interface
                </button>
             </div>
           ) : activeDriver ? (
             <div className="animate-in fade-in slide-in-from-right duration-700 space-y-12">
                <div className="space-y-4">
                   <div className="flex justify-between items-start">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-600 text-white">
                        ACTIVE MAPPER NODE
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600">{activeDriver.id}</span>
                   </div>
                   <h4 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{activeDriver.name}</h4>
                </div>

                <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 space-y-8">
                   <div className="flex items-center gap-3">
                      <ICONS.Navigation className="w-5 h-5 text-green-500" />
                      <span className="text-[11px] font-black text-green-500 uppercase tracking-widest">Live Routing Telemetry</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Current Position</div>
                         <div className="text-xs font-mono text-white">{activeDriver.location.lat.toFixed(4)}, {activeDriver.location.lng.toFixed(4)}</div>
                      </div>
                      <div className="space-y-2">
                         <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Destination</div>
                         <div className="text-xs font-mono text-white">{activeDriver.destination.lat.toFixed(4)}, {activeDriver.destination.lng.toFixed(4)}</div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                      <div className="space-y-1">
                         <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Estimated Arrival</div>
                         <div className="text-3xl font-black text-white italic tracking-tighter">{activeRouteInfo ? activeRouteInfo.eta : `${activeDriver.eta} MIN`}</div>
                      </div>
                      <div className="space-y-1 text-right">
                         <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Est. Fare</div>
                         <div className="text-xl font-black text-green-500 italic tracking-tighter">{activeRouteInfo ? activeRouteInfo.fare : 'CALCULATING...'}</div>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setActiveDriver(null)}
                  className="w-full py-8 bg-zinc-900 hover:bg-white hover:text-black text-white rounded-[2rem] font-black text-[12px] tracking-[0.3em] uppercase transition-all shadow-2xl active:scale-95"
                >
                  Clear Command Interface
                </button>
             </div>
           ) : (
             <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-full max-w-md mb-12 relative">
                  <div className="relative">
                    <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="SEARCH DESTINATION..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-black tracking-widest text-white uppercase focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                      {searchResults.map((result, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handlePlaceSelect(result.place_id, result.description)}
                          className="w-full text-left px-4 py-3 text-[10px] font-bold text-zinc-400 hover:bg-white/5 hover:text-white border-b border-white/5 last:border-0 transition-colors truncate"
                        >
                          {result.description}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="opacity-30 flex flex-col items-center">
                  <ICONS.Cpu className="w-32 h-32 text-zinc-800 mb-8 animate-pulse" />
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-700">Awaiting Secure Uplink</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-800 mt-4 max-w-xs mx-auto leading-relaxed">Select a live node on the grid or search a destination to initiate situational awareness audit and forensic decryption.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
