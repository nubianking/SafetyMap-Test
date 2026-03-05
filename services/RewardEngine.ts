
import { SentryTelemetry } from '../types/rewards';

export const calculateRGTWeight = (telemetry: SentryTelemetry): number => {
  const BASE_RATE = 0.05; // Base RGT per 15-second cycle
  
  // 1. Tier Multipliers
  const rankMultipliers = {
    Watcher: 1.0,
    Sentinel: 1.2,
    Oracle: 1.5,
    Apex: 2.0,
  };

  // 2. Contextual Bonuses
  let multiplier = rankMultipliers[telemetry.trustRank];
  
  if (telemetry.isInGrayZone) multiplier *= 1.3; // Coverage Mining bonus
  if (telemetry.isHighSeverityEvent) {
    multiplier *= telemetry.isFirstReporter ? 5.0 : 1.5; // Incentive for first-response
  }

  // 3. The Formula: (Base * Rank) * (AI Quality Score)
  const finalYield = (BASE_RATE * multiplier) * telemetry.geminiQualityScore;

  return Number(finalYield.toFixed(4));
};
