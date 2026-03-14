import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../../constants';
import { validateIncidentFileWithFallback, formatFileSize } from '../../utils/validateUpload';

interface IncidentUploadModalProps {
  type: 'video' | 'audio' | 'image';
  onClose: () => void;
  onSubmit: (metadata: any) => void;
  currentLocation: { lat: number; lng: number } | null;
  deviceFingerprint: string;
}

export const IncidentUploadModal: React.FC<IncidentUploadModalProps> = ({ type, onClose, onSubmit, currentLocation, deviceFingerprint }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [incidentCategory, setIncidentCategory] = useState('robbery');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const maxDuration = type === 'video' ? 20 : 15;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  const startRecording = async () => {
    try {
      if (type === 'image') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg, image/png';
        input.capture = 'environment';
        input.onchange = (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            // Validate image file
            const validation = validateIncidentFileWithFallback(file, 'image');
            if (!validation.valid) {
              setValidationError(validation.error || 'Invalid image file');
              return;
            }
            setValidationError(null);
            setMediaBlob(file);
            setMediaUrl(URL.createObjectURL(file));
          }
        };
        input.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video' ? { facingMode: 'environment' } : false,
        audio: true
      });

      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: type === 'video' ? 'video/webm;codecs=vp8,opus' : 'audio/webm' // Using webm as fallback for browser compatibility
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: type === 'video' ? 'video/mp4' : 'audio/wav' });
        
        // Create a File object from Blob for validation
        const fileName = `incident_${Date.now()}.${type === 'video' ? 'mp4' : 'wav'}`;
        const file = new File([blob], fileName, { type: blob.type });
        
        // Validate recorded media
        const validation = validateIncidentFileWithFallback(file, type);
        if (!validation.valid) {
          setValidationError(validation.error || `Invalid ${type} file`);
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        setValidationError(null);
        setMediaBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Microphone/Camera access required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleUpload = async () => {
    if (!mediaBlob) return;
    
    setUploadStatus('analyzing');
    
    const formData = new FormData();
    const fileExtension = type === 'video' ? 'mp4' : type === 'audio' ? 'wav' : 'jpg';
    const fieldName = type === 'video' ? 'video_file' : type === 'audio' ? 'audio_file' : 'images';
    formData.append(fieldName, mediaBlob, `incident.${fileExtension}`);
    
    const metadata = {
      report_type: type,
      incident_category: incidentCategory,
      node_id: 'mapper_2483', // Mock
      device_id: deviceFingerprint,
      timestamp: new Date().toISOString(),
      location: currentLocation || { lat: 0, lng: 0 },
      heading: 92,
      speed: 0,
      confidence_user: "high"
    };
    
    formData.append('metadata', JSON.stringify(metadata));

    try {
      let endpoint = '/api/v1/incidents/upload/video';
      if (type === 'audio') endpoint = '/api/v1/incidents/upload/audio';
      if (type === 'image') endpoint = '/api/v1/incidents/upload/image';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('success');
        setTimeout(() => {
          onSubmit(result);
          onClose();
        }, 2000);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-[3rem] p-8 shadow-2xl flex flex-col gap-8">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              {type === 'video' ? 'Video Incident Report' : type === 'audio' ? 'Audio Incident Report' : 'Image Incident Report'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
            <ICONS.Plus className="w-5 h-5 text-zinc-500 transform rotate-45" />
          </button>
        </div>

        {/* Validation Error Display */}
        {validationError && (
          <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
              <ICONS.AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black italic uppercase tracking-tighter text-red-500">Validation Failed</h4>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest max-w-[200px]">{validationError}</p>
            </div>
            <button 
              onClick={() => setValidationError(null)}
              className="mt-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-black text-[10px] tracking-widest uppercase transition-all hover:bg-zinc-800 border border-white/10"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {uploadStatus === 'idle' && !validationError && (
          <>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Incident Category</label>
              <select 
                value={incidentCategory}
                onChange={(e) => setIncidentCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white uppercase tracking-widest focus:outline-none focus:border-blue-500"
              >
                <option value="robbery">Robbery</option>
                <option value="weapon">Weapon Sighting</option>
                <option value="assault">Assault</option>
                <option value="accident">Accident</option>
                <option value="fire">Fire</option>
                <option value="unrest">Public Unrest</option>
                {type === 'audio' && <option value="gunshot">Gunshot</option>}
              </select>
            </div>

            <div className="relative aspect-video bg-black rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center">
              {type === 'video' && (
                <video 
                  ref={videoPreviewRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${mediaBlob ? 'hidden' : 'block'}`} 
                />
              )}
              
              {type === 'image' && mediaUrl && (
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
              )}
              
              {mediaBlob && type !== 'image' ? (
                <div className="text-center space-y-2">
                  <ICONS.Activity className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-xs font-black uppercase tracking-widest text-green-500">Capture Complete</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{formatFileSize(mediaBlob.size)}</p>
                </div>
              ) : (
                !isRecording && type === 'audio' && (
                  <ICONS.Mic className="w-16 h-16 text-zinc-800" />
                )
              )}
              
              {!mediaBlob && type === 'image' && (
                <ICONS.Camera className="w-16 h-16 text-zinc-800" />
              )}

              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-mono text-red-500 font-bold">
                    00:{recordingTime.toString().padStart(2, '0')} / 00:{maxDuration}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {!mediaBlob ? (
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 py-5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isRecording ? 'bg-zinc-800 text-white border border-white/10' : 'bg-red-600 text-white hover:bg-red-500'}`}
                >
                  {isRecording ? <ICONS.MapPin className="w-4 h-4" /> : type === 'video' ? <ICONS.Video className="w-4 h-4" /> : type === 'audio' ? <ICONS.Mic className="w-4 h-4" /> : <ICONS.Camera className="w-4 h-4" />}
                  {isRecording ? 'Stop Recording' : `Start ${type} Capture`}
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setMediaBlob(null);
                      setMediaUrl(null);
                    }}
                    className="flex-1 py-5 bg-zinc-900 text-zinc-400 rounded-2xl font-black text-xs tracking-widest uppercase transition-all hover:bg-zinc-800 active:scale-95 border border-white/5"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={handleUpload}
                    className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all hover:bg-blue-500 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                  >
                    Submit Evidence
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {uploadStatus === 'analyzing' && (
          <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20 animate-pulse" />
              <ICONS.Cpu className="w-16 h-16 text-blue-500 animate-bounce relative z-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Analyzing Evidence</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Running AI Forensic Validation Pipeline...</p>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-blue-500 w-1/2 animate-[pulse_1s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
              <ICONS.Shield className="w-10 h-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black italic uppercase tracking-tighter text-green-500">Incident Received</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Evidence verified and broadcast to grid.</p>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
              <ICONS.AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">Upload Failed</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Network error or validation failed.</p>
            </div>
            <button 
              onClick={() => setUploadStatus('idle')}
              className="mt-4 px-8 py-3 bg-zinc-900 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all hover:bg-zinc-800"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
