import { ServiceRule, VehicleServiceRecord } from "./VehicleService";

export interface RepairRecord {
  id?: string;
  title: string;
  cost: number;
  date: string;
  mileage: number;
  partId?: string;
}

export interface Vehicle {
  id?: string;
  userId: string;
  name: string; // e.g., "Peugeot 3008 1.6 HDi"
  vin: string;
  engineCode?: string;
  paintCode?: string;
  photoUrl?: string; // Direct image URL of the vehicle
  oemNotes?: string; // Quick reference for OEM specs
  currentOdometer?: number; // Current odometer reading in kilometers
  serviceRecords?: VehicleServiceRecord[]; // Array of service records
  repairRecords?: RepairRecord[]; // Array of repair and maintenance history records
  maintenanceSchedule?: ServiceRule[]; // Array of service rules for the vehicle
  createdAt?: number;
}
