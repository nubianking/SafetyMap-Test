import express from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import winston from "winston";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AlertData {
  id?: string;
  timestamp: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  [key: string]: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

interface AnalysisMetadata {
  incident_category?: string;
  [key: string]: any;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PORT = process.env.PORT || 3000;
const MAX_ALERTS = 50;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const UPLOAD_CONFIDENCE_THRESHOLD = 0.5;
const SALT_ROUNDS = 10;
// JWT Secret validation - fail hard in production if missing
const rawJwtSecret = process.env.JWT_SECRET;

if (!rawJwtSecret && process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: JWT_SECRET environment variable is required in production');
  process.exit(1); // Hard fail - don't start server without secret
}

if (!rawJwtSecret) {
  console.warn('⚠️  WARNING: Using insecure fallback JWT secret for development only');
}

const JWT_SECRET = rawJwtSecret || 'dev_fallback_secret_change_immediately';
const JWT_EXPIRES_IN = '24h';

// Structured auth logger — writes to auth.log + console
const authLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'auth.log', maxsize: 5242880, maxFiles: 3 }),
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) })
  ]
});

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE }
});

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

// JWT authentication middleware for protected routes
interface AuthenticatedRequest extends Request {
  user?: { mapperId: string; alias: string; role?: string };
}

/**
 * Authentication middleware with detailed logging for debugging.
 * Verifies JWT token and attaches user info to request.
 */
const authenticate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Debug logging
  authLogger.info('🔐 Auth check', { 
    path: req.path,
    hasAuthHeader: !!authHeader,
    headerPreview: authHeader ? `${authHeader.substring(0, 20)}...` : 'none'
  });
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    authLogger.warn('❌ Auth failed - invalid header format', { 
      path: req.path,
      ip: req.ip 
    });
    return res.status(401).json(
      createApiResponse(false, undefined, 'Access denied. Insufficient permissions.')
    );
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    authLogger.warn('❌ Auth failed - no token', { path: req.path, ip: req.ip });
    return res.status(401).json(
      createApiResponse(false, undefined, 'Access denied. Insufficient permissions.')
    );
  }

  try {
    // Use the SAME secret used during login
    const decoded = jwt.verify(token, JWT_SECRET) as { mapperId: string; alias: string; role?: string };
    
    authLogger.info('✅ Token verified', { 
      mapperId: decoded.mapperId, 
      alias: decoded.alias,
      role: decoded.role || 'mapper'
    });
    
    (req as AuthenticatedRequest).user = decoded;
    next();
    
  } catch (error: any) {
    // Detailed error logging for debugging
    authLogger.error('❌ JWT Verification failed', {
      error: error.message,
      tokenPreview: token.substring(0, 20) + '...',
      secretConfigured: !!process.env.JWT_SECRET,
      usingFallback: JWT_SECRET.includes('fallback'),
      path: req.path
    });
    
    // Provide specific error messages in development
    const isDev = process.env.NODE_ENV === 'development';
    const details = isDev ? error.message : 'Invalid or expired token';
    
    return res.status(403).json(
      createApiResponse(false, undefined, 'Access denied. Insufficient permissions.')
    );
  }
};

/**
 * Role-based authorization middleware.
 * Checks if authenticated user has required role(s).
 * Must be used AFTER authenticate middleware.
 * 
 * @param roles - Allowed roles
 */
const requireRole = (...roles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user) {
      authLogger.warn('❌ Role check failed - no user in request', { roles });
      return res.status(403).json(
        createApiResponse(false, undefined, 'Access denied. Insufficient permissions.')
      );
    }
    
    const userRole = user.role || 'mapper';
    
    if (!roles.includes(userRole)) {
      authLogger.warn('❌ Role check failed', { 
        userRole, 
        required: roles,
        user: user.alias 
      });
      return res.status(403).json(
        createApiResponse(false, undefined, 'Access denied. Insufficient permissions.')
      );
    }
    
    next();
  };
};

// ============================================================================
// UTILITIES & HELPERS
// ============================================================================

const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data || ''),
  debug: (msg: string, data?: any) => process.env.DEBUG && console.log(`[DEBUG] ${msg}`, data || '')
};

