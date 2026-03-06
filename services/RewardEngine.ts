
// ============================================================================
// REWARD ENGINE - RGT Calculation & Reward Distribution
// ============================================================================

import { SentryTelemetry } from '../types/rewards';

/**
 * Reward Configuration Constants
 */
const REWARD_CONFIG = {
  BASE_RATE: 0.05, // Base RGT per 15-second cycle
  
  RANK_MULTIPLIERS: {
    Watcher: 1.0,
    Sentinel: 1.2,
    Oracle: 1.5,
    Apex: 2.0,
  } as const,

  CONTEXTUAL_BONUSES: {
    GRAY_ZONE: 1.3,      // Coverage Mining bonus
    HIGH_SEVERITY: 1.5,   // High severity event bonus
    FIRST_REPORTER: 5.0,  // First responder bonus
  } as const,

  // Quality thresholds
  MIN_QUALITY_SCORE: 0.0,
  MAX_QUALITY_SCORE: 1.0,
} as const;

type RankType = keyof typeof REWARD_CONFIG.RANK_MULTIPLIERS;

/**
 * Calculate RGT weight for a given sentry telemetry
 * Formula: (Base * Rank) * (AI Quality Score)
 *
 * @param telemetry - Sentry telemetry data
 * @returns Calculated RGT weight
 * @throws Error if telemetry is invalid
 */
export const calculateRGTWeight = (telemetry: SentryTelemetry): number => {
  validateTelemetry(telemetry);

  let multiplier = getRankMultiplier(telemetry.trustRank);

  // Apply contextual bonuses
  if (telemetry.isInGrayZone) {
    multiplier *= REWARD_CONFIG.CONTEXTUAL_BONUSES.GRAY_ZONE;
  }

  if (telemetry.isHighSeverityEvent) {
    const severityBonus = telemetry.isFirstReporter 
      ? REWARD_CONFIG.CONTEXTUAL_BONUSES.FIRST_REPORTER 
      : REWARD_CONFIG.CONTEXTUAL_BONUSES.HIGH_SEVERITY;
    
    multiplier *= severityBonus;
  }

  // Final calculation
  const finalYield = (REWARD_CONFIG.BASE_RATE * multiplier) * telemetry.geminiQualityScore;

  return Number(finalYield.toFixed(4));
};

/**
 * Get rank multiplier
 */
const getRankMultiplier = (rank: string): number => {
  const multiplier = REWARD_CONFIG.RANK_MULTIPLIERS[rank as RankType];
  
  if (multiplier === undefined) {
    console.warn(`[RewardEngine] Unknown rank: ${rank}, using Watcher multiplier`);
    return REWARD_CONFIG.RANK_MULTIPLIERS.Watcher;
  }
  
  return multiplier;
};

/**
 * Validate telemetry data
 */
const validateTelemetry = (telemetry: SentryTelemetry): void => {
  if (!telemetry) {
    throw new Error('Telemetry data is required');
  }

  if (typeof telemetry.geminiQualityScore !== 'number') {
    throw new Error('Quality score must be a number');
  }

  if (telemetry.geminiQualityScore < REWARD_CONFIG.MIN_QUALITY_SCORE || 
      telemetry.geminiQualityScore > REWARD_CONFIG.MAX_QUALITY_SCORE) {
    throw new Error(
      `Quality score must be between ${REWARD_CONFIG.MIN_QUALITY_SCORE} and ${REWARD_CONFIG.MAX_QUALITY_SCORE}`
    );
  }

  if (!telemetry.trustRank) {
    throw new Error('Trust rank is required');
  }
};

/**
 * Export reward engine as singleton
 */
export const RewardEngine = {
  calculateRGTWeight,
  getRankMultiplier,
  validateTelemetry,
  REWARD_CONFIG,
};
