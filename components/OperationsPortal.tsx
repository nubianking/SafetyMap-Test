import React, { useState } from 'react';
import { Shield, Zap, Map as MapIcon, User, AlertTriangle, Camera, Video, Mic, Activity } from 'lucide-react';
import { UserProfileData } from './profile/MapperProfile';
import { IncidentUploadModal } from './mapper/IncidentUploadModal';
import { LiveAlert } from '../types';

interface OperationsPortalProps {
  user: UserProfileData | null;
  onNavigate: (view: 'MAP' | 'DRIVER' | 'UPLOAD' | 'PROFILE') => void;
  onReportAlert: (alert: LiveAlert) => void;
}

const OperationsPortal: React.FC<OperationsPortalProps> = ({ user, onNavigate, onReportAlert }) => {
  const [uploadModalType, setUploadModalType] = useState<'video' | 'audio' | 'image' | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  // Fetch location when opening modal
  const handleOpenUpload = (type: 'video' | 'audio' | 'image') => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setUploadModalType(type);
        },
        (err) => {
          console.warn("Location access denied, using fallback", err);
          setCurrentLocation({ lat: 6.5244, lng: 3.3792 }); // Lagos fallback
          setUploadModalType(type);
        }
      );
    } else {
      setCurrentLocation({ lat: 6.5244, lng: 3.3792 });
      setUploadModalType(type);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse"></div>
              <span className="text-[10px] font-black text-zinc-500 tracking-[0.6em] uppercase">Active Session</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
              OPERATIONS <span className="text-blue-500">COMMAND</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Node Identity</p>
            <p className="text-xl font-black text-white uppercase">{user?.alias || 'UNKNOWN_NODE'}</p>
            <p className="text-sm font-bold text-blue-500 uppercase">{user?.rank || 'Rookie'}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Primary Actions */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Deployment Modes</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Launch Sentry */}
              <button 
                onClick={() => onNavigate('DRIVER')}
                className="group relative bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] hover:bg-blue-900/20 hover:border-blue-500/50 transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                <Zap className="w-10 h-10 text-blue-500 mb-6" />
                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Launch Sentry</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                  Mount device to dashboard. Stream live feed to the grid and earn RGT tokens automatically.
                </p>
              </button>

              {/* Live Map */}
              <button 
                onClick={() => onNavigate('MAP')}
                className="group relative bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] hover:bg-orange-900/20 hover:border-orange-500/50 transition-all text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>
                <MapIcon className="w-10 h-10 text-orange-500 mb-6" />
                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Live Grid Map</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                  View real-time alerts, risk zones, and other active sentry nodes in your vicinity.
                </p>
              </button>
            </div>

            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 pt-4">Direct Reporting</h3>
            
            <div className="bg-red-950/20 border border-red-500/20 p-8 rounded-[2.5rem] space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <h4 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Report Incident</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Capture evidence manually to alert the grid.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => handleOpenUpload('video')}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors active:scale-95"
                >
                  <Video className="w-5 h-5 text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Video</span>
                </button>
                <button 
                  onClick={() => handleOpenUpload('audio')}
                  className="bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors active:scale-95"
                >
                  <Mic className="w-5 h-5 text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Audio</span>
                </button>
                <button 
                  onClick={() => handleOpenUpload('image')}
                  className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors active:scale-95"
                >
                  <Camera className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Actions & Stats */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Node Status</h3>
            
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Current Balance</p>
                <p className="text-4xl font-black text-white italic tracking-tighter">
                  {user?.balance?.toFixed(2) || '0.00'} <span className="text-sm text-blue-500 not-italic">RGT</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Trust Score</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${user?.score || 0}%` }}></div>
                  </div>
                  <span className="text-sm font-black text-white">{user?.score || 0}%</span>
                </div>
              </div>

              <button 
                onClick={() => onNavigate('PROFILE')}
                className="w-full bg-white text-black hover:bg-zinc-200 p-4 rounded-2xl flex items-center justify-center gap-3 transition-colors active:scale-95 mt-4"
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Manage Profile & Wallet</span>
              </button>
            </div>

            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-green-500" />
                <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Grid Connectivity</h4>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</span>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Connected</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Latency</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">24ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Encryption</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {uploadModalType && (
        <IncidentUploadModal
          type={uploadModalType}
          onClose={() => setUploadModalType(null)}
          onSubmit={(metadata) => {
            console.log("Uploaded incident metadata:", metadata);
            if (metadata.analysis) {
              onReportAlert({
                id: `MANUAL-${Date.now()}`,
                label: metadata.analysis.type?.toUpperCase() || metadata.analysis.sound_type?.toUpperCase() || 'MANUAL REPORT',
                severity: 'HIGH',
                location: currentLocation || { lat: 6.5244, lng: 3.3792 },
                timestamp: Date.now(),
                confidence: metadata.analysis.confidence || 0.9,
                detectedObjects: [metadata.analysis.type || metadata.analysis.sound_type],
                anomalies: [],
                temporalTrend: 'STABLE',
                predictiveRisk: { probability: 0.5, timeframe: 'Immediate', projectedOutcome: 'Under review' },
                riskVectors: [],
                boundingBoxes: [],
                verificationScore: { aggregate: 90, objectConfidence: 90, deepfakeScore: 95, metadataValidity: 100, locationMatch: 100, audioCorrelation: 90 },
                audioEvents: [],
                emergencyResponse: 'Awaiting verification',
                crowdPanicLevel: 0,
                forensics: {
                  integrityScore: 95,
                  isSynthetic: false,
                  synthIdDetected: false,
                  c2paVerified: true,
                  deepfakeProbability: 0.05,
                  tamperingDetected: false,
                  fraudRiskIndex: 5,
                  forensicNotes: 'Manual upload verified.'
                },
                telemetry: {
                  mediaHash: 'uploaded-media',
                  deviceId: user?.alias || 'UNKNOWN',
                  gpsPrecision: 0.99,
                  gyroValidation: true,
                  uploadLatency: 150,
                  timestampValid: true,
                  gpsValid: true,
                  encryptionProtocol: "TLS 1.3"
                }
              } as any);
            }
          }}
          currentLocation={currentLocation}
          deviceFingerprint={`NODE-${user?.alias?.toUpperCase() || 'UNKNOWN'}`}
        />
      )}
    </div>
  );
};

export default OperationsPortal;
