import express, { Request, Response, NextFunction, RequestHandler } from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import multer from "multer";

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

  // seed admin/test mapper
  mappers.push({
    id: 'mapper_admin',
    alias: 'Oba',
    passkey: 'Test2026',
    fullName: 'Oba Admin',
    dob: '1990-01-01',
    phone: '+2340000000000',
    email: 'oba@example.com',
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

  // list all mappers (for admin or debugging)
  app.get("/api/mappers", (req: Request, res: Response) => {
    res.json(createApiResponse(true, mappers.map(m => {
      const { passkey, ...safe } = m;
      return safe;
    })));
  });

  // create new mapper profile during onboarding
  app.post("/api/mappers", (req: Request, res: Response) => {
    try {
      const body = req.body;
      const required = ['alias','fullName','dob','phone','email','nationality','mobility','zone','bankName','accountNumber'];
      for (const field of required) {
        if (!body[field]) {
          return res.status(400).json(createApiResponse(false, undefined, `Missing field: ${field}`));
        }
      }

      const alias = body.alias.toString();
      if (mappers.find(m => m.alias === alias || m.email === alias)) {
        return res.status(409).json(createApiResponse(false, undefined, 'Alias or email already exists'));
      }

      const newProfile: MapperProfile = {
        id: `mapper_${Date.now()}`,
        alias,
        passkey: Math.random().toString(36).slice(2, 10),
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
      res.status(201).json(createApiResponse(true, { profile: safe, passkey: newProfile.passkey }));
    } catch (error) {
      logger.error('Mapper creation failed', error);
      res.status(500).json(createApiResponse(false, undefined, 'Failed to create mapper'));
    }
  });

  // login existing mapper
  app.post("/api/mappers/login", (req: Request, res: Response) => {
    try {
      const { alias, passkey } = req.body;
      if (!alias || !passkey) {
        return res.status(400).json(createApiResponse(false, undefined, 'Alias and passkey required'));
      }
      const found = mappers.find(m => (m.alias === alias || m.email === alias) && m.passkey === passkey);
      if (!found) {
        return res.status(401).json(createApiResponse(false, undefined, 'Invalid credentials'));
      }
      const safe = { ...found };
      delete (safe as any).passkey;
      res.json(createApiResponse(true, safe));
    } catch (error) {
      logger.error('Login error', error);
      res.status(500).json(createApiResponse(false, undefined, 'Login failed'));
    }
  });

  app.post("/api/alerts", (req: Request, res: Response) => {
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

  app.post("/api/v1/incidents/upload/video", upload.single('video_file'), handleMediaUpload('video'));
  app.post("/api/v1/incidents/upload/audio", upload.single('audio_file'), handleMediaUpload('audio'));
  app.post("/api/v1/incidents/upload/image", upload.array('images', 3), handleMediaUpload('image'));


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
      app.use(express.static("dist"));
    }
  };

  // ============================================================================
  // ERROR HANDLING & 404
  // ============================================================================

  app.use((req: Request, res: Response) => {
    res.status(404).json(
      createApiResponse(false, undefined, `Route not found: ${req.method} ${req.path}`)
    );
  });

  app.use(errorHandler);

  // ============================================================================
  // SERVER START
  // ============================================================================

  try {
    await setupViteMiddleware(app);

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
