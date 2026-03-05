import { useState, useEffect, useCallback } from 'react';
import { calculateRGTWeight } from '../services/RewardEngine';
import { SentryTelemetry } from '../types/rewards';

export const useSentryRewards = (currentTelemetry: SentryTelemetry) => {
  const [sessionTotal, setSessionTotal] = useState<number>(0);
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const processPulse = useCallback(() => {
    setIsSyncing(true);
    
    // Calculate yield for the current 15-second window
    const pulseYield = calculateRGTWeight(currentTelemetry);
    
    // Simulate a brief delay for Gemini Forensic Audit verification
    setTimeout(() => {
      setSessionTotal((prev) => prev + pulseYield);
      setCurrentRate(pulseYield);
      setIsSyncing(false);
    }, 1200);
  }, [currentTelemetry]);

  useEffect(() => {
    // Sync with the Live Command Map's 15-second heartbeat
    const interval = setInterval(processPulse, 15000);
    return () => clearInterval(interval);
  }, [processPulse]);

  return { sessionTotal, currentRate, isSyncing };
};