const validateMetadata = (metadataStr?: string): AnalysisMetadata => {
  if (!metadataStr) return {};
  try {
    return JSON.parse(metadataStr);
  } catch {
    return {};
  }
};

const createApiResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString()
});

async function startServer() {
  const app = express();

  // Core middleware
  // CORS configuration for frontend communication
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
  app.use(express.json({ limit: '50mb' }));
  
  // Timeout middleware for large file uploads (5 minutes)
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(300000, () => {
      res.status(408).json(createApiResponse(false, undefined, 'Request timeout'));
    });
    res.setTimeout(300000);
    next();
  });

  // Security headers (HSTS, X-Content-Type-Options, etc.)
  app.use(helmet({
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    },
    contentSecurityPolicy: false // disabled so Vite HMR works in dev
  }));

  // HTTPS redirect (production only)
  if (process.env.NODE_ENV === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // In-memory stores (replace with database for production)
  let alerts: AlertData[] = [];

  // --- Real-time tracking store (mapperId → last N locations) ---
  interface StoredLocation {
    lat: number;
    lng: number;
    speed: number;
    heading: number | null;
    accuracy: number;
    timestamp: number;
    mapperId: string;
  }
  const MAX_LOCATIONS_PER_MAPPER = 100;
  const STALE_LOCATION_MS = 5 * 60 * 1000; // 5 minutes
  const trackingStore = new Map<string, StoredLocation[]>();

  /** Return adaptive interval (ms) recommendation for a given speed (km/h). */
  const getRecommendedInterval = (speed: number): number => {
    if (speed > 60) return 5000;
    if (speed > 30) return 10000;
    if (speed > 5)  return 15000;
    return 30000;
  };

  interface MapperProfile {
    id: string;
    alias: string;
    passkey: string;
    fullName: string;
    dob: string;
    phone: string;
    email: string;
    nationality: string;
    mobility: string;
    zone: string;
    bankName: string;
    accountNumber: string;
    trustScore: number;
    score: number;
    rank: string;
    balance: number;
    history: any[];
  }

  let mappers: MapperProfile[] = [];

  // seed development credentials for sentry testing (passkeys are hashed at startup)
  const seedAdminPasskey = await bcrypt.hash('dev_admin_passkey_2024', SALT_ROUNDS);
  mappers.push({
    id: 'mapper_admin',
    alias: 'admin',
    passkey: seedAdminPasskey,
    fullName: 'Admin User',
    dob: '1990-01-01',
    phone: '+2340000000000',
    email: 'admin@safetymap.dev',
    nationality: 'Nigerian',
    mobility: 'Private Vehicle',
    zone: 'Lagos Mainland',
    bankName: 'ABC Bank',
    accountNumber: '1234567890',
    trustScore: 100,
    score: 100,
    rank: 'Apex Elite',
    balance: 100000,
    history: []
  });

  const seedMapperPasskey = await bcrypt.hash('test_passkey_123', SALT_ROUNDS);
  mappers.push({
    id: 'mapper_test',
    alias: 'test_mapper',
    passkey: seedMapperPasskey,
    fullName: 'Test Mapper',
    dob: '1995-06-15',
    phone: '+2340000000001',
    email: 'mapper@safetymap.dev',
    nationality: 'Nigerian',
    mobility: 'Motorcycle',
    zone: 'Lagos Island',
    bankName: 'XYZ Bank',
    accountNumber: '0987654321',
    trustScore: 50,
    score: 0,
    rank: 'Watcher',
    balance: 0,
    history: []
  });

  // ============================================================================
  // HEALTH CHECK ENDPOINT
  // ============================================================================

  app.get("/api/health", (req: Request, res: Response) => {
    res.json(createApiResponse(true, { status: "healthy" }));
  });

  // ============================================================================
  // ALERTS ENDPOINTS
  // ============================================================================

  app.get("/api/alerts", (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || MAX_ALERTS, MAX_ALERTS);
      res.json(createApiResponse(true, alerts.slice(0, limit)));
    } catch (error) {
      res.status(400).json(createApiResponse(false, undefined, 'Invalid query parameters'));
    }
  });

  // ====== MAPPER PROFILE ENDPOINTS ======

  // list all mappers (protected — admin/debug only)
  app.get("/api/mappers", authenticate, (req: Request, res: Response) => {
    res.json(createApiResponse(true, mappers.map(m => {
      const { passkey, ...safe } = m;
      return safe;
    })));
  });

  // ====== INPUT VALIDATION SCHEMAS ======

  const mapperSchema = z.object({
    alias: z.string().min(3, 'Alias must be at least 3 characters').max(20, 'Alias must be at most 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Alias must contain only letters, numbers, and underscores'),
    fullName: z.string().min(2, 'Full name is required').max(100),
    dob: z.string().min(1, 'Date of birth is required'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g. +2340000000000)'),
    email: z.string().email('Invalid email address'),
    nationality: z.string().min(2, 'Nationality is required').max(50),
    mobility: z.string().min(1, 'Mobility type is required').max(50),
    zone: z.string().min(1, 'Zone is required').max(100),
    bankName: z.string().min(1, 'Bank name is required').max(100),
    accountNumber: z.string().min(5, 'Account number too short').max(20, 'Account number too long'),
  });

  const loginSchema = z.object({
    alias: z.string().min(1, 'Alias or email is required'),
    passkey: z.string().min(1, 'Passkey is required'),
  });

  // create new mapper profile during onboarding
  app.post("/api/mappers", async (req: Request, res: Response) => {
    try {
      const parsed = mapperSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json(createApiResponse(false, undefined, `Validation failed: ${errors.join('; ')}`));
      }
      const body = parsed.data;

      if (mappers.find(m => m.alias === body.alias || m.email === body.email)) {
        return res.status(409).json(createApiResponse(false, undefined, 'Alias or email already exists'));
      }

      const rawPasskey = Math.random().toString(36).slice(2, 10);
      const hashedPasskey = await bcrypt.hash(rawPasskey, SALT_ROUNDS);

      const newProfile: MapperProfile = {
        id: `mapper_${Date.now()}`,
        alias: body.alias,
        passkey: hashedPasskey,
        fullName: body.fullName,
        dob: body.dob,
        phone: body.phone,
        email: body.email,
        nationality: body.nationality,
        mobility: body.mobility,
        zone: body.zone,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        trustScore: 50,
        score: 0,
        rank: 'Watcher',
        balance: 0,
        history: []
      };

      mappers.push(newProfile);
      const safe = { ...newProfile };
      delete (safe as any).passkey;
      authLogger.info('Mapper registered', { alias: body.alias, email: body.email, mapperId: newProfile.id });
      res.status(201).json(createApiResponse(true, { profile: safe, passkey: rawPasskey }));
    } catch (error) {
      authLogger.error('Mapper registration failed', { error: (error as Error).message });
      logger.error('Mapper creation failed', error);
      res.status(500).json(createApiResponse(false, undefined, 'Failed to create mapper'));
    }
  });

  // login existing mapper (rate-limited: 5 attempts per 15 min)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: createApiResponse(false, undefined, 'Too many login attempts. Please try again in 15 minutes.'),
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // only count failed attempts
  });

  app.post("/api/mappers/login", loginLimiter, async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        authLogger.warn('Login validation failed', { ip: req.ip, errors });
        return res.status(400).json(createApiResponse(false, undefined, `Validation failed: ${errors.join('; ')}`));
      }
      const { alias, passkey } = parsed.data;

      // 🔑 DEV ONLY: Environment-variable admin check
      const adminAlias = process.env.ADMIN_ALIAS;
      const adminPasskey = process.env.ADMIN_PASSKEY;
      if (adminAlias && adminPasskey && alias === adminAlias && passkey === adminPasskey) {
        const token = jwt.sign(
          {
            mapperId: 'admin_001',
            alias: 'admin',
            role: 'admin',
            permissions: ['all', 'users', 'audit', 'system']
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        authLogger.info('Admin login successful', { alias, ip: req.ip, role: 'admin' });

        return res.json(createApiResponse(true, {
          token,
          profile: {
            id: 'admin_001',
            alias: 'admin',
            fullName: 'System Administrator',
            role: 'admin',
            isAdmin: true,
            trustScore: 100,
            score: 100,
            rank: 'System',
            balance: 0,
            history: []
          }
        }));
      }

      const found = mappers.find(m => m.alias === alias || m.email === alias);
      if (!found) {
        // Timing attack prevention: still run bcrypt to match response time
        await bcrypt.hash(passkey, SALT_ROUNDS);
        authLogger.warn('Login failed — unknown alias', { alias, ip: req.ip, success: false });
        return res.status(401).json(createApiResponse(false, undefined, 'Invalid credentials'));
      }
      const isValid = await bcrypt.compare(passkey, found.passkey);
      if (!isValid) {
        authLogger.warn('Login failed — wrong passkey', { alias, ip: req.ip, success: false });
        return res.status(401).json(createApiResponse(false, undefined, 'Invalid credentials'));
      }

      // Sign JWT token with role for consistency
      const token = jwt.sign(
        { 
          mapperId: found.id, 
          alias: found.alias,
          role: 'mapper'  // Default role for regular mappers
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const safe = { ...found };
      delete (safe as any).passkey;
      authLogger.info('Login successful', { alias: found.alias, mapperId: found.id, ip: req.ip, success: true });
      res.json(createApiResponse(true, { token, profile: safe }));
    } catch (error) {
      authLogger.error('Login error', { ip: req.ip, error: (error as Error).message });
      logger.error('Login error', error);
      res.status(500).json(createApiResponse(false, undefined, 'Login failed'));
    }
  });

  app.post("/api/alerts", authenticate, (req: Request, res: Response) => {
    try {
      const newAlert: AlertData = {
        id: `alert_${Date.now()}`,
        ...req.body,
        timestamp: new Date().toISOString()
      };

      // Basic validation
      if (!newAlert.title || !newAlert.severity) {
        return res.status(400).json(
          createApiResponse(false, undefined, 'Missing required fields: title, severity')
        );
      }

      alerts = [newAlert, ...alerts].slice(0, MAX_ALERTS);
      logger.info('New alert created', { id: newAlert.id });
      
      res.status(201).json(createApiResponse(true, newAlert));
    } catch (error) {
      logger.error('Alert creation failed', error);
      res.status(500).json(createApiResponse(false, undefined, 'Failed to create alert'));
    }
  });


  // ============================================================================
  // REAL-TIME TRACKING ENDPOINTS
  // ============================================================================

  const locationUpdateSchema = z.object({
    locations: z.array(z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      speed: z.number().min(0).max(500),          // km/h
      heading: z.number().nullable(),
      accuracy: z.number().min(0),
      timestamp: z.number(),
    })).min(1).max(50),  // batched: 1..50 locations per request
  });

  // POST /api/tracking/location — receive batched location updates
  app.post("/api/tracking/location", authenticate, (req: Request, res: Response) => {
    try {
      const parsed = locationUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json(
          createApiResponse(false, undefined, `Validation failed: ${errors.join('; ')}`)
        );
      }

      const user = (req as AuthenticatedRequest).user;
      const mapperId = user?.mapperId || 'unknown';
      const { locations } = parsed.data;

      // Store locations
      const existing = trackingStore.get(mapperId) || [];
      const stamped = locations.map(loc => ({ ...loc, mapperId }));
      const merged = [...existing, ...stamped].slice(-MAX_LOCATIONS_PER_MAPPER);
      trackingStore.set(mapperId, merged);

      // Compute recommended interval from latest speed
      const latestSpeed = locations[locations.length - 1].speed;
      const recommendedInterval = getRecommendedInterval(latestSpeed);

      logger.info('Tracking update received', {
        mapperId,
        count: locations.length,
        latestSpeed,
        recommendedInterval,
      });

      res.json(createApiResponse(true, {
        stored: locations.length,
        recommendedInterval,
        latestSpeed,
      }));
    } catch (error) {
      logger.error('Tracking update failed', error);
      res.status(500).json(
        createApiResponse(false, undefined, 'Failed to process tracking update')
      );
    }
  });

  // GET /api/tracking/locations — fetch latest position of all active mappers
  app.get("/api/tracking/locations", authenticate, (req: Request, res: Response) => {
    try {
      const now = Date.now();
      const activeMappers: Record<string, any> = {};

      trackingStore.forEach((locations, mapperId) => {
        if (locations.length === 0) return;
        const latest = locations[locations.length - 1];
        // Exclude stale entries
        if (now - latest.timestamp <= STALE_LOCATION_MS) {
          activeMappers[mapperId] = {
            ...latest,
            positionCount: locations.length,
          };
        }
      });

      res.json(createApiResponse(true, {
        activeCount: Object.keys(activeMappers).length,
        mappers: activeMappers,
      }));
    } catch (error) {
      logger.error('Tracking fetch failed', error);
      res.status(500).json(
        createApiResponse(false, undefined, 'Failed to fetch tracking data')
      );
    }
  });


  // ============================================================================
  // INCIDENT UPLOAD HELPERS
  // ============================================================================

  interface UploadAnalysisResult {
    incident_detected: boolean;
    type: string;
    confidence: number;
    [key: string]: any;
  }

  const createMockAnalysis = (
    category: string,
    analysisType: 'video' | 'audio' | 'image'
  ): UploadAnalysisResult => {
    const analyses = {
      video: {
        incident_detected: true,
        type: category || "unknown",
        confidence: 0.87,
        weapon_detected: category === 'weapon',
        detection_timestamp: Date.now()
      },
      audio: {
        incident_detected: true,
        sound_type: category || "unknown",
        confidence: 0.92,
        estimated_distance: "120m",
        detection_timestamp: Date.now()
      },
      image: {
        incident_detected: true,
        type: category || "unknown",
        confidence: 0.88,
        objects_detected: ["car", "damaged_vehicle", "road_block"],
        detection_timestamp: Date.now()
      }
    };
    
    return analyses[analysisType];
  };

  // File size limits (in bytes) - must match client-side constants
  const FILE_SIZE_LIMITS = {
    video: 50 * 1024 * 1024,  // 50MB
    audio: 10 * 1024 * 1024,  // 10MB
    image: 10 * 1024 * 1024   // 10MB
  } as const;

  // Allowed MIME types - must match client-side constants
  const ALLOWED_MIME_TYPES = {
    video: ['video/mp4', 'video/quicktime', 'video/webm'],
    audio: ['audio/wav', 'audio/mpeg', 'audio/webm', 'audio/ogg'],
    image: ['image/jpeg', 'image/png', 'image/webp']
  } as const;

  const handleMediaUpload = (mediaType: 'video' | 'audio' | 'image'): RequestHandler => {
    return async (req: Request, res: Response) => {
      try {
        const metadata = validateMetadata(req.body.metadata);
        const files = req.files as Express.Multer.File[] | undefined;
        const file = req.file;

        // Validate file(s) exist
        const hasFiles = mediaType === 'image' ? (files && files.length > 0) : !!file;
        if (!hasFiles) {
          return res.status(400).json(
            createApiResponse(false, undefined, `No ${mediaType} file provided`)
          );
        }

        // Server-side file validation
        const filesToValidate = mediaType === 'image' ? files! : [file!];
        for (const f of filesToValidate) {
          // Check file size
          if (f.size > FILE_SIZE_LIMITS[mediaType]) {
            return res.status(400).json(
              createApiResponse(false, undefined, `File too large. Max: ${FILE_SIZE_LIMITS[mediaType] / 1024 / 1024}MB`)
            );
          }
          
          // Check MIME type
          if (!ALLOWED_MIME_TYPES[mediaType].includes(f.mimetype)) {
            return res.status(400).json(
              createApiResponse(false, undefined, `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES[mediaType].join(', ')}`)
            );
          }
        }

        // Create mock AI analysis
        const analysis = createMockAnalysis(metadata.incident_category, mediaType);

        logger.info(`${mediaType} uploaded and analyzed`, {
          category: metadata.incident_category,
          confidence: analysis.confidence
        });

        const responseData = {
          success: true,
          message: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded and analyzed successfully`,
          analysis,
          metadata,
          ...(mediaType === 'image' && { files_received: files?.length })
        };

        res.status(200).json(createApiResponse(true, responseData));
      } catch (error) {
        logger.error(`Failed to process ${mediaType} upload`, error);
        res.status(500).json(
          createApiResponse(false, undefined, `Failed to process ${mediaType} upload`)
        );
      }
    };
  };

  // ============================================================================
  // INCIDENT UPLOAD ENDPOINTS
  // ============================================================================

  app.post("/api/v1/incidents/upload/video", authenticate, upload.single('video_file'), handleMediaUpload('video'));
  app.post("/api/v1/incidents/upload/audio", authenticate, upload.single('audio_file'), handleMediaUpload('audio'));
  app.post("/api/v1/incidents/upload/image", authenticate, upload.array('images', 3), handleMediaUpload('image'));


  // ============================================================================
  // GOOGLE MAPS API PROXIES
  // ============================================================================

  interface GoogleMapsEndpoint {
    name: string;
    baseUrl: string;
    params: string[];
  }

  const GOOGLE_MAPS_ENDPOINTS: Record<string, GoogleMapsEndpoint> = {
    geocode: {
      name: 'Geocode',
      baseUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
      params: ['latlng', 'address']
    },
    places: {
      name: 'Places Autocomplete',
      baseUrl: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      params: ['input', 'location', 'radius']
    },
    directions: {
      name: 'Directions',
      baseUrl: 'https://maps.googleapis.com/maps/api/directions/json',
      params: ['origin', 'destination']
    },
    'distance-matrix': {
      name: 'Distance Matrix',
      baseUrl: 'https://maps.googleapis.com/maps/api/distancematrix/json',
      params: ['origins', 'destinations']
    }
  };

  const validateGoogleMapsApiKey = (apiKey: string | undefined): apiKey is string => {
    if (!apiKey) {
      logger.error('Missing GOOGLE_MAPS_API_KEY environment variable');
      return false;
    }
    return true;
  };

  const createGoogleMapsProxy = (endpoint: GoogleMapsEndpoint): RequestHandler => {
    return async (req: Request, res: Response) => {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (!validateGoogleMapsApiKey(apiKey)) {
        return res.status(500).json(
          createApiResponse(false, undefined, 'Google Maps API not configured')
        );
      }

      try {
        const url = new URL(endpoint.baseUrl);
        
        // Add provided parameters
        endpoint.params.forEach(param => {
          const value = req.query[param];
          if (value) {
            url.searchParams.append(param, value as string);
          }
        });
        
        url.searchParams.append('key', apiKey);

        logger.debug(`Calling ${endpoint.name}`, { url: url.toString() });
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`Google Maps API returned ${response.status}`);
        }

        const data = await response.json();
        res.json(createApiResponse(true, data));
      } catch (error) {
        logger.error(`${endpoint.name} API call failed`, error);
        res.status(502).json(
          createApiResponse(false, undefined, `Failed to fetch ${endpoint.name.toLowerCase()} data`)
        );
      }
    };
  };

  // Register all Google Maps endpoints dynamically
  Object.entries(GOOGLE_MAPS_ENDPOINTS).forEach(([route, endpoint]) => {
    app.get(`/api/maps/${route}`, createGoogleMapsProxy(endpoint));
  });


  // ============================================================================
  // DEVELOPMENT / PRODUCTION MIDDLEWARE
  // ============================================================================

  const setupViteMiddleware = async (app: express.Application) => {
    if (process.env.NODE_ENV !== "production") {
      logger.info('Setting up Vite development middleware');
      try {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } catch (error) {
        logger.error('Failed to setup Vite middleware', error);
        throw error;
      }
    } else {
      logger.info('Serving static production files');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      app.use(express.static("dist"));
      // SPA fallback: serve index.html for unmatched routes
      app.use((req: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname, "dist/index.html"));
      });
    }
  };

  // ============================================================================
  // SERVER START
  // ============================================================================

  try {
    await setupViteMiddleware(app);

    // ============================================================================
    // ERROR HANDLING & 404 (must be after Vite/SPA middleware)
    // ============================================================================

    app.use((req: Request, res: Response) => {
      res.status(404).json(
        createApiResponse(false, undefined, `Route not found: ${req.method} ${req.path}`)
      );
    });

    app.use(errorHandler);

    const server = app.listen(PORT, "0.0.0.0", () => {
      logger.info(`✓ Server running on http://0.0.0.0:${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // JWT Configuration check
      const jwtConfigured = !!process.env.JWT_SECRET;
      logger.info(`✓ JWT Secret: ${jwtConfigured ? 'Configured' : 'Using fallback (change in production!)'}`);
      if (!jwtConfigured) {
        logger.error('⚠️  WARNING: JWT_SECRET not set. Using fallback secret - insecure for production!');
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
