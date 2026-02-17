
import { MOCK_LOCATIONS } from './constants';

/**
 * Local VIN Decoder (Simulation)
 * Decodes specific VIN patterns or returns generic data for demo purposes.
 */
export const decodeVin = async (vin: string) => {
  if (!vin || vin.length < 10) return null;

  // Artificial delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulation: Deterministic mapping for common test VINs
  if (vin.startsWith('1GKS')) return { year: 2023, make: 'GMC', model: 'Yukon Denali', trim: 'Ultimate', bodyStyle: 'SUV' };
  if (vin.startsWith('2T3P')) return { year: 2024, make: 'Toyota', model: 'RAV4', trim: 'XSE Hybrid', bodyStyle: 'SUV' };
  if (vin.startsWith('1HGC')) return { year: 2021, make: 'Honda', model: 'Civic', trim: 'Sport', bodyStyle: 'Sedan' };

  // Fallback for random VINs
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const makes = ['BMW', 'Ford', 'Audi', 'Tesla', 'Mercedes-Benz'];
  
  return {
    year: years[Math.floor(Math.random() * years.length)],
    make: makes[Math.floor(Math.random() * makes.length)],
    model: 'Import Asset',
    trim: 'Premium Spec',
    bodyStyle: 'Sedan'
  };
};

/**
 * Local Marketing Copy Generator
 * Uses templates to build professional descriptions.
 */
export const generateMarketingCopy = async (vehicle: any, tone: string) => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const headlines = [
    `Unmatched Elegance: The ${vehicle.year} ${vehicle.make}`,
    `Performance Meets Luxury in this ${vehicle.model}`,
    `Ready for the Road: ${vehicle.year} ${vehicle.make} ${vehicle.model}`
  ];

  const highlights = [
    "Thoroughly inspected 150-point safety check",
    "Pristine interior condition with premium accents",
    "Complete Carfax history available upon request",
    "Optimized performance for the Canadian climate"
  ];

  return {
    headline: headlines[Math.floor(Math.random() * headlines.length)],
    description: `This ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} represents the pinnacle of its class. With a focus on ${tone.toLowerCase()} and reliability, this vehicle has been curated specifically for the discerning driver.`,
    highlights: highlights.sort(() => 0.5 - Math.random()).slice(0, 3),
    cta: "Contact our concierge today to schedule your private viewing."
  };
};

/**
 * Local Market Insights (Simulation)
 */
export const getMarketInsights = async (make: string, model: string, year: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const text = `Local Market Analysis for ${year} ${make} ${model}:
  
  Current Market Value: High stability.
  Average Dealership Listing: $${(Math.random() * 20000 + 40000).toFixed(0)} - $${(Math.random() * 20000 + 60000).toFixed(0)}
  Demand Index: 8.4/10 (High)
  
  Competitive Analysis: Generally outpaces peers in resale value retention for the ${year} model year in the Toronto/GTA region.`;

  return {
    text,
    sources: [
      { web: { uri: "https://oldroad.auto/market", title: "OldRoad Internal Index" } }
    ]
  };
};

/**
 * Local Location Finder
 * Uses the internal MOCK_LOCATIONS registry.
 */
export const findDealershipLocations = async (latitude: number, longitude: number) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const text = `Based on your current coordinates, we have identified the following OldRoad Auto facilities and certified service partners:`;

  const sources = MOCK_LOCATIONS.map(loc => ({
    maps: {
      uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`,
      title: `${loc.name} (${loc.type})`
    }
  }));

  return { text, sources };
};

/**
 * Local Dream Car Visualizer
 * Returns high-quality static images based on keywords.
 */
export const generateDreamCarImage = async (prompt: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const p = prompt.toLowerCase();
  let category = 'supercar';
  
  if (p.includes('truck') || p.includes('pickup')) category = 'truck';
  else if (p.includes('suv') || p.includes('offroad')) category = 'suv';
  else if (p.includes('classic') || p.includes('vintage')) category = 'classic-car';
  else if (p.includes('electric') || p.includes('tesla')) category = 'electric-car';

  // Return a random high-quality car image from Unsplash Source
  return `https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200&h=800&sig=${Math.floor(Math.random() * 1000)}`;
};
