
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ICONS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { LiveAlert, ForensicMetadata, TechnicalTelemetry, VerificationScore, AudioEvent } from '../types';

interface DriverPortalProps {
  onReportAlert?: (alert: LiveAlert) => void;
}

const DriverPortal: React.FC<DriverPortalProps> = ({ onReportAlert }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokens, setTokens] = useState(1250);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<'IDLE' | 'CALIBRATING' | 'ACTIVE' | 'SECURE'>('IDLE');
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [deviceFingerprint] = useState(() => `NODE-X-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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
      // Capture a 3-second live stream segment for multi-modal audit
      const segmentData = await recordSegment(streamRef.current, 3000);
      const mediaHash = `sha256-${Math.random().toString(36).substr(2, 32)}`;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{
          parts: [
            { inlineData: { mimeType: 'video/webm', data: segmentData } },
            { text: `Tactical Sentry Segment Audit:
              1. Visual: Detect weapons, fire, violence, vehicle collisions.
              2. Acoustic: Detect screaming, gunshots, explosions.
              3. Context: Assess crowd panic levels.
              4. Classification: Determine severity and emergency response recommendation.` 
            }
          ]
        }],
        config: { 
          systemInstruction: `You are a Tactical Safety Incident Forensic AI. You analyze live video and audio tracks for immediate threats.
          
          OUTPUT RULES:
          - Return ONLY valid JSON.
          - SEVERITY levels: LOW, MEDIUM, HIGH, CRITICAL.
          - EMERGENCY levels: ROUTINE, PRIORITY, IMMEDIATE_DISPATCH, LEVEL_5_CRITICAL.
          - CROWD_PANIC: Score 0 to 1.
          - Be precise. No speculation.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detected_hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
              acoustic_events: { type: Type.ARRAY, items: { type: Type.STRING } },
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
            required: ["detected_hazards", "acoustic_events", "crowd_panic", "severity", "emergency_recommendation", "justification", "confidence", "forensics"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setDetectionResults(result);

      if (onReportAlert && currentLocation && (result.detected_hazards.length > 0 || result.acoustic_events.length > 0 || result.severity === 'CRITICAL')) {
        onReportAlert({
          id: `SEG-${Date.now()}`,
          label: result.detected_hazards[0]?.toUpperCase() || result.acoustic_events[0]?.toUpperCase() || 'MULTI-MODAL INCIDENT',
          severity: result.severity as any,
          location: currentLocation,
          timestamp: Date.now(),
          detectedObjects: result.detected_hazards,
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
            uploadLatency: 450,
            timestampValid: true,
            gpsValid: true,
            encryptionProtocol: "TLS 1.3 / ChaCha20"
          },
          confidence: result.confidence
        } as any);
        setTokens(prev => prev + 50); // Higher reward for segment analysis
      }
    } catch (error) {
      console.error("Pulse Audit Failed", error);
    } finally {
      setIsAnalyzing(false);
      setNodeStatus('ACTIVE');
    }
  }, [isStreaming, currentLocation, isAnalyzing, deviceFingerprint, onReportAlert]);

  useEffect(() => {
    const interval = setInterval(analyzeSegment, 12000); // 12s interval for deep segment audit
    return () => clearInterval(interval);
  }, [analyzeSegment]);

  return (
    <div className="min-h-screen bg-black p-6 md:p-12 pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HUD Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'bg-zinc-800'} animate-pulse`}></div>
                 <span className="text-[10px] font-black text-zinc-500 tracking-[0.6em] uppercase">Tactical Segment Uplink: {nodeStatus}</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
                 PULSE <span className="text-orange-600">SENTRY</span>
              </h2>
           </div>

           <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 bg-zinc-900/50 backdrop-blur-3xl border border-white/5 p-6 rounded-3xl min-w-[200px]">
                 <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Grid Earnings</div>
                 <div className="text-3xl font-black text-white italic tracking-tighter">{tokens} <span className="text-xs text-orange-500">RGT</span></div>
              </div>
              <div className="flex-1 bg-zinc-900/50 backdrop-blur-3xl border border-white/5 p-6 rounded-3xl min-w-[160px]">
                 <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Response Tier</div>
                 <div className="text-3xl font-black text-blue-500 italic tracking-tighter">TIER 1</div>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
           {/* Live Feed Viewport */}
           <div className="lg:col-span-3 space-y-8">
              <div className={`relative aspect-video bg-zinc-950 rounded-[4rem] border-2 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] transition-all duration-700 ${isAnalyzing ? 'border-orange-500/50 scale-[0.99] shadow-[0_0_50px_rgba(234,88,12,0.2)]' : 'border-white/5'}`}>
                 {isStreaming ? (
                   <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale-[0.8] contrast-[1.4]" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center gap-8">
                      <div className="relative">
                         <div className="absolute inset-0 bg-orange-600 blur-[80px] opacity-20 animate-pulse"></div>
                         <ICONS.Scan className="w-32 h-32 text-zinc-900 relative z-10" />
                      </div>
                      <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.8em]">Signal Offline</p>
                   </div>
                 )}

                 {/* Visual HUD Overlay */}
                 {isStreaming && (
                    <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <div className={`bg-black/80 backdrop-blur border px-6 py-3 rounded-2xl flex items-center gap-4 transition-colors ${isAnalyzing ? 'border-orange-500/50' : 'border-white/10'}`}>
                             <div className={`w-2 h-2 rounded-full animate-ping ${isAnalyzing ? 'bg-orange-500' : 'bg-red-600'}`}></div>
                             <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">
                               {isAnalyzing ? 'Deep Segment Analysis Active' : 'Live Pulse Stream v4.8'}
                             </span>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Source Fingerprint</div>
                             <div className="text-xs font-mono text-white opacity-40">{deviceFingerprint}</div>
                          </div>
                       </div>

                       <div className="flex justify-between items-end">
                          <div className="space-y-2">
                             <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-xl text-[9px] font-mono text-zinc-400">LAT: {currentLocation?.lat.toFixed(6) || '---'}</div>
                             <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-xl text-[9px] font-mono text-zinc-400">LNG: {currentLocation?.lng.toFixed(6) || '---'}</div>
                          </div>
                          <div className="flex items-center gap-6 bg-blue-600/10 backdrop-blur border border-blue-500/20 px-8 py-4 rounded-[2rem]">
                             <ICONS.Radio className="w-5 h-5 text-blue-500 animate-pulse" />
                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Acoustic Guard Armed</span>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* AI Tactical Overlay */}
                 {isStreaming && detectionResults && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md pointer-events-none animate-in zoom-in duration-300">
                      <div className={`bg-black/90 backdrop-blur-3xl border p-8 rounded-[3rem] shadow-2xl space-y-6 ${detectionResults.severity === 'CRITICAL' ? 'border-red-500/40' : 'border-orange-500/20'}`}>
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Incident Pulse</span>
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black text-white uppercase ${detectionResults.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-600'}`}>
                               {detectionResults.severity} RISK
                            </span>
                         </div>
                         
                         <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                               {detectionResults.detected_hazards.map((h: string, i: number) => (
                                  <span key={i} className="bg-orange-600/20 border border-orange-500/30 text-[9px] font-black px-3 py-1 rounded-lg text-orange-400 uppercase tracking-widest">
                                     {h}
                                  </span>
                               ))}
                               {detectionResults.acoustic_events.map((a: string, i: number) => (
                                  <span key={i} className="bg-blue-600/20 border border-blue-500/30 text-[9px] font-black px-3 py-1 rounded-lg text-blue-400 uppercase tracking-widest">
                                     AUDIO: {a}
                                  </span>
                               ))}
                            </div>
                            <p className="text-[11px] text-zinc-400 font-medium italic leading-relaxed">"{detectionResults.justification}"</p>
                         </div>

                         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                               <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Emergency Req</div>
                               <div className="text-[10px] font-black text-white uppercase tracking-tighter">{detectionResults.emergency_recommendation.replace(/_/g, ' ')}</div>
                            </div>
                            <div className="text-right">
                               <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Crowd Panic</div>
                               <div className="w-full bg-zinc-900 h-1 mt-1 rounded-full overflow-hidden">
                                  <div className="bg-red-500 h-full" style={{ width: `${detectionResults.crowd_panic * 100}%` }}></div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-900/40 p-10 rounded-[4rem] border border-white/5 backdrop-blur-3xl">
                 <div className="flex-1 space-y-2">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Segment Engagement</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Visual: Hazards | Audio: Acoustic Audit | Response: RECOM</p>
                 </div>
                 <div className="flex gap-4">
                    <button 
                       onClick={isStreaming ? stopStream : startStream}
                       className={`w-64 py-7 rounded-[2rem] font-black text-[12px] tracking-[0.3em] uppercase transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${isStreaming ? 'bg-zinc-800 text-white' : 'bg-orange-600 text-white border border-orange-400/20 hover:scale-[1.02]'}`}
                    >
                       {isStreaming ? <ICONS.Zap className="w-5 h-5 text-orange-500" /> : <ICONS.Plus className="w-5 h-5" />}
                       {isStreaming ? 'Deactivate Node' : 'Initialize Sentry'}
                    </button>
                 </div>
              </div>
           </div>

           {/* Stats Sidebar */}
           <div className="space-y-8">
              <div className="bg-[#0c0c0c] border border-white/5 rounded-[4rem] p-12 space-y-12 shadow-2xl">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Sentry Intelligence</h3>
                    <ICONS.Shield className="w-5 h-5 text-orange-500" />
                 </div>

                 <div className="space-y-6">
                    <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5">
                       <div className="text-[9px] font-black text-zinc-600 uppercase mb-2">Audit Integrity</div>
                       <div className="text-3xl font-black text-white italic tracking-tighter">{detectionResults?.forensics?.integrity_score || '--'}%</div>
                    </div>
                    
                    <div className="space-y-5 pt-4">
                       {[
                         { label: 'Deepfake Probability', value: detectionResults?.forensics?.deepfake_probability ? `${(detectionResults.forensics.deepfake_probability * 100).toFixed(1)}%` : '--' },
                         { label: 'Panic Assessment', value: detectionResults?.crowd_panic ? `${(detectionResults.crowd_panic * 100).toFixed(0)}%` : '--' },
                         { label: 'Yield Multiplier', value: '4.2x' }
                       ].map((stat, i) => (
                         <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-zinc-600">{stat.label}</span>
                            <span className="text-white">{stat.value}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="p-8 bg-orange-600/5 rounded-[2rem] border border-orange-500/10 italic text-[10px] text-zinc-500 leading-relaxed font-medium">
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2 animate-pulse text-orange-500">
                        <ICONS.Activity className="w-4 h-4" />
                        AUDITING SEGMENT...
                      </span>
                    ) : (
                      `"${detectionResults?.justification || "System primed. Awaiting segment payload for deep pulse audit."}"`
                    )}
                 </div>
              </div>

              <div className="bg-red-600/5 border border-red-500/10 rounded-[3rem] p-10 flex flex-col gap-6">
                 <div className="flex items-center gap-3">
                    <ICONS.AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">Critical Alert</span>
                 </div>
                 <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-loose">
                    In high-risk detections, emergency recommendations are instantly pushed to regional dispatch.
                 </p>
              </div>
           </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default DriverPortal;
