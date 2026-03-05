import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // In-memory store for alerts
  let alerts: any[] = [];

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/alerts", (req, res) => {
    res.json(alerts);
  });

  app.post("/api/alerts", (req, res) => {
    const newAlert = req.body;
    alerts = [newAlert, ...alerts].slice(0, 50); // Keep last 50 alerts
    res.status(201).json(newAlert);
  });

  // Incident Upload Proxies
  app.post("/api/v1/incidents/upload/video", upload.single('video_file'), (req, res) => {
    try {
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No video file provided" });
      }

      // In a real app, upload to S3/GCS here and run AI analysis
      // For now, mock the AI response
      const mockAnalysis = {
        incident_detected: true,
        type: metadata.incident_category || "unknown",
        confidence: 0.87,
        weapon_detected: metadata.incident_category === 'weapon'
      };

      res.status(200).json({
        success: true,
        message: "Video uploaded and analyzed successfully",
        analysis: mockAnalysis,
        metadata
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process video upload" });
    }
  });

  app.post("/api/v1/incidents/upload/audio", upload.single('audio_file'), (req, res) => {
    try {
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      // In a real app, upload to S3/GCS here and run AI analysis
      // For now, mock the AI response
      const mockAnalysis = {
        incident_detected: true,
        sound_type: metadata.incident_category || "unknown",
        confidence: 0.92,
        estimated_distance: "120m"
      };

      res.status(200).json({
        success: true,
        message: "Audio uploaded and analyzed successfully",
        analysis: mockAnalysis,
        metadata
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process audio upload" });
    }
  });

  app.post("/api/v1/incidents/upload/image", upload.array('images', 3), (req, res) => {
    try {
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No image files provided" });
      }

      // In a real app, upload to S3/GCS here and run AI analysis
      // For now, mock the AI response
      const mockAnalysis = {
        incident_detected: true,
        type: metadata.incident_category || "unknown",
        confidence: 0.88,
        objects_detected: ["car", "damaged_vehicle", "road_block"]
      };

      res.status(200).json({
        success: true,
        message: "Images uploaded and analyzed successfully",
        analysis: mockAnalysis,
        metadata,
        files_received: files.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process image upload" });
    }
  });

  // Google Maps API Proxies
  app.get("/api/maps/geocode", async (req, res) => {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });
    
    const { latlng, address } = req.query;
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      if (latlng) url.searchParams.append("latlng", latlng as string);
      if (address) url.searchParams.append("address", address as string);
      url.searchParams.append("key", GOOGLE_MAPS_API_KEY);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch geocode data" });
    }
  });

  app.get("/api/maps/places", async (req, res) => {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });
    
    const { input, location, radius } = req.query;
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
      if (input) url.searchParams.append("input", input as string);
      if (location) url.searchParams.append("location", location as string);
      if (radius) url.searchParams.append("radius", radius as string);
      url.searchParams.append("key", GOOGLE_MAPS_API_KEY);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch places data" });
    }
  });

  app.get("/api/maps/directions", async (req, res) => {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });
    
    const { origin, destination } = req.query;
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
      if (origin) url.searchParams.append("origin", origin as string);
      if (destination) url.searchParams.append("destination", destination as string);
      url.searchParams.append("key", GOOGLE_MAPS_API_KEY);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch directions data" });
    }
  });

  app.get("/api/maps/distance-matrix", async (req, res) => {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_MAPS_API_KEY) return res.status(500).json({ error: "Missing GOOGLE_MAPS_API_KEY" });
    
    const { origins, destinations } = req.query;
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
      if (origins) url.searchParams.append("origins", origins as string);
      if (destinations) url.searchParams.append("destinations", destinations as string);
      url.searchParams.append("key", GOOGLE_MAPS_API_KEY);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch distance matrix data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built static files
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
