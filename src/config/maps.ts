// Google Maps Configuration
// Replace with your actual Google Maps API key from https://console.cloud.google.com/

export const GOOGLE_MAPS_CONFIG = {
  // Get your API key from Google Cloud Console
  // Enable: Maps JavaScript API, Places API (optional), Geocoding API (optional)
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  // Default center for San Jose City, Nueva Ecija, Philippines
  defaultCenter: {
    lat: 15.7917,
    lng: 120.9892,
  },

  // Default zoom level for city view
  defaultZoom: 13,

  // Zoom level for household view
  householdZoom: 17,

  // Map styles for a cleaner look
  mapStyles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// San Jose City barangay approximate centers
export const BARANGAY_CENTERS: Record<string, { lat: number; lng: number }> = {
  'A. Pascual (Pob.)': { lat: 15.7920, lng: 120.9900 },
  'Canuto Ramos (Pob.)': { lat: 15.7915, lng: 120.9910 },
  'Crisanto Sanchez (Pob.)': { lat: 15.7910, lng: 120.9895 },
  'Pinili (Pob.)': { lat: 15.7925, lng: 120.9885 },
  'Caanawan': { lat: 15.8150, lng: 120.9650 },
  'Abar 1st': { lat: 15.8200, lng: 120.9550 },
  'Abar 2nd': { lat: 15.8180, lng: 120.9600 },
  'Malasin': { lat: 15.7700, lng: 121.0200 },
  'Kita-Kita': { lat: 15.7750, lng: 121.0150 },
  'Manicla': { lat: 15.7600, lng: 121.0350 },
  'San Agustin': { lat: 15.7650, lng: 120.9850 },
  'Tayabo': { lat: 15.7500, lng: 120.9600 },
  'Santo Nino 1st': { lat: 15.7550, lng: 120.9750 },
  'Santo Nino 2nd': { lat: 15.7520, lng: 120.9780 },
  'Sibut': { lat: 15.8050, lng: 121.0100 },
  'Tondod': { lat: 15.8100, lng: 121.0200 },
  'Dizol': { lat: 15.7950, lng: 121.0300 },
  'Palestina': { lat: 15.7750, lng: 120.9800 },
  'Villa Marina': { lat: 15.7850, lng: 120.9500 },
  'Santo Tomas': { lat: 15.8000, lng: 120.9450 },
  'Calaocan': { lat: 15.8050, lng: 120.9700 },
  'Kaliwanagan': { lat: 15.8200, lng: 120.9900 },
  'Bagong Sikat': { lat: 15.8250, lng: 120.9950 },
  'Sinipit': { lat: 15.7450, lng: 121.0000 },
  'Soledad': { lat: 15.7400, lng: 121.0100 },
  'San Juan': { lat: 15.7480, lng: 120.9550 },
};

// Risk zone polygons (approximate coordinates for San Jose City)
// In production, these should come from actual GIS data
export const FLOOD_ZONES: google.maps.LatLngLiteral[][] = [
  // Northwest flood-prone area (Caanawan/Abar)
  [
    { lat: 15.8250, lng: 120.9500 },
    { lat: 15.8200, lng: 120.9700 },
    { lat: 15.8100, lng: 120.9750 },
    { lat: 15.8050, lng: 120.9600 },
    { lat: 15.8150, lng: 120.9450 },
    { lat: 15.8250, lng: 120.9500 },
  ],
  // Southwest flood-prone area (Tayabo/Villa Marina)
  [
    { lat: 15.7600, lng: 120.9450 },
    { lat: 15.7550, lng: 120.9650 },
    { lat: 15.7450, lng: 120.9600 },
    { lat: 15.7500, lng: 120.9400 },
    { lat: 15.7600, lng: 120.9450 },
  ],
];

export const LANDSLIDE_ZONES: google.maps.LatLngLiteral[][] = [
  // Eastern hilly area (Dizol/Manicla)
  [
    { lat: 15.8000, lng: 121.0200 },
    { lat: 15.7900, lng: 121.0400 },
    { lat: 15.7700, lng: 121.0350 },
    { lat: 15.7750, lng: 121.0150 },
    { lat: 15.8000, lng: 121.0200 },
  ],
];

// Evacuation center markers
export const EVACUATION_CENTERS = [
  { name: 'San Jose City Gym', position: { lat: 15.7920, lng: 120.9905 }, capacity: 500 },
  { name: 'Caanawan Elementary School', position: { lat: 15.8150, lng: 120.9660 }, capacity: 200 },
  { name: 'Malasin Barangay Hall', position: { lat: 15.7710, lng: 121.0190 }, capacity: 150 },
  { name: 'San Agustin Chapel', position: { lat: 15.7660, lng: 120.9860 }, capacity: 100 },
  { name: 'Sibut Community Center', position: { lat: 15.8060, lng: 121.0110 }, capacity: 180 },
];
