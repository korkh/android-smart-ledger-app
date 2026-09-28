import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Vehicle } from "../domain/Vehicle";
import { db } from "./firebaseConfig";

const VEHICLES_COLLECTION = "vehicles";

// Fetches user vehicle profiles from Firestore
export const fetchUserVehicles = async (userId: string): Promise<Vehicle[]> => {
  const q = query(
    collection(db, VEHICLES_COLLECTION),
    where("userId", "==", userId),
  );

  const querySnapshot = await getDocs(q);
  const vehicles: Vehicle[] = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    vehicles.push({
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      vin: data.vin,
      engineCode: data.engineCode,
      paintCode: data.paintCode,
      photoUrl: data.photoUrl,
      oemNotes: data.oemNotes,
      createdAt: data.createdAt,
    });
  });

  return vehicles;
};

// Adds a new vehicle profile
export const addVehicle = async (
  vehicle: Omit<Vehicle, "id" | "createdAt">,
): Promise<Vehicle> => {
  const newVehicleData = {
    ...vehicle,
    createdAt: Date.now(),
  };
  const docRef = await addDoc(
    collection(db, VEHICLES_COLLECTION),
    newVehicleData,
  );
  return {
    id: docRef.id,
    ...newVehicleData,
  };
};

// Updates an existing vehicle profile
export const updateVehicle = async (
  vehicleId: string,
  updates: Partial<Vehicle>,
): Promise<void> => {
  const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
  await updateDoc(docRef, updates);
};

// Deletes a vehicle profile by ID
export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicleId));
};
