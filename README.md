# Safety Map Africa - Grid Node v2.5

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-yellow)](https://vitejs.dev/)

A decentralized situational awareness network that transforms citizens and drivers into "Sentry Nodes" for urban safety monitoring, powered by AI-driven predictive analytics and community verification.

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [🎯 Mission](#-mission)
- [🚀 Key Features](#-key-features)
- [🔄 How It Works](#-how-it-works)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🧠 AI Integration](#-ai-integration)
- [📦 Getting Started](#-getting-started)
- [📡 Incident Upload Configuration](#-incident-upload-configuration)
- [🔗 API Endpoints](#-api-endpoints)
- [🔒 Environment Variables](#-environment-variables)
- [📜 License](#-license)

## 🌟 Overview

**Safety Map Africa** is a high-fidelity, decentralized situational awareness network designed to enhance urban security and mobility through collective intelligence. It transforms ordinary citizens and drivers into "Sentry Nodes" that contribute real-time visual and acoustic data to a unified safety grid. By leveraging state-of-the-art multi-modal AI (Gemini 3), the platform identifies hazards, predicts risk escalations, and verifies the authenticity of incident reports, creating a transparent and incentivized safety ecosystem.

## 🎯 Mission

Our mission is to democratize urban safety data. In many rapidly growing urban environments, traditional security infrastructure is sparse or reactive. Safety Map Africa provides a proactive, community-driven alternative that:

- **Empowers Communities:** Allows residents to actively participate in their own security
- **Predicts Volatility:** Uses AI to identify behavioral precursors to incidents before they escalate
- **Incentivizes Truth:** Rewards high-fidelity, verified data with a native tokenized yield (RGT)
- **Ensures Integrity:** Combats misinformation and deepfakes through rigorous forensic auditing

## 🚀 Key Features

### Predictive Grid Intelligence (Driver Portal)
- **Oracle Mode:** Transforms mobile devices into tactical sensors
- **Multi-Modal Analysis:** Continuously audits 3-second video/audio buffers for weapons, erratic driving, and crowd anomalies
- **Predictive Risk Vectors:** Calculates the probability of escalation and projects likely outcomes in 15-30 second windows

### Forensic Incident Audit (Upload Portal)
- **6-Point Verification:** A secure gateway for evidence submission that audits pixel integrity, metadata consistency, and contextual landmarks
- **Deepfake Detection:** Identifies synthetic or manipulated content to prevent the spread of misinformation
- **Intelligence Summaries:** Generates tactical summaries of events for rapid situational assessment

### Live Command Map (MapView)
- **Real-Time Tracking:** Monitors the live positions of "Mapper Nodes" (drivers) with 15-second update cycles
- **ETA & Routing:** Displays estimated arrival times and routing telemetry for active units
- **Situational HUD:** Provides a comprehensive dashboard for auditing live alerts and forensic reports

### Tokenized Yield (RGT)
- **Proof of Perspective:** Users earn "RGT" tokens based on the quality, rarity, and verification score of the data they contribute
- **Multiplier Mechanics:** Higher trust ranks (e.g., "Oracle" or "Elite") unlock yield multipliers for consistent, high-fidelity reporting

## 🔄 How It Works

1. **Deployment:** A driver mounts their phone and activates the "Behavior Sentry" in the Driver Portal
2. **Sensing:** The device captures ambient visual and acoustic data, processed in small, anonymized segments
3. **Analysis:** The Gemini AI engine performs a "Pulse Audit," identifying hazards and predicting risk vectors
4. **Reporting:** High-severity anomalies are broadcast to the Global Command Map
5. **Verification:** Other nodes or manual uploads provide cross-verification through the Forensic Audit portal
6. **Incentivization:** Verified contributions earn RGT tokens, improving the grid's predictive accuracy

## 🏗️ System Architecture

```text
Mapper App ←Backend ←→ Google Maps APIs ←→ Driver App
     ↓              ↓                ↓              ↓
Live tracking   Route logic    Geocoding/       Navigation
ETA display     Fare calc      Directions/      Driver location
Heatmaps        Predictive     Distance Matrix  Traffic layers
Analytics       Intelligence   Places API       Real-time updates
```

### Google Maps API Integration

| API                     | Purpose                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Maps JavaScript API** | Interactive maps with custom styling, markers, and overlays                          |
| **Geocoding API**       | Converts GPS coordinates to street addresses; determines user location automatically |
| **Places API**          | Finds nearby points of interest; enables smart location search for destinations      |
| **Directions API**      | Provides turn-by-turn navigation for drivers; calculates optimal routes              |
| **Distance Matrix API** | Calculates ETAs and real-time travel distances; powers dynamic fare calculations     |
| **Traffic API**         | Real-time traffic data overlay for predictive routing                                |
| **Visualization API**   | Heatmap layers for grid intelligence zones and risk visualization                    |

### Enhanced Grid Intelligence Features

- **Real-Time Traffic Integration:** Live traffic data overlay for accurate route planning
- **Heatmap Visualization:** Dynamic heatmaps showing high-risk zones and activity patterns
- **Predictive Analytics:** Real-time updates of predictive accuracy, active vectors, and yield metrics
- **Custom Map Styling:** Dark theme optimized for tactical operations
- **Interactive Markers:** Custom SVG markers for data points and driver locations
- **Route Visualization:** Animated polylines showing active routes and patrol patterns

## 🛠️ Tech Stack

- **Frontend Framework:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (Custom high-tech/tactical UI design)
- **AI Integration:** `@google/genai` (Gemini 3 Flash Preview for multi-modal video/audio analysis)
- **Mapping:** Google Maps JavaScript API with custom styling, traffic layers, and heatmap visualization
- **Icons:** Lucide React
- **Backend:** Node.js, Express, Multer (for file uploads)

## 🧠 AI Integration

This project heavily utilizes the **Gemini API** for complex, multi-modal reasoning:

1. **Real-time Sentry Audits:** Captures 3-second video/audio buffers and prompts Gemini to act as a "Predictive Tactical Forensic AI", returning structured JSON containing detected hazards, anomalies, acoustic events, and predictive risk probabilities
2. **Evidence Verification:** Analyzes uploaded MP4/MOV files to perform deepfake probability checks, pixel integrity audits, and severity classifications

## 📦 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn package manager
- Google Gemini API Key
- Google Maps API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd safety-map-africa-grid-node-v2.5
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the `.env.example` file to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual keys.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## 📡 Incident Upload Configuration

The Mapper App supports three primary upload modes for incident reporting: **Video**, **Audio**, and **Image**. All modes share a core metadata layer but have specific constraints and AI pipelines.

### Video Incident Reporting
- **Format:** MP4 (H264 codec)
- **Duration:** 3s (min) to 20s (max)
- **Resolution:** 720p (preferred) / 1080p (max)
- **Max Size:** 50 MB
- **Endpoint:** `POST /api/v1/incidents/upload/video`
- **AI Pipeline:** Vision AI (Weapon detection, fire detection, crowd aggression, etc.)

### Audio Incident Reporting
- **Format:** WAV (PCM codec)
- **Duration:** 2s (min) to 15s (max)
- **Sample Rate:** 16000 Hz (Mono)
- **Max Size:** 10 MB
- **Endpoint:** `POST /api/v1/incidents/upload/audio`
- **AI Pipeline:** Audio AI (Gunshots, screams, explosions, etc.)

### Image Incident Reporting
- **Format:** JPEG / PNG
- **Max Images:** 3 per report
- **Max Size:** 10 MB per image
- **Resolution:** 1280x720 (recommended) / 1920x1080 (max)
- **Endpoint:** `POST /api/v1/incidents/upload/image`
- **AI Pipeline:** Vision Detection (Weapons, fire, vehicle collisions, damaged infrastructure, etc.)

### Core Metadata

Every upload attaches forensic metadata, including:
- `report_type` (video/audio/image)
- `incident_category`
- `node_id` & `device_id`
- `timestamp`
- `location` (lat/lng)
- Device signals (heading, speed, etc.)

## � Backend Mapper API

To support multiple mapper profiles and onboarding, the server exposes the following endpoints:

- `GET /api/mappers` – List all registered mappers (returns profiles without passkeys)
- `POST /api/mappers` – Create a new mapper profile during onboarding. Payload must include `alias`, `fullName`, `dob`, `phone`, `email`, `nationality`, `mobility`, `zone`, `bankName`, and `accountNumber`. Returns the new profile and the generated passkey
- `POST /api/mappers/login` – Authenticate using `{ alias, passkey }` (alias may be email). Returns the full profile on success

> **Note:** These endpoints currently store data in memory; replace with a persistent database in production.

## �🔒 Environment Variables

The application requires the following environment variables:

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key for running the forensic and predictive AI models
- `VITE_GOOGLE_MAPS_API_KEY`: Your Google Maps Platform API key for geocoding, places, directions, and distance matrix

## � Contributors

* **Otemade Balogun** – balogun.otemade@gmail.com

## �📜 License

Proprietary / Confidential.
