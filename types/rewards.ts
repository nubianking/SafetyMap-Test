
export interface SentryTelemetry {
  trustRank: 'Watcher' | 'Sentinel' | 'Oracle' | 'Apex';
  geminiQualityScore: number; // 0.1 - 1.0 (from Multi-modal Analysis)
  isHighSeverityEvent: boolean;
  isFirstReporter: boolean;
  isInGrayZone: boolean;
}
