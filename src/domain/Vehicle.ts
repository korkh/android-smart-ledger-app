// Domain Vehicle entity for storing VIN, OEM info, and vehicle specs
export interface Vehicle {
  id?: string;
  userId: string;
  name: string; // e.g., "Peugeot 3008 1.6 HDi"
  vin: string;
  engineCode?: string;
  paintCode?: string;
  photoUrl?: string; // Direct image URL of the vehicle
  oemNotes?: string; // Quick reference for OEM specs (fluid specs, oil types, etc.)
  createdAt?: number;
}
