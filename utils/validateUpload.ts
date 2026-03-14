// ============================================================================
// FILE VALIDATION UTILITY - Incident Upload Validation
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileLimits {
  maxSize: number;
  types: string[];
  maxDuration?: number; // in seconds, for media files
}

export const FILE_LIMITS: Record<'video' | 'audio' | 'image', FileLimits> = {
  video: { 
    maxSize: 50 * 1024 * 1024, // 50MB
    types: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxDuration: 20
  },
  audio: { 
    maxSize: 10 * 1024 * 1024, // 10MB
    types: ['audio/wav', 'audio/mpeg', 'audio/webm', 'audio/ogg'],
    maxDuration: 15
  },
  image: { 
    maxSize: 10 * 1024 * 1024, // 10MB
    types: ['image/jpeg', 'image/png', 'image/webp'],
    maxDuration: undefined
  }
} as const;

/**
 * Validates an incident upload file against type-specific limits.
 * 
 * @param file - The File object to validate
 * @param type - The expected file type category
 * @returns ValidationResult with valid flag and optional error message
 * 
 * @example
 * ```typescript
 * const validation = validateIncidentFile(file, 'video');
 * if (!validation.valid) {
 *   setError(validation.error);
 *   return;
 * }
 * ```
 */
export const validateIncidentFile = (
  file: File, 
  type: 'video' | 'audio' | 'image'
): ValidationResult => {
  const limits = FILE_LIMITS[type];
  
  // Validate file type
  if (!limits.types.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid format. Allowed: ${limits.types.map(t => t.split('/')[1].toUpperCase()).join(', ')}` 
    };
  }
  
  // Validate file size
  if (file.size > limits.maxSize) {
    const maxSizeMB = limits.maxSize / 1024 / 1024;
    return { 
      valid: false, 
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${maxSizeMB}MB` 
    };
  }
  
  return { valid: true };
};

/**
 * Validates multiple image files (for batch uploads).
 * 
 * @param files - Array of File objects
 * @param maxCount - Maximum number of files allowed
 * @returns ValidationResult with valid flag and optional error message
 */
export const validateImageBatch = (
  files: FileList | null, 
  maxCount: number = 3
): ValidationResult => {
  if (!files || files.length === 0) {
    return { valid: false, error: 'No files selected' };
  }
  
  if (files.length > maxCount) {
    return { valid: false, error: `Maximum ${maxCount} images allowed` };
  }
  
  for (let i = 0; i < files.length; i++) {
    const validation = validateIncidentFile(files[i], 'image');
    if (!validation.valid) {
      return { 
        valid: false, 
        error: `File ${i + 1}: ${validation.error}` 
      };
    }
  }
  
  return { valid: true };
};

/**
 * Formats file size for display.
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "5.2 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets file extension from filename.
 * 
 * @param filename - The filename
 * @returns File extension in lowercase
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
};

/**
 * Maps file extension to MIME type for validation fallback.
 * 
 * @param extension - File extension (without dot)
 * @returns MIME type or 'application/octet-stream' as fallback
 */
export const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
    'wav': 'audio/wav',
    'mp3': 'audio/mpeg',
    'ogg': 'audio/ogg',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp'
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Enhanced validation that also checks file extension as fallback
 * when MIME type might be unreliable (e.g., some mobile browsers).
 * 
 * @param file - The File object to validate
 * @param type - The expected file type category
 * @returns ValidationResult with valid flag and optional error message
 */
export const validateIncidentFileWithFallback = (
  file: File, 
  type: 'video' | 'audio' | 'image'
): ValidationResult => {
  // Try primary MIME type validation first
  const primaryValidation = validateIncidentFile(file, type);
  if (primaryValidation.valid) {
    return primaryValidation;
  }
  
  // If MIME type check fails, try extension-based fallback
  const extension = getFileExtension(file.name);
  const limits = FILE_LIMITS[type];
  
  // Check if extension maps to an allowed MIME type
  const allowedExtensions = limits.types.map(mime => {
    const parts = mime.split('/');
    return parts[1]; // e.g., 'mp4' from 'video/mp4'
  });
  
  // Handle special cases
  const normalizedExtension = extension === 'jpg' ? 'jpeg' : extension;
  
  if (!allowedExtensions.includes(normalizedExtension)) {
    return { 
      valid: false, 
      error: `Invalid format (.${extension}). Allowed: ${allowedExtensions.map(e => e.toUpperCase()).join(', ')}` 
    };
  }
  
  // Extension is valid, check size
  if (file.size > limits.maxSize) {
    const maxSizeMB = limits.maxSize / 1024 / 1024;
    return { 
      valid: false, 
      error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${maxSizeMB}MB` 
    };
  }
  
  return { valid: true };
};
