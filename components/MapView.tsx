
import React, { useEffect, useRef, useState } from 'react';
import { MOCK_INCIDENTS, ICONS, HAZARD_TYPES } from '../constants';
import { LiveAlert } from '../types';

interface MapViewProps {
  onBack?: () => void;
  liveAlerts?: LiveAlert[];
}

const MapView: React.FC<MapViewProps> = ({ onBack, liveAlerts = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [gridLog, setGridLog] = useState<string[]>(['Grid Secure', 'Forensic Audit Armed', 'Landmark OCR Syncing...']);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = (window as any).L.map(mapContainerRef.current, {
      center: [6.5244, 3.3792],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    (window as any).L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    mapRef.current = map;
    return () => { if (mapRef.current) mapRef.current.remove(); };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markers.forEach(m => mapRef.current.removeLayer(m));
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
      const color = alert.severity === 'CRITICAL' ? '#ef4444' : alert.severity === 'HIGH' ? '#f97316' : '#3b82f6';
      const icon = (window as any).L.divIcon({
        className: 'tactical-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute inset-0 w-12 h-12 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>
            <div class="relative w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-2xl" style="background-color: ${color}">
               <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = (window as any).L.marker([alert.location.lat, alert.location.lng], { icon }).addTo(mapRef.current);
      marker.on('click', () => {
        setActiveAlert(alert);
        mapRef.current.setView([alert.location.lat, alert.location.lng], 16);
      });
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [liveAlerts]);

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
            <button onClick={onBack} className="w-16 h-16 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-2xl">
              <ICONS.LayoutGrid className="w-6 h-6 text-zinc-400" />
            </button>
            <div className="bg-black/90 border border-white/5 px-10 py-5 rounded-full flex items-center gap-10 shadow-2xl backdrop-blur-3xl">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.5em]">Forensic Command Desk</span>
               </div>
               <div className="hidden lg:flex items-center gap-6 border-l border-white/10 pl-10">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Nodes: <span className="text-white">1,402</span></div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Risk: <span className="text-orange-500">LOW</span></div>
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full grayscale-[0.8] contrast-[1.4] brightness-[0.8]" />
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
           ) : (
             <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-30">
                <ICONS.Cpu className="w-32 h-32 text-zinc-800 mb-8 animate-pulse" />
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-700">Awaiting Secure Uplink</h4>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-800 mt-4 max-w-xs mx-auto leading-relaxed">Select a live node on the grid to initiate situational awareness audit and forensic decryption.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
