export const mapsService = {
  async geocode(latlng?: string, address?: string) {
    const params = new URLSearchParams();
    if (latlng) params.append('latlng', latlng);
    if (address) params.append('address', address);
    
    const response = await fetch(`/api/maps/geocode?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch geocode data');
    return response.json();
  },

  async getPlaces(input: string, location?: string, radius?: string) {
    const params = new URLSearchParams();
    params.append('input', input);
    if (location) params.append('location', location);
    if (radius) params.append('radius', radius);
    
    const response = await fetch(`/api/maps/places?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch places data');
    return response.json();
  },

  async getDirections(origin: string, destination: string) {
    const params = new URLSearchParams();
    params.append('origin', origin);
    params.append('destination', destination);
    
    const response = await fetch(`/api/maps/directions?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch directions data');
    return response.json();
  },

  async getDistanceMatrix(origins: string, destinations: string) {
    const params = new URLSearchParams();
    params.append('origins', origins);
    params.append('destinations', destinations);
    
    const response = await fetch(`/api/maps/distance-matrix?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch distance matrix data');
    return response.json();
  }
};
