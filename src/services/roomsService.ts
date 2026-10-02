// All comments in code are in English as per project rules

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Room } from "../domain/Room";
import { db } from "./firebaseConfig";

const COLLECTION_NAME = "rooms";

// Utility to remove undefined keys
const sanitizeData = (data: Record<string, any>) => {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      clean[key] = data[key];
    }
  });
  return clean;
};

// Fetch rooms for user
export async function fetchUserRooms(userId: string): Promise<Room[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
    );
    const querySnapshot = await getDocs(q);
    const rooms: Room[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      rooms.push({
        id: docSnap.id,
        userId: data.userId,
        name: data.name,
        floor: data.floor || "",
        dimensions: data.dimensions || "",
        windowsSize: data.windowsSize || "",
        doorsSize: data.doorsSize || "",
        notes: data.notes || "",
      });
    });
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
}

// Add room
export async function addRoom(room: Omit<Room, "id">): Promise<Room> {
  try {
    const cleaned = sanitizeData(room);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), cleaned);
    return {
      ...room,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error adding room:", error);
    throw error;
  }
}

// Delete room
export async function deleteRoom(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
}
