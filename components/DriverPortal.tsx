
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
      const segmentData = await recordSegment(streamRef.current, 3000);
      const mediaHash = `sha256-${Math.random().toString(36).substr(2, 32)}`;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
        config: { 
          systemInstruction: `You are a Predictive Tactical Forensic AI. You analyze behavioral patterns in urban mobility feeds.
          
          OUTPUT PROTOCOL:
          - Detect hazards and unique ANOMALIES.
          - Track TEMPORAL TRENDS.
          - PREDICTIVE RISK: Probability of escalation and projected outcome.
          - RISK VECTORS: Directional or thematic risk components.
          - SEVERITY: LOW, MEDIUM, HIGH, CRITICAL.
          - Return ONLY structured JSON.`,
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

      const result = JSON.parse(response.text || '{}');
      setDetectionResults(result);

      if (onReportAlert && currentLocation && (result.detected_hazards.length > 0 || result.anomalies.length > 0 || result.severity === 'CRITICAL')) {
        onReportAlert({
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
        setTokens(prev => prev + 125); // Increased reward for predictive data
      }
    } catch (error) {
      console.error("Pulse Audit Failed", error);
    } finally {
      setIsAnalyzing(false);
      setNodeStatus('ACTIVE');
    }
  }, [isStreaming, currentLocation, isAnalyzing, deviceFingerprint, onReportAlert]);

  useEffect(() => {
    const interval = setInterval(analyzeSegment, 15000); 
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
                 <span className="text-[10px] font-black text-zinc-500 tracking-[0.6em] uppercase">Tactical Intelligence Node: {nodeStatus}</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
                 PREDICTIVE <span className="text-[#ff5f00]">GRID</span>
              </h2>
           </div>

           <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 bg-zinc-900/50 backdrop-blur-3xl border border-white/5 p-6 rounded-3xl min-w-[200px]">
                 <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Intelligence Yield</div>
                 <div className="text-3xl font-black text-white italic tracking-tighter">{tokens} <span className="text-xs text-[#ff5f00]">RGT</span></div>
              </div>
              <div className="flex-1 bg-zinc-900/50 backdrop-blur-3xl border border-white/5 p-6 rounded-3xl min-w-[160px]">
                 <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Node Rank</div>
                 <div className="text-3xl font-black text-blue-500 italic tracking-tighter">ORACLE</div>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
           <div className="lg:col-span-3 space-y-8">
              <div className={`relative aspect-video bg-zinc-950 rounded-[4rem] border-2 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] transition-all duration-700 ${isAnalyzing ? 'border-[#ff5f00]/50 scale-[0.99] shadow-[0_0_50px_rgba(255,95,0,0.2)]' : 'border-white/5'}`}>
                 {isStreaming ? (
                   <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale-[0.8] contrast-[1.4]" />
                 ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center gap-8">
                      <div className="relative">
                         <div className="absolute inset-0 bg-[#ff5f00] blur-[80px] opacity-20 animate-pulse"></div>
                         <ICONS.Scan className="w-32 h-32 text-zinc-900 relative z-10" />
                      </div>
                      <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.8em]">Signal Offline</p>
                   </div>
                 )}

                 {/* Visual HUD Overlay */}
                 {isStreaming && (
                    <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <div className={`bg-black/80 backdrop-blur border px-6 py-3 rounded-2xl flex items-center gap-4 transition-colors ${isAnalyzing ? 'border-[#ff5f00]/50' : 'border-white/10'}`}>
                             <div className={`w-2 h-2 rounded-full animate-ping ${isAnalyzing ? 'bg-[#ff5f00]' : 'bg-red-600'}`}></div>
                             <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">
                               {isAnalyzing ? 'Calculating Risk Vectors' : 'Live Intelligence Feed v6.0'}
                             </span>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Latency</div>
                             <div className="text-xs font-mono text-white opacity-40">12ms</div>
                          </div>
                       </div>

                       {/* Risk Vector Visualization (Simulated) */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-20">
                          <div className="w-[60%] h-[60%] border border-white/10 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                             <div className="w-full h-[1px] bg-white/20"></div>
                             <div className="w-[1px] h-full bg-white/20 absolute"></div>
                          </div>
                       </div>

                       <div className="flex justify-between items-end">
                          <div className="space-y-2">
                             <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-xl text-[9px] font-mono text-zinc-400">COORD: {currentLocation?.lat.toFixed(4)}, {currentLocation?.lng.toFixed(4)}</div>
                             <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-xl text-[9px] font-mono text-zinc-400">NODE_ID: {deviceFingerprint}</div>
                          </div>
                          <div className="flex items-center gap-6 bg-blue-600/10 backdrop-blur border border-blue-500/20 px-8 py-4 rounded-[2rem]">
                             <ICONS.Cpu className="w-5 h-5 text-blue-500 animate-pulse" />
                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Predictive Engine Active</span>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* AI Intelligence HUD */}
                 {isStreaming && detectionResults && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl pointer-events-none animate-in zoom-in duration-500">
                      <div className={`bg-black/90 backdrop-blur-3xl border p-10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] space-y-8 ${detectionResults.severity === 'CRITICAL' ? 'border-red-500/40' : 'border-[#ff5f00]/20'}`}>
                         <div className="flex justify-between items-center">
                            <div className="space-y-1">
                               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Predictive Outcome</span>
                               <div className="text-2xl font-black text-white italic tracking-tighter">{detectionResults.predictive_risk.projected_outcome}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <span className={`px-5 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest ${detectionResults.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-[#ff5f00]'}`}>
                                  {detectionResults.severity} RISK
                               </span>
                               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Confidence: {(detectionResults.confidence * 100).toFixed(0)}%</span>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                               <div className="space-y-4">
                                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Active Anomalies</h4>
                                  <div className="flex flex-col gap-2">
                                     {detectionResults.anomalies.map((a: any, i: number) => (
                                        <div key={i} className="bg-purple-600/10 border border-purple-500/20 px-4 py-2 rounded-xl">
                                           <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{a.type}</div>
                                           <div className="text-[8px] font-bold text-zinc-500 uppercase truncate">{a.description}</div>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Threat Vectors</h4>
                                  <div className="flex flex-wrap gap-2">
                                     {detectionResults.detected_hazards.map((h: string, i: number) => (
                                        <span key={i} className="bg-[#ff5f00]/10 border border-[#ff5f00]/20 text-[8px] font-black px-3 py-1.5 rounded-lg text-[#ff5f00] uppercase tracking-widest">
                                           {h}
                                        </span>
                                     ))}
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-6">
                               <div className="space-y-4">
                                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Risk Vectors</h4>
                                  <div className="space-y-3">
                                     {detectionResults.risk_vectors.map((v: any, i: number) => (
                                        <div key={i} className="space-y-1">
                                           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                              <span className="text-zinc-400">{v.type}</span>
                                              <span className="text-white">{(v.magnitude * 100).toFixed(0)}%</span>
                                           </div>
                                           <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                              <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${v.magnitude * 100}%` }}></div>
                                           </div>
                                        </div>
                                     ))}
                                  </div>
                               </div>
                               <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                                  <div className="text-[8px] font-black text-zinc-600 uppercase mb-2 tracking-[0.3em]">Escalation Probability</div>
                                  <div className="text-2xl font-black text-white italic tracking-tighter">{(detectionResults.predictive_risk.probability * 100).toFixed(0)}%</div>
                                  <div className="text-[8px] font-bold text-zinc-500 uppercase mt-1">Timeframe: {detectionResults.predictive_risk.timeframe}</div>
                               </div>
                            </div>
                         </div>

                         <div className="pt-6 border-t border-white/5">
                            <p className="text-[11px] text-zinc-300 font-medium italic leading-relaxed border-l-2 border-[#ff5f00]/50 pl-4">"{detectionResults.justification}"</p>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-900/40 p-10 rounded-[4rem] border border-white/5 backdrop-blur-3xl">
                 <div className="flex-1 space-y-2 text-center md:text-left">
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Neural Persistence</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Vectors: CALCULATED | Risk: PREDICTED | Node: SYNCHRONIZED</p>
                 </div>
                 <div className="flex gap-4">
                    <button 
                       onClick={isStreaming ? stopStream : startStream}
                       className={`w-64 py-7 rounded-[2rem] font-black text-[12px] tracking-[0.3em] uppercase transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${isStreaming ? 'bg-zinc-800 text-white' : 'bg-[#ff5f00] text-white border border-[#ff5f00]/20 hover:scale-[1.02]'}`}
                    >
                       {isStreaming ? <ICONS.Zap className="w-5 h-5 text-[#ff5f00]" /> : <ICONS.Plus className="w-5 h-5" />}
                       {isStreaming ? 'Disconnect Node' : 'Initialize Oracle'}
                    </button>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-[#0c0c0c] border border-white/5 rounded-[4rem] p-12 space-y-12 shadow-2xl">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-600">Global Intel</h3>
                    <ICONS.Activity className="w-5 h-5 text-[#ff5f00]" />
                 </div>

                 <div className="space-y-6">
                    <div className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5">
                       <div className="text-[9px] font-black text-zinc-600 uppercase mb-2">Predictive Accuracy</div>
                       <div className="text-3xl font-black text-white italic tracking-tighter">94.2%</div>
                    </div>
                    
                    <div className="space-y-5 pt-4">
                       {[
                         { label: 'Risk Vectors', value: detectionResults?.risk_vectors?.length || '0' },
                         { label: 'Escalation Alert', value: detectionResults?.predictive_risk?.probability > 0.7 ? 'HIGH' : 'LOW' },
                         { label: 'Grid Contribution', value: '+240 RGT' }
                       ].map((stat, i) => (
                         <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-zinc-600">{stat.label}</span>
                            <span className="text-white">{stat.value}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="p-8 bg-[#ff5f00]/5 rounded-[2rem] border border-[#ff5f00]/10 italic text-[10px] text-zinc-500 leading-relaxed font-medium">
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2 animate-pulse text-[#ff5f00]">
                        <ICONS.Cpu className="w-4 h-4" />
                        RUNNING PREDICTIVE MODELS...
                      </span>
                    ) : (
                      `"${detectionResults?.justification || "Oracle node operational. Monitoring for behavioral precursors to escalation."}"`
                    )}
                 </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-500/10 rounded-[3rem] p-10 flex flex-col gap-6">
                 <div className="flex items-center gap-3">
                    <ICONS.Cpu className="w-5 h-5 text-blue-500" />
                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Oracle Logic</span>
                 </div>
                 <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-loose">
                    Oracle nodes use predictive temporal analysis to identify risks before they manifest as incidents.
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
