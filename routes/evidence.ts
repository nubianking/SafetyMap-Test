// ============================================================================
// EVIDENCE ROUTES - API endpoints for evidence management (SQLite backend)
// ============================================================================

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const router = Router();

// Use /data on Railway (persistent), or local data directory for development
const DATA_DIR = process.env.RAILWAY_ENVIRONMENT ? '/data' : path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`[Evidence] Created data directory: ${DATA_DIR}`);
}

const DB_PATH = process.env.EVIDENCE_DB_PATH || path.join(DATA_DIR, 'evidence.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS evidence (
    id TEXT PRIMARY KEY,
    hash TEXT UNIQUE,
    filename TEXT,
    mimetype TEXT,
    size INTEGER,
    data BLOB,
    metadata TEXT,
    audit_result TEXT,
    uploader_id TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    audited BOOLEAN DEFAULT 0
  )
`);

// Create index for faster queries
db.exec(`CREATE INDEX IF NOT EXISTS idx_evidence_uploaded_at ON evidence(uploaded_at DESC)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_evidence_audited ON evidence(audited)`);

console.log(`[Evidence] SQLite database initialized at ${DB_PATH}`);

// ============================================================================
// GET /api/v1/evidence - List all evidence with pagination
// ============================================================================
router.get('/', (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter = req.query.filter || 'all';
    
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    if (filter === 'audited') whereClause += ' AND audited = 1';
    if (filter === 'pending') whereClause += ' AND audited = 0';
    
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM evidence ${whereClause}`);
    const { total } = countStmt.get() as { total: number };
    
    const stmt = db.prepare(`
      SELECT id, hash, filename, mimetype, size, metadata, audit_result, uploaded_at, audited, uploader_id
      FROM evidence 
      ${whereClause}
      ORDER BY uploaded_at DESC 
      LIMIT ? OFFSET ?
    `);
    
    const rows = stmt.all(limit, offset) as any[];
    
    const data = rows.map(row => ({
      id: row.id,
      hash: row.hash,
      filename: row.filename,
      mimetype: row.mimetype,
      size: row.size,
      uploaded_at: row.uploaded_at,
      audited: Boolean(row.audited),
      uploader_id: row.uploader_id,
      metadata: JSON.parse(row.metadata || '{}'),
      audit_result: row.audit_result ? JSON.parse(row.audit_result) : null
    }));
    
    res.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error('[Evidence] Error fetching evidence:', error);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

// ============================================================================
// GET /api/v1/evidence/:id - Get single evidence metadata
// ============================================================================
router.get('/:id', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT id, hash, filename, mimetype, size, metadata, audit_result, uploaded_at, audited, uploader_id
      FROM evidence 
      WHERE id = ?
    `);
    const row = stmt.get(req.params.id) as any;
    
    if (!row) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    
    res.json({
      id: row.id,
      hash: row.hash,
      filename: row.filename,
      mimetype: row.mimetype,
      size: row.size,
      uploaded_at: row.uploaded_at,
      audited: Boolean(row.audited),
      uploader_id: row.uploader_id,
      metadata: JSON.parse(row.metadata || '{}'),
      audit_result: row.audit_result ? JSON.parse(row.audit_result) : null
    });
    
  } catch (error) {
    console.error('[Evidence] Error fetching evidence:', error);
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

// ============================================================================
// GET /api/v1/evidence/:id/stream - Stream evidence file
// ============================================================================
router.get('/:id/stream', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT mimetype, size, data FROM evidence WHERE id = ?');
    const row = stmt.get(req.params.id) as any;
    
    if (!row) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    
    res.setHeader('Content-Type', row.mimetype);
    res.setHeader('Content-Length', row.size);
    res.send(row.data);
    
  } catch (error) {
    console.error('[Evidence] Error streaming evidence:', error);
    res.status(500).json({ error: 'Failed to stream evidence' });
  }
});

// ============================================================================
// GET /api/v1/evidence/:id/download - Download evidence
// ============================================================================
router.get('/:id/download', (req: Request, res: Response) => {
  try {
    const stmt = db.prepare('SELECT filename, mimetype, size, data FROM evidence WHERE id = ?');
    const row = stmt.get(req.params.id) as any;
    
    if (!row) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    
    res.setHeader('Content-Type', row.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${row.filename}"`);
    res.setHeader('Content-Length', row.size);
    res.send(row.data);
    
  } catch (error) {
    console.error('[Evidence] Error downloading evidence:', error);
    res.status(500).json({ error: 'Failed to download evidence' });
  }
});

// ============================================================================
// DELETE /api/v1/evidence/:id - Delete evidence (admin only)
// ============================================================================
router.delete('/:id', (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if ((req as any).user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const stmt = db.prepare('DELETE FROM evidence WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    
    res.json({ success: true, message: 'Evidence deleted' });
    
  } catch (error) {
    console.error('[Evidence] Error deleting evidence:', error);
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
});

// ============================================================================
// Helper functions for adding evidence (called from upload handlers)
// ============================================================================

import crypto from 'crypto';

/**
 * Add evidence to the database
 */
export const addEvidence = (
  id: string,
  filename: string,
  mimetype: 'video' | 'audio' | 'image',
  data: Buffer,
  metadata: any,
  uploaderId?: string
): { id: string; hash: string } => {
  // Generate SHA-256 hash of the data
  const hash = crypto.createHash('sha256').update(data).digest('hex');

  const stmt = db.prepare(`
    INSERT INTO evidence (id, hash, filename, mimetype, size, data, metadata, uploader_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    hash,
    filename,
    mimetype,
    data.length,
    data,
    JSON.stringify(metadata),
    uploaderId || null
  );

  return { id, hash };
};

/**
 * Get evidence count
 */
export const getEvidenceCount = (): number => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM evidence');
  const result = stmt.get() as { count: number };
  return result.count;
};

export default router;
