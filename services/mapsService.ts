// ============================================================================
// MAPS SERVICE - Google Maps API Client with Route Caching
// ============================================================================

import { routeCache } from './routeCache';

interface FetchOptions {
  [key: string]: string | undefined;
}

interface CacheFetchOptions {
  /** Enable caching for this request (default: true) */
  cache?: boolean;
}

class MapsService {
  private baseUrl = '/api/maps';

  /**
   * Build query string from parameters, excluding undefined values
   */
  private buildQueryString(params: FetchOptions): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  }

  /**
   * Generic fetch wrapper with caching and offline fallback.
   *
   * Flow:
   *  1. Check cache → hit? return immediately
   *  2. Miss → fetch from API → store in cache → return
   *  3. Network error → try stale cache (even if TTL expired) → throw if nothing
   */
  private async fetch<T = any>(
    endpoint: string,
    params: FetchOptions,
    options: CacheFetchOptions = {},
  ): Promise<T> {
    const { cache: cacheEnabled = true } = options;
    const cacheKey = cacheEnabled ? routeCache.buildKey(endpoint, params) : '';

    // --- 1. Cache hit --------------------------------------------------------
    if (cacheEnabled) {
      const cached = routeCache.get<T>(cacheKey);
      if (cached !== null) {
        console.debug(`[MapsService] Cache HIT for ${endpoint}`);
        return cached;
      }
    }

    // --- 2. Network fetch ----------------------------------------------------
    const queryString = this.buildQueryString(params);
    const url = `${this.baseUrl}/${endpoint}${queryString ? '?' + queryString : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Unknown error');
      }

      const data = json.data as T;

      // Store in cache
      if (cacheEnabled) {
        routeCache.set(cacheKey, data);
        console.debug(`[MapsService] Cached ${endpoint} response`);
      }

      return data;
    } catch (error) {
      // --- 3. Offline fallback — return stale cache if available --------------
      if (cacheEnabled) {
        const stale = routeCache.get<T>(cacheKey, true); // allowStale
        if (stale !== null) {
          console.warn(`[MapsService] Network failed for ${endpoint}, using stale cache`);
          return stale;
        }
      }

      console.error(`[MapsService] Error calling ${endpoint}:`, error);
      throw new Error(
        `Failed to fetch ${endpoint} data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Geocode coordinates to address or vice versa
   */
  async geocode(options: { latlng?: string; address?: string }): Promise<any> {
    return this.fetch('geocode', options);
  }

  /**
   * Get place autocomplete suggestions (NOT cached — results change rapidly)
   */
  async getPlaces(options: { input: string; location?: string; radius?: string }): Promise<any> {
    return this.fetch('places', options, { cache: false });
  }

  /**
   * Get directions between two locations
   */
  async getDirections(options: { origin: string; destination: string }): Promise<any> {
    return this.fetch('directions', options);
  }

  /**
   * Get distance matrix between multiple origins and destinations
   */
  async getDistanceMatrix(options: { origins: string; destinations: string }): Promise<any> {
    return this.fetch('distance-matrix', options);
  }

  /**
   * Clear all cached route data (useful for debugging / settings UI)
   */
  clearCache(): void {
    routeCache.clear();
  }
}

export const mapsService = new MapsService();
