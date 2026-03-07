
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { ICONS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { LiveAlert, ForensicMetadata, TechnicalTelemetry, VerificationScore, AudioEvent } from '../types';
import { calculateRGTWeight } from '../services/RewardEngine';
import { SentryTelemetry } from '../types/rewards';
import { useSentryRewards } from '../hooks/useSentryRewards';
import { OracleDashboard } from './mapper/OracleDashboard';
import { ReportButton } from './mapper/ReportButton';
import { UserProfileData } from './profile/MapperProfile';
import { mapsService } from '../services/mapsService';
import { IncidentUploadModal } from './mapper/IncidentUploadModal';
import { User } from 'lucide-react';

interface DriverPortalProps {
  user?: UserProfileData | null;
}

const DriverPortal: React.FC<DriverPortalProps> = ({ user }) => {
  const navigate = useNavigate();
  const { handleNewAlert } = useAppContext();
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokens, setTokens] = useState(1250);
  const [trustRank, setTrustRank] = useState<'Watcher' | 'Sentinel' | 'Oracle' | 'Apex'>('Oracle');
  const [isSlashing, setIsSlashing] = useState(false);
  const [slashTimer, setSlashTimer] = useState<number | null>(null);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<'IDLE' | 'CALIBRATING' | 'ACTIVE' | 'SECURE'>('IDLE');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [deviceFingerprint] = useState(() => user ? `NODE-${user.alias.toUpperCase()}` : `NODE-X-${Math.random().toString(36).toUpperCase().substr(2, 6)}`);
  const [uploadModalType, setUploadModalType] = useState<'video' | 'audio' | 'image' | null>(null);

  const [currentTelemetry, setCurrentTelemetry] = useState<SentryTelemetry>({
    trustRank: 'Oracle',
    geminiQualityScore: 1.0,
    isHighSeverityEvent: false,
    isFirstReporter: false,
    isInGrayZone: false
  });

  const { sessionTotal, currentRate, isSyncing } = useSentryRewards(currentTelemetry);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(20).fill(0));
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocation({ lat, lng });
          
          try {
            const data = await mapsService.geocode(`${lat},${lng}`);
            if (data.results && data.results.length > 0) {
              setCurrentAddress(data.results[0].formatted_address);
            }
          } catch (error) {
            console.error("Geocoding failed:", error);
          }
        },
        null, { enableHighAccuracy: true }
      );
    }
  }, []);

  const startStream = async () => {
    setNodeStatus('CALIBRATING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setTimeout(() => { 
          setIsStreaming(true); 
          setNodeStatus('ACTIVE'); 
        }, 1500);
      }
    } catch (err) {
      setNodeStatus('IDLE');
      console.error("Camera failed", err);
    }
  };

  const stopStream = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsStreaming(false);
    setNodeStatus('IDLE');
    setDetectionResults(null);
  };

  const recordSegment = (stream: MediaStream, duration: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
      };
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), duration);
    });
  };

  const analyzeSegment = useCallback(async () => {
    if (!streamRef.current || isAnalyzing || !isStreaming) return;

    setIsAnalyzing(true);
    setNodeStatus('SECURE');
    
    try {
      const segmentData = await recordSegment(streamRef.current, 3000);
      const mediaHash = `sha256-${Math.random().toString(36).substr(2, 32)}`;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [{
          parts: [
            { inlineData: { mimeType: 'video/webm', data: segmentData } },
            { text: `Sentry Behavior & Anomaly Audit:
              1. Visual: Detect specific threats (weapons, collisions) and TRACK their status over the 3s.
              2. Anomalies: Identify erratic patterns (aggressive driving, unusual loitering, sudden crowd movement).
              3. Acoustic: Match audio spikes to visual events.
              4. Trend: Determine if the situation is ESCALATING, STABILIZING, or STATIC.
              5. Predictive: Based on the current trajectory, what is the most likely outcome in the next 15-30 seconds?
              6. Risk Vectors: Identify specific directional risks (e.g., "Northbound Traffic Surge", "Pedestrian Cluster at Intersection").` 
            }
          ]
        }],
        systemInstruction: `You are a Predictive Tactical Forensic AI. You analyze behavioral patterns in urban mobility feeds.
        
        OUTPUT PROTOCOL:
        - Detect hazards and unique ANOMALIES.
        - Track TEMPORAL TRENDS.
        - PREDICTIVE RISK: Probability of escalation and projected outcome.
        - RISK VECTORS: Directional or thematic risk components.
        - SEVERITY: LOW, MEDIUM, HIGH, CRITICAL.
        - Return ONLY structured JSON.`,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detected_hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
              anomalies: { 
                type: Type.ARRAY, 
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                  },
                  required: ["type", "description", "confidence"]
                }
              },
              acoustic_events: { type: Type.ARRAY, items: { type: Type.STRING } },
              temporal_trend: { type: Type.STRING, description: "ESCALATING, STABILIZING, STATIC, or FLUCTUATING" },
              predictive_risk: {
                type: Type.OBJECT,
                properties: {
                  probability: { type: Type.NUMBER },
                  timeframe: { type: Type.STRING },
                  projected_outcome: { type: Type.STRING }
                },
                required: ["probability", "timeframe", "projected_outcome"]
              },
              risk_vectors: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    magnitude: { type: Type.NUMBER }
                  },
                  required: ["type", "magnitude"]
                }
              },
              crowd_panic: { type: Type.NUMBER },
              severity: { type: Type.STRING },
              emergency_recommendation: { type: Type.STRING },
              justification: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              forensics: {
                type: Type.OBJECT,
                properties: {
                  integrity_score: { type: Type.NUMBER },
                  deepfake_probability: { type: Type.NUMBER }
                },
                required: ["integrity_score", "deepfake_probability"]
              }
            },
            required: ["detected_hazards", "anomalies", "acoustic_events", "temporal_trend", "predictive_risk", "risk_vectors", "crowd_panic", "severity", "emergency_recommendation", "justification", "confidence", "forensics"]
          }
        }
      });

      let result;
      try {
        // Parse Gemini API response - handle multiple possible response structures
        const responseText = response.text || 
          (response.candidates?.[0]?.content?.parts?.[0]?.text) || 
          (typeof response === 'string' ? response : '');
        
        if (!responseText) {
          throw new Error('No text content in API response');
        }
        
        result = JSON.parse(responseText);
        
        // Validate response structure
        if (!result.detected_hazards || !result.forensics) {
          throw new Error('Invalid response schema: missing required fields');
        }
      } catch (parseErr) {
        console.error('Failed to parse Gemini response:', parseErr);
        throw new Error(`Response parsing failed: ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}`);
      }
      
      setDetectionResults(result);

      // 1. Slashing Guardrail Check
      if (result?.forensics?.deepfake_probability > 0.85 || result?.justification?.toLowerCase?.()?.includes('synthetic')) {
        setIsSlashing(true);
        setTrustRank('Watcher');
        setTokens(prev => Math.max(0, prev - 500)); // Slashing penalty
        setSlashTimer(Date.now() + 86400000); // 24h freeze
        return;
      }

      // 2. Update Telemetry for Reward Engine
      const newTelemetry: SentryTelemetry = {
        trustRank,
        geminiQualityScore: result.confidence,
        isHighSeverityEvent: result.severity === 'CRITICAL' || result.severity === 'HIGH',
        isFirstReporter: Math.random() > 0.7,
        isInGrayZone: Math.random() > 0.8,
      };
      setCurrentTelemetry(newTelemetry);

      if (handleNewAlert && currentLocation && (result.detected_hazards.length > 0 || result.anomalies.length > 0 || result.severity === 'CRITICAL')) {
        handleNewAlert({
          id: `BEH-${Date.now()}`,
          label: result.anomalies[0]?.type?.toUpperCase() || result.detected_hazards[0]?.toUpperCase() || 'BEHAVIORAL ANOMALY',
          severity: result.severity as any,
          location: currentLocation,
          timestamp: Date.now(),
          detectedObjects: result.detected_hazards,
          anomalies: result.anomalies,
          temporalTrend: result.temporal_trend,
          predictiveRisk: {
            probability: result.predictive_risk.probability,
            timeframe: result.predictive_risk.timeframe,
            projectedOutcome: result.predictive_risk.projected_outcome
          },
          riskVectors: result.risk_vectors,
          boundingBoxes: [],
          verificationScore: { aggregate: result.confidence * 100, objectConfidence: 90, deepfakeScore: 95, metadataValidity: 100, locationMatch: 100, audioCorrelation: 85 },
          audioEvents: result.acoustic_events.map((e: string) => ({ label: e, confidence: 0.9, timestampOffset: 0 })),
          emergencyResponse: result.emergency_recommendation,
          crowdPanicLevel: result.crowd_panic,
          forensics: {
            integrityScore: result.forensics.integrity_score,
            isSynthetic: result.forensics.deepfake_probability > 0.4,
            synthIdDetected: false,
            c2paVerified: true,
            deepfakeProbability: result.forensics.deepfake_probability,
            tamperingDetected: false,
            fraudRiskIndex: result.forensics.deepfake_probability * 100,
            forensicNotes: result.justification
          },
          telemetry: {
            mediaHash,
            deviceId: deviceFingerprint,
            gpsPrecision: 0.99,
            gyroValidation: true,
            uploadLatency: 500,
            timestampValid: true,
            gpsValid: true,
            encryptionProtocol: "TLS 1.3 / Quantum-Secure"
          },
          confidence: result.confidence
        } as any);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Sentry Pulse Audit Failed:", error);
      console.error("Error details:", errorMessage);
      // Set node status to indicate verification failure
      setNodeStatus('ERROR');
      // Don't throw - allow the component to continue monitoring
    } finally {
      setIsAnalyzing(false);
      if (setNodeStatus !== 'ERROR') {
        setNodeStatus('ACTIVE');
      }
    }
  }, [isStreaming, currentLocation, isAnalyzing, deviceFingerprint, handleNewAlert]);

  useEffect(() => {
    const interval = setInterval(analyzeSegment, 15000); 
    return () => clearInterval(interval);
  }, [analyzeSegment]);

  // Simulated Acoustic Spectrogram
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setAudioLevel(prev => prev.map(() => Math.random() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleManualReport = () => {
    if (!isStreaming) return;
    // Trigger a 3-second retro-capture simulation
    analyzeSegment();
  };

  const handleQuickReport = (type: string) => {
    if (!currentLocation) return;
    if (handleNewAlert) {
      handleNewAlert({
        id: `QR-${Date.now()}`,
        label: type.toUpperCase(),
        severity: 'HIGH',
        location: currentLocation,
        timestamp: Date.now(),
        detectedObjects: [type],
        anomalies: [],
        temporalTrend: 'ESCALATING',
        predictiveRisk: { probability: 0.8, timeframe: 'Immediate', projectedOutcome: 'Requires intervention' },
        riskVectors: [],
        boundingBoxes: [],
        verificationScore: { aggregate: 85, objectConfidence: 90, deepfakeScore: 95, metadataValidity: 100, locationMatch: 100, audioCorrelation: 80 },
        audioEvents: [],
        emergencyResponse: `Dispatch units for ${type}`,
        crowdPanicLevel: 0.5,
        forensics: {
          integrityScore: 95,
          isSynthetic: false,
          synthIdDetected: false,
          c2paVerified: true,
          deepfakeProbability: 0.05,
          tamperingDetected: false,
          fraudRiskIndex: 5,
          forensicNotes: 'Manual quick report.'
        },
        telemetry: {
          mediaHash: 'none',
          deviceId: deviceFingerprint,
          gpsPrecision: 0.99,
          gyroValidation: true,
          uploadLatency: 100,
          timestampValid: true,
          gpsValid: true,
          encryptionProtocol: "TLS 1.3"
        },
        confidence: 0.9
      } as any);
    }
  };

  const QuickReportButton = ({ icon, label, colorClass }: { icon: string, label: string, colorClass: string }) => (
    <button 
      onClick={() => handleQuickReport(label)}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${colorClass}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:max-w-md md:mx-auto md:border-x border-white/10 relative">
      {/* Live Map / Video Feed Header */}
      <div className="relative h-64 bg-zinc-950 overflow-hidden shrink-0 border-b border-white/10">
         {isStreaming ? (
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale-[0.5] contrast-[1.2]" />
         ) : (
           <div className="w-full h-full flex flex-col items-center justify-center gap-4 opacity-50">
              <ICONS.Map className="w-12 h-12 text-zinc-600" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Map / Camera Offline</p>
           </div>
         )}
         
         {/* Overlay for Nearby Alerts */}
         <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
            <div className="bg-black/80 backdrop-blur px-3 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-xl">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
               2 Alerts Nearby
            </div>
            <div className="flex gap-2 pointer-events-auto">
              {user && (
                <button 
                  onClick={() => navigate('/operations')}
                  className="bg-black/80 backdrop-blur w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-xl"
                >
                  <User className="w-4 h-4 text-zinc-400" />
                </button>
              )}
              <div className="bg-black/80 backdrop-blur px-3 py-2 rounded-full border border-orange-500/30 text-[9px] font-black uppercase tracking-widest text-orange-500 shadow-xl pointer-events-none">
                 Risk Zone: HIGH
              </div>
            </div>
         </div>

         {/* Location Overlay */}
         <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-[9px] font-mono text-zinc-400 truncate shadow-xl">
               {currentAddress ? currentAddress : `COORD: ${currentLocation?.lat.toFixed(4)}, ${currentLocation?.lng.toFixed(4)}`}
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 custom-scrollbar">
        
        {/* Oracle Sentry Status */}
        <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-5 flex justify-between items-center shadow-lg">
           <div>
             <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
               Oracle Sentry
               {isStreaming && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
             </h3>
             <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">AI Hazard Detection</p>
           </div>
           <button 
             onClick={isStreaming ? stopStream : startStream} 
             className={`px-6 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-lg active:scale-95 ${isStreaming ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-zinc-800 text-zinc-400 border border-white/5 hover:bg-zinc-700'}`}
           >
             {isStreaming ? 'ON' : 'OFF'}
           </button>
        </div>

        {/* Quick Report Buttons */}
        <div className="space-y-3">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Quick Report</h3>
           <div className="grid grid-cols-2 gap-3">
              <QuickReportButton icon="🚗" label="Accident" colorClass="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20" />
              <QuickReportButton icon="🔫" label="Weapon" colorClass="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" />
              <QuickReportButton icon="🔥" label="Fire" colorClass="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20" />
              <QuickReportButton icon="🚨" label="Robbery" colorClass="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20" />
              <QuickReportButton icon="⚠️" label="Road Hazard" colorClass="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20" />
              <QuickReportButton icon="🚑" label="Medical" colorClass="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20" />
           </div>
        </div>

        {/* Capture Evidence */}
        <div className="space-y-3">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Capture Evidence</h3>
           <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setUploadModalType('image')}
                className="bg-zinc-900/80 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-800 transition-colors active:scale-95 shadow-lg"
              >
                <ICONS.Camera className="w-6 h-6 text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Photo</span>
              </button>
              <button 
                onClick={() => setUploadModalType('video')}
                className="bg-zinc-900/80 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-800 transition-colors active:scale-95 shadow-lg"
              >
                <ICONS.Video className="w-6 h-6 text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Video</span>
              </button>
              <button 
                onClick={() => setUploadModalType('audio')}
                className="bg-zinc-900/80 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-800 transition-colors active:scale-95 shadow-lg"
              >
                <ICONS.Mic className="w-6 h-6 text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Audio</span>
              </button>
           </div>
        </div>

        {/* AI Incident Preview */}
        {detectionResults && (
          <div className="bg-zinc-900/90 border border-[#ff5f00]/40 rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#ff5f00] flex items-center gap-2">
                  <ICONS.Cpu className="w-4 h-4" />
                  AI Incident Preview
                </h3>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-black/50 px-2 py-1 rounded-lg">
                  Conf: {(detectionResults.confidence * 100).toFixed(0)}%
                </span>
             </div>
             <div className="text-sm font-bold text-white leading-relaxed">
                {detectionResults.anomalies[0]?.description || 'Anomaly detected in feed.'}
             </div>
             <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setDetectionResults(null)} // In a real app, this would submit
                  className="flex-1 bg-[#ff5f00] text-black font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
                >
                  Confirm & Submit
                </button>
                <button 
                  onClick={() => setDetectionResults(null)} 
                  className="flex-1 bg-zinc-800 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-lg active:scale-95 transition-transform border border-white/5"
                >
                  Dismiss
                </button>
             </div>
          </div>
        )}

        {/* Rewards + Trust Rank */}
        <div className="relative mt-8">
           <OracleDashboard telemetry={currentTelemetry} />
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {uploadModalType && (
        <IncidentUploadModal
          type={uploadModalType}
          onClose={() => setUploadModalType(null)}
          onSubmit={(metadata) => {
            console.log("Uploaded incident metadata:", metadata);
            // In a real app, this would trigger an alert on the map
          }}
          currentLocation={currentLocation}
          deviceFingerprint={deviceFingerprint}
        />
      )}
    </div>
  );
};

export default DriverPortal;
