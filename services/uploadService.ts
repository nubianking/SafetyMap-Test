// ============================================================================
// UPLOAD SERVICE - File Upload with Timeout, AbortController & Error Handling
// ============================================================================

import { validateIncidentFileWithFallback } from '../utils/validateUpload';

export interface UploadMetadata {
  report_type: 'video' | 'audio' | 'image';
  incident_category: string;
  node_id: string;
  device_id: string;
  timestamp: string;
  location: { lat: number; lng: number } | null;
  heading?: number;
  speed?: number;
  confidence_user?: string;
}

export interface UploadOptions {
  timeout?: number; // milliseconds, default: 60000 (60s)
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Uploads an incident file with proper error handling, timeout, and auth.
 * 
 * @param file - The file/blob to upload
 * @param type - Upload type (video, audio, image)
 * @param metadata - Upload metadata
 * @param options - Upload options (timeout, progress callback)
 * @returns UploadResult with success flag and data or error
 * 
 * @example
 * ```typescript
 * const result = await uploadIncidentFile(
 *   mediaBlob, 
 *   'video', 
 *   { report_type: 'video', incident_category: 'robbery', ... },
 *   { timeout: 120000 }
 * );
 * 
 * if (!result.success) {
 *   setError(result.error);
 * }
 * ```
 */
export const uploadIncidentFile = async (
  file: Blob,
  type: 'video' | 'audio' | 'image',
  metadata: UploadMetadata,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { timeout = 60000 } = options;
  
  // Create File from Blob for validation
  const fileName = `incident_${Date.now()}.${type === 'video' ? 'mp4' : type === 'audio' ? 'wav' : 'jpg'}`;
  const fileObj = new File([file], fileName, { type: file.type || `${type}/${type === 'video' ? 'mp4' : type === 'audio' ? 'wav' : 'jpeg'}` });
  
  // Validate file before upload
  const validation = validateIncidentFileWithFallback(fileObj, type);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  // Build form data
  const formData = new FormData();
  const fieldName = type === 'video' ? 'video_file' : type === 'audio' ? 'audio_file' : 'images';
  formData.append(fieldName, file, fileName);
  formData.append('metadata', JSON.stringify(metadata));
  
  // Determine endpoint
  let endpoint = '/api/v1/incidents/upload/video';
  if (type === 'audio') endpoint = '/api/v1/incidents/upload/audio';
  if (type === 'image') endpoint = '/api/v1/incidents/upload/image';
  
  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Get auth token
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        // ❌ DON'T set 'Content-Type': 'multipart/form-data'
        // Browser sets it automatically with boundary
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: `Upload timed out after ${timeout / 1000}s. File may be too large or connection is slow.` 
      };
    }
    
    if (error.message === 'Failed to fetch') {
      return { 
        success: false, 
        error: 'Network error. Check your connection or the server may be unavailable.' 
      };
    }
    
    return { success: false, error: error.message || 'Upload failed' };
  }
};

/**
 * Uploads multiple image files.
 * 
 * @param files - Array of File objects
 * @param metadata - Upload metadata
 * @param options - Upload options
 * @returns UploadResult
 */
export const uploadImageBatch = async (
  files: File[],
  metadata: UploadMetadata,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { timeout = 60000 } = options;
  
  if (files.length === 0) {
    return { success: false, error: 'No files selected' };
  }
  
  if (files.length > 3) {
    return { success: false, error: 'Maximum 3 images allowed' };
  }
  
  // Validate all files
  for (let i = 0; i < files.length; i++) {
    const validation = validateIncidentFileWithFallback(files[i], 'image');
    if (!validation.valid) {
      return { success: false, error: `File ${i + 1}: ${validation.error}` };
    }
  }
  
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  formData.append('metadata', JSON.stringify(metadata));
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/api/v1/incidents/upload/image', {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: `Upload timed out after ${timeout / 1000}s.` 
      };
    }
    
    if (error.message === 'Failed to fetch') {
      return { success: false, error: 'Network error. Check your connection.' };
    }
    
    return { success: false, error: error.message || 'Upload failed' };
  }
};

/**
 * Checks network connectivity.
 * 
 * @returns Promise<boolean>
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health', { 
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
};
