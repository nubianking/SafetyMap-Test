
export enum ReportType {
  SECURITY = 'SECURITY',
  TRAFFIC = 'TRAFFIC',
  ROAD_BLOCK = 'ROAD_BLOCK',
  ACCIDENT = 'ACCIDENT',
  POLICE_CHECK = 'POLICE_CHECK'
}

export interface VerificationScore {
  objectConfidence: number;      // 30%
  deepfakeScore: number;         // 25% (Inverted: 100 - prob)
  metadataValidity: number;      // 20%
  locationMatch: number;         // 15%
  audioCorrelation: number;      // 10%
  aggregate: number;             // Total 0-100
}

export interface ForensicMetadata {
  integrityScore: number; 
  isSynthetic: boolean; 
  synthIdDetected: boolean; 
  c2paVerified: boolean; 
  deepfakeProbability: number;
  tamperingDetected: boolean;
  fraudRiskIndex: number; 
  forensicNotes: string;
}

export interface TechnicalTelemetry {
  mediaHash: string;
  deviceId: string;
  gpsPrecision: number;
  gyroValidation: boolean;
  uploadLatency: number;
  timestampValid: boolean;
  gpsValid: boolean;
  encryptionProtocol: string; // e.g., TLS 1.3
}

export interface AudioEvent {
  label: string;
  confidence: number;
  timestampOffset: number;
}

export interface Anomaly {
  type: string;
  description: string;
  confidence: number;
}

export interface LiveAlert {
  id: string;
  label: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    lat: number;
    lng: number;
  };
  timestamp: number;
  forensics: ForensicMetadata;
  telemetry: TechnicalTelemetry;
  verificationScore: VerificationScore;
  audioEvents: AudioEvent[];
  detectedObjects: string[];
  anomalies?: Anomaly[];
  temporalTrend?: 'STABILIZING' | 'ESCALATING' | 'FLUCTUATING' | 'STATIC';
  predictiveRisk?: {
    probability: number;
    timeframe: string;
    projectedOutcome: string;
  };
  riskVectors?: {
    type: string;
    magnitude: number;
  }[];
  boundingBoxes: number[][];
  timeRange?: string; 
  emergencyResponse?: string;
  crowdPanicLevel?: number; // 0-1
}

export interface IncidentReport {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  hasFootage: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  verificationScore?: VerificationScore;
  forensics?: ForensicMetadata;
  emergencyLevel?: string;
  intelligenceSummary?: string;
}

// ============================================================================
// REAL-TIME TRACKING TYPES
// ============================================================================

export interface LocationUpdate {
  lat: number;
  lng: number;
  speed: number;        // km/h
  heading: number | null;
  accuracy: number;     // meters
  timestamp: number;    // epoch ms
  mapperId?: string;
}

export interface TrackingState {
  isTracking: boolean;
  currentLocation: { lat: number; lng: number } | null;
  speed: number;          // km/h
  heading: number | null;
  updateInterval: number; // ms — current adaptive interval
  locationBuffer: LocationUpdate[];
}
