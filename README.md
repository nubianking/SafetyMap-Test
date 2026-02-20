# Safety Map Africa - Grid Node v2.5

## 🌐 Application Overview

**Safety Map Africa** is a high-fidelity, decentralized situational awareness network designed to enhance urban security and mobility through collective intelligence. It transforms ordinary citizens and drivers into "Sentry Nodes" that contribute real-time visual and acoustic data to a unified safety grid. By leveraging state-of-the-art multi-modal AI (Gemini 3), the platform identifies hazards, predicts risk escalations, and verifies the authenticity of incident reports, creating a transparent and incentivized safety ecosystem.

## 🎯 Core Mission

Our mission is to democratize urban safety data. In many rapidly growing urban environments, traditional security infrastructure is sparse or reactive. Safety Map Africa provides a proactive, community-driven alternative that:
*   **Empowers Communities:** Allows residents to actively participate in their own security.
*   **Predicts Volatility:** Uses AI to identify behavioral precursors to incidents before they escalate.
*   **Incentivizes Truth:** Rewards high-fidelity, verified data with a native tokenized yield (RGT).
*   **Ensures Integrity:** Combats misinformation and deepfakes through rigorous forensic auditing.

## 🚀 Key Features

*   **Predictive Grid Intelligence (Driver Portal):** 
    *   **Oracle Mode:** Transforms mobile devices into tactical sensors.
    *   **Multi-Modal Analysis:** Continuously audits 3-second video/audio buffers for weapons, erratic driving, and crowd anomalies.
    *   **Predictive Risk Vectors:** Calculates the probability of escalation and projects likely outcomes in 15-30 second windows.
*   **Forensic Incident Audit (Upload Portal):** 
    *   **6-Point Verification:** A secure gateway for evidence submission that audits pixel integrity, metadata consistency, and contextual landmarks.
    *   **Deepfake Detection:** Identifies synthetic or manipulated content to prevent the spread of misinformation.
    *   **Intelligence Summaries:** Generates tactical summaries of events for rapid situational assessment.
*   **Live Command Map (MapView):** 
    *   **Real-Time Tracking:** Monitors the live positions of "Mapper Nodes" (drivers) with 15-second update cycles.
    *   **ETA & Routing:** Displays estimated arrival times and routing telemetry for active units.
    *   **Situational HUD:** Provides a comprehensive dashboard for auditing live alerts and forensic reports.
*   **Tokenized Yield (RGT):** 
    *   **Proof of Perspective:** Users earn "RGT" tokens based on the quality, rarity, and verification score of the data they contribute.
    *   **Multiplier Mechanics:** Higher trust ranks (e.g., "Oracle" or "Elite") unlock yield multipliers for consistent, high-fidelity reporting.

## 🔄 How It Works

1.  **Deployment:** A driver mounts their phone and activates the "Behavior Sentry" in the Driver Portal.
2.  **Sensing:** The device captures ambient visual and acoustic data, which is processed in small, anonymized segments.
3.  **Analysis:** The Gemini AI engine performs a "Pulse Audit," identifying hazards and predicting risk vectors.
4.  **Reporting:** If a high-severity anomaly is detected, it is broadcast to the Global Command Map.
5.  **Verification:** Other nodes or manual uploads provide cross-verification. The Forensic Audit portal ensures the evidence is authentic.
6.  **Incentivization:** Once verified, the contributing nodes receive RGT tokens, and the grid's predictive accuracy improves.

## 🛠️ Tech Stack

*   **Frontend Framework:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS (Custom high-tech/tactical UI design)
*   **AI Integration:** `@google/genai` (Gemini 3 Flash Preview for multi-modal video/audio analysis)
*   **Mapping:** Leaflet (`react-leaflet` / vanilla Leaflet integration)
*   **Icons:** Lucide React

## 🧠 AI Integration

This project heavily utilizes the **Gemini API** for complex, multi-modal reasoning:
1.  **Real-time Sentry Audits:** Captures 3-second video/audio buffers and prompts Gemini to act as a "Predictive Tactical Forensic AI", returning structured JSON containing detected hazards, anomalies, acoustic events, and predictive risk probabilities.
2.  **Evidence Verification:** Analyzes uploaded MP4/MOV files to perform deepfake probability checks, pixel integrity audits, and severity classifications.

## 📦 Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   A Google Gemini API Key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   Copy the `.env.example` file to `.env.local` and add your Gemini API key.
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔒 Environment Variables

The application requires the following environment variables to function properly:

*   `GEMINI_API_KEY`: Your Google Gemini API key for running the forensic and predictive AI models.

## 📜 License

Proprietary / Confidential.
