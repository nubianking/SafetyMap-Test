// ============================================================================
// useLocationTracker — Adaptive Speed-Based Real-Time Location Tracking
// ============================================================================
//
// Dynamically varies the server-push interval based on the mapper's current
// speed.  Uses Haversine distance between consecutive readings to compute
// speed when the native Geolocation `coords.speed` is unavailable.

import { useState, useEffect, useRef, useCallback } from 'react';
import { LocationUpdate, TrackingState } from '../types';

// ---- Adaptive interval tiers ------------------------------------------------

/**
 * Returns the optimal server-push interval (ms) for the given speed (km/h).
 *
 *  > 60 km/h  →  5 s   (highway — high-precision tracking)
 *  > 30 km/h  → 10 s   (city driving)
 *  > 5  km/h  → 15 s   (walking / slow movement)
 *  ≤ 5  km/h  → 30 s   (stationary / idle)
 */
export const getUpdateInterval = (speed: number): number => {
  if (speed > 60) return 5000;
  if (speed > 30) return 10000;
  if (speed > 5)  return 15000;
  return 30000;
};

// ---- Haversine helper -------------------------------------------------------

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Returns distance in **kilometres** between two lat/lng points.
 */
const haversineDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ---- Buffer / batch settings ------------------------------------------------

const MAX_BUFFER_SIZE = 20;          // flush when the buffer hits this size
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// ---- Hook -------------------------------------------------------------------

interface UseLocationTrackerOptions {
  /** Start tracking immediately on mount. Default: false */
  autoStart?: boolean;
  /** Auth token for server pushes */
  authToken?: string | null;
}

export interface UseLocationTrackerReturn extends TrackingState {
  start: () => void;
  stop: () => void;
}

export function useLocationTracker(
  options: UseLocationTrackerOptions = {},
): UseLocationTrackerReturn {
  const { autoStart = false, authToken = null } = options;

  // ---- state ----------------------------------------------------------------
  const [state, setState] = useState<TrackingState>({
    isTracking: false,
    currentLocation: null,
    speed: 0,
    heading: null,
    updateInterval: 30000,
    locationBuffer: [],
  });

  // refs that persist across renders without triggering re-renders
  const watchIdRef = useRef<number | null>(null);
  const pushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const bufferRef = useRef<LocationUpdate[]>([]);
  const intervalRef = useRef<number>(30000);

  // ---- flush buffer to server -----------------------------------------------
  const flushBuffer = useCallback(async () => {
    if (bufferRef.current.length === 0) return;

    const payload = [...bufferRef.current];
    bufferRef.current = [];

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/tracking/location', {
        method: 'POST',
        headers,
        body: JSON.stringify({ locations: payload }),
      });

      if (!res.ok) {
        // Put the locations back so they aren't lost
        bufferRef.current = [...payload, ...bufferRef.current];
        console.warn('[Tracker] Server push failed, re-buffered', res.status);
      }
    } catch (err) {
      bufferRef.current = [...payload, ...bufferRef.current];
      console.warn('[Tracker] Server push error, re-buffered', err);
    }
  }, [authToken]);

  // ---- restart the push timer when the interval changes ---------------------
  const resetPushTimer = useCallback((newInterval: number) => {
    if (pushTimerRef.current) clearInterval(pushTimerRef.current);
    pushTimerRef.current = setInterval(flushBuffer, newInterval);
    intervalRef.current = newInterval;
  }, [flushBuffer]);

  // ---- Geolocation position handler -----------------------------------------
  const onPosition = useCallback((pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, speed: nativeSpeed, heading, accuracy } = pos.coords;
    const now = pos.timestamp;

    // --- compute speed -------------------------------------------------------
    let computedSpeed = 0;

    if (nativeSpeed != null && nativeSpeed >= 0) {
      // Native speed is in m/s → convert to km/h
      computedSpeed = nativeSpeed * 3.6;
    } else if (lastPositionRef.current) {
      // Fallback: Haversine between last two readings
      const prev = lastPositionRef.current;
      const dtHours = (now - prev.time) / 3_600_000;
      if (dtHours > 0) {
        const distKm = haversineDistance(prev.lat, prev.lng, lat, lng);
        computedSpeed = distKm / dtHours;
      }
    }

    // Clamp unrealistic speeds (GPS jitter can produce spikes)
    if (computedSpeed > 300) computedSpeed = 0;

    lastPositionRef.current = { lat, lng, time: now };

    // --- adaptive interval ---------------------------------------------------
    const newInterval = getUpdateInterval(computedSpeed);

    // Only restart the timer when the tier actually changes
    if (newInterval !== intervalRef.current) {
      resetPushTimer(newInterval);
    }

    // --- buffer the update ----------------------------------------------------
    const update: LocationUpdate = {
      lat,
      lng,
      speed: Math.round(computedSpeed * 10) / 10, // 1 decimal
      heading: heading ?? null,
      accuracy,
      timestamp: now,
    };

    bufferRef.current.push(update);

    // Auto-flush if the buffer is full
    if (bufferRef.current.length >= MAX_BUFFER_SIZE) {
      flushBuffer();
    }

    // --- update React state ---------------------------------------------------
    setState(prev => ({
      ...prev,
      currentLocation: { lat, lng },
      speed: update.speed,
      heading: update.heading,
      updateInterval: newInterval,
      locationBuffer: [...bufferRef.current],
    }));
  }, [flushBuffer, resetPushTimer]);

  // ---- start / stop ---------------------------------------------------------
  const start = useCallback(() => {
    if (watchIdRef.current != null) return; // already tracking

    if (!navigator.geolocation) {
      console.error('[Tracker] Geolocation API not available');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      onPosition,
      (err) => console.error('[Tracker] Geolocation error', err),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );

    watchIdRef.current = id;
    resetPushTimer(intervalRef.current);

    setState(prev => ({ ...prev, isTracking: true }));
  }, [onPosition, resetPushTimer]);

  const stop = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (pushTimerRef.current) {
      clearInterval(pushTimerRef.current);
      pushTimerRef.current = null;
    }

    // Flush any remaining buffered updates
    flushBuffer();

    setState(prev => ({ ...prev, isTracking: false }));
  }, [flushBuffer]);

  // ---- auto-start -----------------------------------------------------------
  useEffect(() => {
    if (autoStart) start();
    return () => stop();
  }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, start, stop };
}
