// ============================================================================
// EVIDENCE ROUTES - API endpoints for evidence management
// ============================================================================

import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Evidence storage directory
const EVIDENCE_DIR = path.join(process.cwd(), 'uploads', 'evidence');
const METADATA_FILE = path.join(EVIDENCE_DIR, 'metadata.json');

// Ensure evidence directory exists
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

// In-memory evidence store (loaded from disk on startup)
interface EvidenceItem {
  id: string;
  hash: string;
  filename: string;
  mimetype: 'video' | 'image' | 'audio';
  size: number;
  uploaded_at: string;
  audited: boolean;
  uploader_id?: string;
  metadata: {
    lat: number;
    lng: number;
    incident_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}

let evidenceStore: EvidenceItem[] = [];

// Load existing metadata from disk
const loadMetadata = () => {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const data = fs.readFileSync(METADATA_FILE, 'utf-8');
      evidenceStore = JSON.parse(data);
      console.log(`[Evidence] Loaded ${evidenceStore.length} items from disk`);
    }
  } catch (error) {
    console.error('[Evidence] Failed to load metadata:', error);
    evidenceStore = [];
  }
};

// Save metadata to disk
const saveMetadata = () => {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(evidenceStore, null, 2));
  } catch (error) {
    console.error('[Evidence] Failed to save metadata:', error);
  }
};

// Load on startup
loadMetadata();

// ============================================================================
// GET /api/v1/evidence - List all evidence
// ============================================================================
router.get('/', (req: Request, res: Response) => {
  try {
    // Sort by uploaded_at descending (newest first)
    const sorted = [...evidenceStore].sort(
      (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    );
    res.json(sorted);
  } catch (error) {
    console.error('[Evidence] Failed to list evidence:', error);
    res.status(500).json({ error: 'Failed to retrieve evidence list' });
  }
});

// ============================================================================
// GET /api/v1/evidence/:id - Get single evidence item
// ============================================================================
router.get('/:id', (req: Request, res: Response) => {
  try {
    const item = evidenceStore.find(e => e.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('[Evidence] Failed to get evidence:', error);
    res.status(500).json({ error: 'Failed to retrieve evidence' });
  }
});

// ============================================================================
// GET /api/v1/evidence/:id/stream - Stream evidence file
// ============================================================================
router.get('/:id/stream', (req: Request, res: Response) => {
  try {
    const item = evidenceStore.find(e => e.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    const filePath = path.join(EVIDENCE_DIR, item.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate content type
    const ext = path.extname(item.filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.ogg': 'audio/ogg',
      '.webm': 'audio/webm'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
    stream.on('error', (err) => {
      console.error('[Evidence] Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });
  } catch (error) {
    console.error('[Evidence] Failed to stream evidence:', error);
    res.status(500).json({ error: 'Failed to stream evidence' });
  }
});

// ============================================================================
// GET /api/v1/evidence/:id/download - Download evidence file
// ============================================================================
router.get('/:id/download', (req: Request, res: Response) => {
  try {
    const item = evidenceStore.find(e => e.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    const filePath = path.join(EVIDENCE_DIR, item.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, item.filename);
  } catch (error) {
    console.error('[Evidence] Failed to download evidence:', error);
    res.status(500).json({ error: 'Failed to download evidence' });
  }
});

// ============================================================================
// DELETE /api/v1/evidence/:id - Delete evidence item
// ============================================================================
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const index = evidenceStore.findIndex(e => e.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    const item = evidenceStore[index];
    const filePath = path.join(EVIDENCE_DIR, item.filename);

    // Delete file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from store
    evidenceStore.splice(index, 1);
    saveMetadata();

    res.json({ success: true, message: 'Evidence deleted' });
  } catch (error) {
    console.error('[Evidence] Failed to delete evidence:', error);
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
});

// ============================================================================
// Helper functions for adding evidence (called from upload handlers)
// ============================================================================

/**
 * Add evidence to the store
 */
export const addEvidence = (
  id: string,
  filename: string,
  mimetype: 'video' | 'audio' | 'image',
  size: number,
  metadata: any,
  uploaderId?: string
): EvidenceItem => {
  // Generate SHA-256 hash (simplified - in production use crypto)
  const hash = `sha256-${Buffer.from(id + Date.now().toString()).toString('hex').substring(0, 64)}`;

  const item: EvidenceItem = {
    id,
    hash,
    filename,
    mimetype,
    size,
    uploaded_at: new Date().toISOString(),
    audited: false,
    uploader_id: uploaderId,
    metadata: {
      lat: metadata.location?.lat || 0,
      lng: metadata.location?.lng || 0,
      incident_type: metadata.incident_category || 'unknown',
      severity: metadata.severity || 'low'
    }
  };

  evidenceStore.push(item);
  saveMetadata();
  return item;
};

/**
 * Get evidence directory path
 */
export const getEvidenceDir = () => EVIDENCE_DIR;

export default router;
