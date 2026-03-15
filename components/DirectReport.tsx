// ============================================================================
// DIRECT REPORT - Complete Working Upload Component with Auth & Error Handling
// ============================================================================

import React, { useState } from 'react';
import { validateIncidentFileWithFallback } from '../utils/validateUpload';
import { checkAuthBeforeUpload } from '../services/uploadService';
import { forceReLogin } from '../services/api';

interface DirectReportProps {
  onSuccess?: (result: any) => void;
  redirectOnAuthFail?: boolean;
}

export const DirectReport: React.FC<DirectReportProps> = ({ 
  onSuccess,
  redirectOnAuthFail = true 
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const detectFileType = (file: File): 'video' | 'audio' | 'image' | null => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('image/')) return 'image';
    return null;
  };

  const handleUpload = async (file: File, type: 'video' | 'audio' | 'image') => {
    setError(null);
    setUploading(true);
    setProgress(0);

    // 1. Validate file
    const validation = validateIncidentFileWithFallback(file, type);
    if (!validation.valid) {
      setError(validation.error);
      setUploading(false);
      return;
    }

    // 2. Check auth
    const token = checkAuthBeforeUpload(redirectOnAuthFail);
    if (!token) {
      setError("Authentication required. Please log in.");
      setUploading(false);
      return;
    }

    // 3. Prepare form data
    const formData = new FormData();
    const fieldName = type === 'video' ? 'video_file' : type === 'audio' ? 'audio_file' : 'images';
    formData.append(fieldName, file);
    formData.append('metadata', JSON.stringify({
      report_type: type,
      incident_category: 'general',
      node_id: localStorage.getItem('nodeId') || 'unknown',
      device_id: localStorage.getItem('deviceId') || 'web-client',
      timestamp: new Date().toISOString(),
      location: null // Could be fetched from geolocation API
    }));

    // 4. Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

    try {
      setProgress(25);
      
      const endpoint = `/api/v1/incidents/upload/${type}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // ❌ DON'T set 'Content-Type': 'multipart/form-data'
          // Browser sets it automatically with boundary
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      setProgress(75);

      // 5. Handle specific HTTP error codes
      // Handle auth errors - force re-login on 401 or permission-related 403
      if (response.status === 401) {
        forceReLogin('session_expired');
        throw new Error('Session expired. Please log in again.');
      }
      if (response.status === 403) {
        // Check if it's a permission/session related 403
        const errorData = await response.clone().json().catch(() => ({ error: '' }));
        const errorMessage = errorData.error || '';
        const isAuthRelated = ['permission', 'forbidden', 'unauthorized', 'invalid token', 'signature', 'jwt', 'auth']
          .some(keyword => errorMessage.toLowerCase().includes(keyword.toLowerCase()));
        
        if (isAuthRelated) {
          forceReLogin('session_expired');
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Access denied. Insufficient permissions.');
      }
      if (response.status === 413) {
        throw new Error('File too large for server. Max 50MB.');
      }
      if (response.status === 415) {
        throw new Error('Invalid file format. Server rejected the file type.');
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      setProgress(100);
      console.log("✅ Upload successful:", result);
      
      // Show success, clear form
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Reset after success
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
      
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Upload error:", err);
      
      if (err.name === 'AbortError') {
        setError('Upload timed out. File may be too large or connection is slow.');
      } else if (err.message === 'Failed to fetch') {
        setError('Network error. Check your connection or the server may be unavailable.');
      } else {
        setError(err.message || 'Network error or validation failed.');
      }
      
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-detect type
    const type = detectFileType(file);
    if (!type) {
      setError('Invalid file type. Please upload video, audio, or image files only.');
      return;
    }

    handleUpload(file, type);
  };

  return (
    <div className="direct-report bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-white">
        Quick Incident Report
      </h3>
      
      <label className={`relative block w-full p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer
        ${uploading ? 'border-blue-500/50 bg-blue-500/5' : 'border-zinc-700 hover:border-orange-500/50 hover:bg-zinc-800'}
        ${error ? 'border-red-500/50 bg-red-500/5' : ''}
      `}>
        <input
          type="file"
          className="hidden"
          accept="video/mp4,video/quicktime,video/webm,audio/wav,audio/mpeg,audio/webm,image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        <div className="text-center space-y-2">
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                Uploading... {progress}%
              </p>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-zinc-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Click to upload video, audio, or image
              </p>
              <p className="text-[10px] text-zinc-600">
                Max: Video 50MB • Audio 10MB • Image 10MB
              </p>
            </>
          )}
        </div>
      </label>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Upload Failed</p>
            <p className="text-sm text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!uploading && !error && (
        <p className="text-[10px] text-zinc-600 text-center">
          Files are validated and scanned before upload
        </p>
      )}
    </div>
  );
};

export default DirectReport;
