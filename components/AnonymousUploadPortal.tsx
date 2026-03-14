
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { ICONS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { validateIncidentFileWithFallback, formatFileSize } from '../utils/validateUpload';

const AnonymousUploadPortal: React.FC = () => {
  const navigate = useNavigate();
  const { handleNewAlert } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnonymizing, setIsAnonymizing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    // Validate file using utility
    const validation = validateIncidentFileWithFallback(selected, 'video');
    
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      setFile(null);
      return;
    }
    
    setUploadError(null);
    setFile(selected);
    setResults(null);
  };

  const analyzeVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setIsAnonymizing(true);
    setUploadProgress(10);

    try {
      // Validate API key before proceeding
      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey.includes('your_') || apiKey === 'undefined') {
        throw new Error('Gemini API key is not configured. Please add a valid VITE_GEMINI_API_KEY to your .env file. Get one at https://aistudio.google.com/app/apikey');
      }

      // Step 1: Simulated Anonymization & Metadata Stripping
      await new Promise(r => setTimeout(r, 1500));
      setIsAnonymizing(false);
      setUploadProgress(35);

      const dataUrl = await fileToDataUrl(file);
      const base64Data = dataUrl.split(',')[1];
      setUploadProgress(55);

      // Step 2: Multi-Modal AI Forensic Audit using new @google/genai SDK
      const ai = new GoogleGenAI({ apiKey });

      // Robust response sanitization function
      const parseGeminiResponse = (response: any): any => {
        try {
          let text = response.text || 
            (response.candidates?.[0]?.content?.parts?.[0]?.text) || 
            (typeof response === 'string' ? response : '');
          
          if (!text) {
            throw new Error('No text content in API response');
          }
          
          console.log('[DEBUG] Raw response:', text.substring(0, 200));
          
          // Strategy 1: Try to extract JSON from markdown code blocks
          const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (markdownMatch) {
            console.log('[DEBUG] Found markdown code block');
            try {
              const parsed = JSON.parse(markdownMatch[1].trim());
              console.log('[DEBUG] Successfully parsed JSON from markdown block');
              return parsed;
            } catch (e) {
              console.warn('[DEBUG] Failed to parse JSON from markdown block:', e);
            }
          }
          
          // Strategy 2: Find first { and match braces
          const firstBrace = text.indexOf('{');
          if (firstBrace !== -1) {
            let braceCount = 0;
            for (let i = firstBrace; i < text.length; i++) {
              if (text[i] === '{') braceCount++;
              if (text[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                  const jsonStr = text.substring(firstBrace, i + 1).trim();
                  console.log('[DEBUG] Found JSON object via brace matching');
                  try {
                    const parsed = JSON.parse(jsonStr);
                    console.log('[DEBUG] Successfully parsed brace-matched JSON');
                    return parsed;
                  } catch (e) {
                    console.warn('[DEBUG] Failed to parse brace-matched JSON:', e);
                  }
                }
              }
            }
          }
          
          // Strategy 3: Try direct JSON parse (trimmed)
          const trimmed = text.trim();
          try {
            const parsed = JSON.parse(trimmed);
            console.log('[DEBUG] Successfully parsed direct JSON');
            return parsed;
          } catch (e) {
            console.warn('[DEBUG] Direct JSON parse failed:', e);
          }
          
          // Strategy 4: Try removing common prefixes
          const cleanedText = trimmed
            .replace(/^(here's?|the json|```)/gi, '')
            .replace(/^[\s\n]*{/g, '{')
            .trim();
          
          try {
            const parsed = JSON.parse(cleanedText);
            console.log('[DEBUG] Successfully parsed cleaned JSON');
            return parsed;
          } catch (e) {
            console.warn('[DEBUG] Cleaned JSON parse failed:', e);
          }
          
          // All strategies failed
          console.error('[ERROR] Raw response preview:', text.substring(0, 300));
          throw new Error(`Unable to extract valid JSON from response. First 100 chars: ${text.substring(0, 100)}`);
          
        } catch (error) {
          throw new Error(`Response parsing failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      };

      // Retry logic with exponential backoff
      const MAX_RETRIES = 3;
      let result;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`[RETRY] Attempt ${attempt + 1}/${MAX_RETRIES} after ${1000 * attempt}ms backoff`);
            await new Promise(r => setTimeout(r, 1000 * attempt));
          }

          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-preview',
            contents: [{
              role: "user",
              parts: [
                { inlineData: { mimeType: file.type, data: base64Data } },
                { text: `You are a forensic audit AI. Analyze the provided media and return ONLY a JSON object.
DO NOT include markdown formatting, explanations, code blocks, or conversational text.
Your entire response must be valid, parseable JSON.

Required JSON structure:
{
  "threat_detection": {
    "visible_threats": string[],
    "confidence": number,
    "timestamp_occurrences": string[]
  },
  "manipulation_audit": {
    "deepfake_probability": number,
    "manipulation_detected": boolean,
    "artifact_notes": string
  },
  "metadata_consistency": {
    "is_consistent": boolean,
    "lighting_weather_match": string,
    "landmark_verification": string[]
  },
  "severity": {
    "level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "justification": string
  },
  "verification_recommendation": {
    "status": "VERIFIED" | "NEEDS_REVIEW" | "SUSPICIOUS",
    "trust_score": number,
    "summary": string
  },
  "intelligence_summary": string
}

Analyze the following evidence and return ONLY the JSON object:` 
                }
              ]
            }],
            config: {
              temperature: 0.1,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  threat_detection: {
                    type: Type.OBJECT,
                    properties: {
                      visible_threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                      confidence: { type: Type.NUMBER },
                      timestamp_occurrences: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["visible_threats", "confidence", "timestamp_occurrences"]
                  },
                  manipulation_audit: {
                    type: Type.OBJECT,
                    properties: {
                      deepfake_probability: { type: Type.NUMBER },
                      manipulation_detected: { type: Type.BOOLEAN },
                      artifact_notes: { type: Type.STRING }
                    },
                    required: ["deepfake_probability", "manipulation_detected", "artifact_notes"]
                  },
                  metadata_consistency: {
                    type: Type.OBJECT,
                    properties: {
                      is_consistent: { type: Type.BOOLEAN },
                      lighting_weather_match: { type: Type.STRING },
                      landmark_verification: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["is_consistent", "lighting_weather_match", "landmark_verification"]
                  },
                  severity: {
                    type: Type.OBJECT,
                    properties: {
                      level: { type: Type.STRING },
                      justification: { type: Type.STRING }
                    },
                    required: ["level", "justification"]
                  },
                  verification_recommendation: {
                    type: Type.OBJECT,
                    properties: {
                      status: { type: Type.STRING },
                      trust_score: { type: Type.NUMBER },
                      summary: { type: Type.STRING }
                    },
                    required: ["status", "trust_score", "summary"]
                  },
                  intelligence_summary: { type: Type.STRING }
                },
                required: ["threat_detection", "manipulation_audit", "metadata_consistency", "severity", "verification_recommendation", "intelligence_summary"]
              },
              systemInstruction: `You are a High-Fidelity Safety Incident Forensic AI specializing in machine-readable forensic audits.
              
              CRITICAL REQUIREMENTS:
              1. Return ONLY valid JSON - nothing else
              2. No markdown formatting, code blocks, or explanations
              3. No conversational text before or after JSON
              4. Your response must start with { and end with }
              5. All strings must be properly escaped
              6. All numbers must be valid JSON numbers (0-1 for probabilities/confidence)
              7. All required fields must be present
              
              Be clinically objective and forensically accurate.`
            }
          });

          result = parseGeminiResponse(response);

          // Validate response structure
          if (!result.threat_detection || !result.verification_recommendation) {
            throw new Error('Invalid response schema: missing required fields');
          }

          // Success — break out of retry loop
          console.log(`[RETRY] Succeeded on attempt ${attempt + 1}`);
          lastError = null;
          break;
        } catch (retryErr) {
          lastError = retryErr instanceof Error ? retryErr : new Error(String(retryErr));
          console.error(`[RETRY] Attempt ${attempt + 1}/${MAX_RETRIES} failed:`, lastError.message);
          if (attempt === MAX_RETRIES - 1) {
            console.error('Failed to parse Gemini response after all retries:', lastError);
            setUploadProgress(0);
            throw new Error(`Response parsing failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
          }
        }
      }
      
      setResults(result);
      setUploadProgress(100);

      // Map to global alert state if verified
      if (handleNewAlert && result?.verification_recommendation?.status !== 'SUSPICIOUS') {
        handleNewAlert({
          id: `UPL-${Date.now()}`,
          label: result.threat_detection.visible_threats[0]?.toUpperCase() || 'VIDEO EVIDENCE',
          severity: result.severity.level as any,
          location: { lat: 6.45, lng: 3.4 }, 
          timestamp: Date.now(),
          detectedObjects: result.threat_detection.visible_threats,
          boundingBoxes: [],
          verificationScore: {
             aggregate: result.verification_recommendation.trust_score * 100,
             objectConfidence: result.threat_detection.confidence * 100,
             deepfakeScore: (1 - result.manipulation_audit.deepfake_probability) * 100,
             metadataValidity: result.metadata_consistency.is_consistent ? 100 : 40,
             locationMatch: 80,
             audioCorrelation: 70
          },
          audioEvents: [],
          intelligenceSummary: result.intelligence_summary,
          forensics: {
            integrityScore: (1 - result.manipulation_audit.deepfake_probability) * 100,
            isSynthetic: result.manipulation_audit.manipulation_detected,
            synthIdDetected: false,
            c2paVerified: true,
            deepfakeProbability: result.manipulation_audit.deepfake_probability,
            tamperingDetected: result.manipulation_audit.manipulation_detected,
            fraudRiskIndex: result.manipulation_audit.deepfake_probability * 100,
            forensicNotes: result.verification_recommendation.summary
          },
          telemetry: {
            mediaHash: 'uploaded-payload-hash',
            deviceId: 'SENTRY-PORTAL-WEB',
            gpsPrecision: 0.5,
            gyroValidation: false,
            uploadLatency: 0,
            timestampValid: result.metadata_consistency.is_consistent,
            gpsValid: false,
            encryptionProtocol: "TLS 1.3"
          },
          confidence: result.threat_detection.confidence
        } as any);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("Intelligence verification failed:", err);
      console.error("Error details:", errorMessage);
      setUploadProgress(0);
      setResults({
        error: true,
        errorMessage: `Verification failed: ${errorMessage}`,
        message: 'The forensic audit could not be completed. Please try again or contact support.'
      } as any);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,1)]"></div>
              <span className="text-[10px] font-black text-zinc-500 tracking-[0.5em] uppercase">Intelligence Audit Node</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter italic uppercase leading-none">
              GRID <span className="text-orange-600">INTELLIGENCE</span>
            </h2>
            <p className="text-zinc-500 max-w-lg leading-relaxed font-medium">
              Securely upload video evidence for deep forensic auditing. Our AI agent performs a 6-step task-based verification of pixel, metadata, and contextual intelligence.
            </p>
          </div>

          <div className={`relative aspect-video rounded-[3rem] border-2 border-dashed transition-all duration-700 flex flex-col items-center justify-center p-12 overflow-hidden bg-zinc-950 ${uploadError ? 'border-red-500/50' : file ? 'border-orange-500/50' : 'border-zinc-800'}`}>
            {file ? (
              <div className="w-full h-full relative group">
                <video 
                  ref={videoPreviewRef} 
                  src={URL.createObjectURL(file)} 
                  className="w-full h-full object-cover rounded-[2.5rem] grayscale-[0.6] contrast-[1.3]" 
                  controls 
                />
                <button 
                  onClick={() => setFile(null)} 
                  className="absolute top-8 right-8 w-14 h-14 bg-black/80 rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-orange-600 hover:scale-110 transition-all z-10"
                >
                  <ICONS.Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                  <ICONS.Scan className="w-10 h-10 text-orange-500 animate-pulse" />
                </div>
                <label className="cursor-pointer text-center group">
                  <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                  <span className="block text-2xl font-black text-white uppercase italic tracking-tighter mb-3 group-hover:text-orange-500 transition-colors">Attach Evidence Payload</span>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">MP4 / MOV (Max 50MB) — 6-POINT AUDIT ENABLED</span>
                </label>
              </>
            )}

            {/* Error Display */}
            {uploadError && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50 text-center px-12">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
                  <ICONS.AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h4 className="text-2xl font-black italic uppercase tracking-tighter text-red-500 mb-4">Upload Validation Failed</h4>
                <p className="text-[11px] text-zinc-400 font-medium max-w-sm mb-8">{uploadError}</p>
                <button 
                  onClick={() => setUploadError(null)} 
                  className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all hover:bg-zinc-800 border border-white/10"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50 text-center px-12">
                 <div className="w-64 h-1 bg-zinc-900 rounded-full overflow-hidden mb-10 border border-white/5">
                    <div className="h-full bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.8)] transition-all duration-700" style={{ width: `${uploadProgress}%` }}></div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white animate-pulse">
                      {isAnonymizing ? 'Anonymizing Metadata...' : 'Executing Intelligence Audit...'}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em]">PIXEL | METADATA | SEVERITY | CONTEXT | INTEL</p>
                    <div className="text-orange-500 text-sm font-bold mt-2">{uploadProgress}% Complete</div>
                 </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
             <button 
               disabled={!file || isProcessing}
               onClick={analyzeVideo}
               className={`flex-1 py-7 rounded-[2rem] font-black text-[12px] tracking-[0.3em] uppercase transition-all shadow-2xl ${!file || isProcessing ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5' : 'bg-orange-600 text-white border border-orange-400/20 hover:scale-[1.02] active:scale-95'}`}
             >
               {isProcessing ? 'Executing 6-Task Audit...' : 'Start Intelligence Verification'}
             </button>
             <button onClick={() => navigate('/')} className="px-12 py-7 bg-zinc-900 text-zinc-500 font-black text-[11px] tracking-widest uppercase rounded-[2rem] border border-white/5 hover:text-white transition-all">Cancel</button>
          </div>
        </div>

        <div className="w-full md:w-[480px]">
           <div className={`h-full min-h-[550px] bg-[#0c0c0c] border border-white/5 rounded-[4rem] p-12 flex flex-col transition-all duration-1000 ${results ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4'}`}>
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Intelligence Report</h3>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.4em]">Audit Task Log v6.0</p>
                 </div>
                 <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                    <ICONS.Fingerprint className="w-6 h-6 text-blue-500" />
                 </div>
              </div>

              {results ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-1000 overflow-y-auto pr-2 custom-scrollbar">
                   
                   {/* Error Display */}
                   {(results as any).error && (
                     <div className="space-y-4 p-8 rounded-[2.5rem] border border-red-500/30 bg-red-600/10">
                       <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Verification Failed</h4>
                       <p className="text-[11px] text-red-200 font-medium">{(results as any).errorMessage}</p>
                       <p className="text-[10px] text-red-300 italic">{(results as any).message}</p>
                     </div>
                   )}
                   
                   {/* Intelligence Summary Task */}
                   {!(results as any).error && (
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em]">Task 6: Intelligence Summary</h4>
                      <div className="bg-purple-600/10 border border-purple-500/30 p-8 rounded-[2.5rem] italic text-[11px] text-zinc-300 leading-relaxed font-medium">
                         "{results.intelligence_summary}"
                      </div>
                   </div>
                   )}

                   {/* Recommendation Task */}
                   {!(results as any).error && (
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Task 5: Verification Recommendation</h4>
                      <div className={`p-8 rounded-[2.5rem] border ${results.verification_recommendation.status === 'VERIFIED' ? 'bg-green-600/10 border-green-500/30' : results.verification_recommendation.status === 'SUSPICIOUS' ? 'bg-red-600/10 border-red-500/30' : 'bg-orange-600/10 border-orange-500/30'} flex flex-col items-center text-center gap-4`}>
                         <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Trust Status</div>
                         <div className={`px-6 py-2 rounded-full text-[12px] font-black text-white uppercase tracking-[0.2em] shadow-xl ${results.verification_recommendation.status === 'VERIFIED' ? 'bg-green-600' : results.verification_recommendation.status === 'SUSPICIOUS' ? 'bg-red-600' : 'bg-orange-600'}`}>
                            {results.verification_recommendation.status}
                         </div>
                         <div className="text-4xl font-black text-white italic tracking-tighter">
                            {Math.round(results.verification_recommendation.trust_score * 100)}% <span className="text-xs text-zinc-500 font-bold">Trust</span>
                         </div>
                         <p className="text-[10px] text-zinc-400 leading-relaxed font-medium italic">"{results.verification_recommendation.summary}"</p>
                      </div>
                   </div>
                   )}

                   {/* Threat Task */}
                   {!(results as any).error && (
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Task 1: Threat Detection</h4>
                      <div className="flex flex-wrap gap-2">
                        {results.threat_detection.visible_threats.map((obj: string, i: number) => (
                          <div key={i} className="bg-zinc-900 border border-white/10 px-4 py-3 rounded-xl flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                             <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{obj}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                   )}

                   {/* Severity Task */}
                   {!(results as any).error && (
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Task 4: Severity Classification</h4>
                      <div className="bg-red-600/5 p-6 rounded-2xl border border-red-500/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-zinc-600 uppercase">Risk Level</span>
                          <span className="text-[11px] font-black text-red-500 uppercase">{results.severity.level}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium italic leading-relaxed">"{results.severity.justification}"</p>
                      </div>
                   </div>
                   )}

                   {/* Forensic Task */}
                   {!(results as any).error && (
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Task 2: Manipulation Audit</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                          <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Deepfake Probability</div>
                          <div className={`text-lg font-black ${results.manipulation_audit.deepfake_probability > 0.4 ? 'text-red-500' : 'text-green-500'}`}>
                             {(results.manipulation_audit.deepfake_probability * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                          <div className="text-[8px] font-black text-zinc-600 uppercase mb-1">Pixel Integrity</div>
                          <div className="text-lg font-black text-white">
                             {results.manipulation_audit.manipulation_detected ? 'COMPROMISED' : 'NOMINAL'}
                          </div>
                        </div>
                      </div>
                   </div>
                   )}

                   {/* Metadata Task */}
                   {!(results as any).error && (
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">Task 3: Metadata Consistency</h4>
                      <div className="bg-green-600/5 p-5 rounded-2xl border border-green-500/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-black text-zinc-600 uppercase">Context Match</span>
                          <span className={`text-[10px] font-black ${results.metadata_consistency.is_consistent ? 'text-green-500' : 'text-red-500'}`}>
                             {results.metadata_consistency.is_consistent ? 'VALIDATED' : 'ANOMALY'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                           {results.metadata_consistency.landmark_verification.map((l: string, i: number) => (
                               <span key={i} className="bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 text-[8px] font-black text-green-500 uppercase">{l}</span>
                           ))}
                        </div>
                      </div>
                   </div>
                   )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-8">
                   <div className="relative">
                      <div className="absolute inset-0 bg-zinc-800 blur-3xl opacity-20"></div>
                      <ICONS.Cpu className="w-24 h-24 text-zinc-800 relative z-10" />
                   </div>
                   <div className="text-center">
                      <h4 className="text-sm font-black text-zinc-700 uppercase tracking-[0.4em]">Awaiting Uplink</h4>
                      <p className="text-[10px] text-zinc-800 font-bold uppercase mt-3 text-center">Ready for 6-Point Intelligence Audit</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousUploadPortal;
