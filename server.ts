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
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_me';
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
  user?: { mapperId: string; alias: string };
}

const authenticate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Expected: "Bearer <token>"

  if (!token) {
    return res.status(401).json(
      createApiResponse(false, undefined, 'Authentication required. No token provided.')
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { mapperId: string; alias: string };
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json(
      createApiResponse(false, undefined, 'Invalid or expired token.')
    );
  }
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
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

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

      // Sign JWT token
      const token = jwt.sign(
        { mapperId: found.id, alias: found.alias },
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
