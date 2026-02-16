
import React from 'react';
import { Shield, AlertTriangle, MapPin, Radio, TrendingUp, User, Navigation, LayoutGrid, Github, BookOpen, Search, Plus, Eye, Zap, Flame, Scan, Activity, Fingerprint, Cpu } from 'lucide-react';

export const HAZARD_TYPES = {
  WEAPON: { label: 'WEAPON DETECTED', color: 'text-red-500', icon: Shield, severityKey: 'Threat Level' },
  FIRE: { label: 'SMOKE/FIRE', color: 'text-orange-500', icon: Flame, severityKey: 'Heat Intensity' },
  CROWD: { label: 'AGGRESSIVE CROWD', color: 'text-yellow-500', icon: User, severityKey: 'Aggression' },
  POLICE: { label: 'SECURITY CHECK', color: 'text-blue-500', icon: Shield, severityKey: 'Strictness' },
  DEEPFAKE: { label: 'SYNTHETIC CONTENT', color: 'text-purple-500', icon: Cpu, severityKey: 'Manipulation Probability' },
};

export const MOCK_INCIDENTS = [
  {
    id: '1',
    type: 'SECURITY',
    title: 'AI Alert: Weapon Detected',
    description: 'Object detection model triggered by bike-node 0492 near Sabo.',
    timestamp: 'LIVE',
    location: { lat: 6.5157, lng: 3.3742, city: 'Lagos' },
    hasFootage: true,
    severity: 'high',
    confidence: 0.94,
    forensics: {
      integrityScore: 98,
      isSynthetic: false,
      synthIdDetected: false,
      c2paVerified: true,
      fraudRiskIndex: 2,
      forensicNotes: "Authentic mobile capture. No digital artifact detected."
    }
  },
  {
    id: '2',
    type: 'TRAFFIC',
    title: 'Danfo Persistence Reward',
    description: 'Route 44 verified by 12 active Danfo nodes.',
    timestamp: '13 JAN, 03:29',
    location: { lat: 6.5244, lng: 3.3792, city: 'Lagos' },
    hasFootage: false,
    severity: 'low',
    confidence: 0.99,
    forensics: {
      integrityScore: 100,
      isSynthetic: false,
      synthIdDetected: false,
      c2paVerified: true,
      fraudRiskIndex: 0,
      forensicNotes: "High confidence route data."
    }
  }
];

export const ICONS = {
  Shield,
  AlertTriangle,
  MapPin,
  Radio,
  TrendingUp,
  User,
  Navigation,
  LayoutGrid,
  Github,
  BookOpen,
  Search,
  Plus,
  Eye,
  Zap,
  Flame,
  Scan,
  Activity,
  Fingerprint,
  Cpu
};
