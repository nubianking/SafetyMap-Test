// ============================================================================
// MAPS SERVICE - Google Maps API Client
// ============================================================================

interface FetchOptions {
  [key: string]: string | undefined;
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
   * Generic fetch wrapper with error handling
   */
  private async fetch<T = any>(endpoint: string, params: FetchOptions): Promise<T> {
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
      
      return json.data as T;
    } catch (error) {
      console.error(`[MapsService] Error calling ${endpoint}:`, error);
      throw new Error(`Failed to fetch ${endpoint} data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Geocode coordinates to address or vice versa
   */
  async geocode(options: { latlng?: string; address?: string }): Promise<any> {
    return this.fetch('geocode', options);
  }

  /**
   * Get place autocomplete suggestions
   */
  async getPlaces(options: { input: string; location?: string; radius?: string }): Promise<any> {
    return this.fetch('places', options);
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
}

export const mapsService = new MapsService();
