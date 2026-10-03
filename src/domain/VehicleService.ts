export interface ServiceRule {
  id: string;
  title: string; // e.g., "Motor Oil & Filter", "EU-Kontroll"
  defaultKmInterval: number; // e.g., 15000 km
  defaultMonthsInterval: number; // e.g., 12 months
  categoryKeyword: string; // Keyword to match items in catalog (e.g., "Oil", "Filter")
  isMandatoryInspection?: boolean; // True for official inspections (EU-kontrol / Regitra)
}

export interface VehicleServiceRecord {
  id: string;
  vehicleId: string;
  ruleId: string;
  lastServiceKm: number; // Odometer reading when service was done
  lastServiceDate: string; // ISO date (YYYY-MM-DD)
  customKmInterval?: number; // User override for km
  customMonthsInterval?: number; // User override for months

  // Optional Service Station Info
  stationName?: string;
  stationAddress?: string;
}

export const DEFAULT_SERVICE_RULES: ServiceRule[] = [
  {
    id: "oil_filter",
    title: "oilFilterRule",
    defaultKmInterval: 15000,
    defaultMonthsInterval: 12,
    categoryKeyword: "Oil",
  },
  {
    id: "air_filter",
    title: "airFilterRule",
    defaultKmInterval: 30000,
    defaultMonthsInterval: 24,
    categoryKeyword: "Air Filter",
  },
  {
    id: "cabin_filter",
    title: "cabinFilterRule",
    defaultKmInterval: 15000,
    defaultMonthsInterval: 12,
    categoryKeyword: "Cabin Filter",
  },
  {
    id: "fuel_filter",
    title: "fuelFilterRule",
    defaultKmInterval: 30000,
    defaultMonthsInterval: 24,
    categoryKeyword: "Fuel Filter",
  },
  {
    id: "timing_belt",
    title: "timingBeltRule",
    defaultKmInterval: 140000, // Регламент для 1.6 HDi обычно 140-160 тыс. км или 10 лет
    defaultMonthsInterval: 120,
    categoryKeyword: "Timing Belt",
  },
  {
    id: "eu_kontroll",
    title: "euKontrollRule",
    defaultKmInterval: 0,
    defaultMonthsInterval: 24,
    categoryKeyword: "Inspection",
    isMandatoryInspection: true,
  },
];
