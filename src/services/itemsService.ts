import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { InventoryItem } from "../domain/InventoryItem";
import { db } from "./firebaseConfig";
const ITEMS_COLLECTION = "items";

// Utility to remove undefined keys before sending to Firestore
const sanitizeData = (data: Record<string, any>) => {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      clean[key] = data[key];
    }
  });
  return clean;
};

// Adds a new inventory item to Firestore
export const addInventoryItem = async (
  item: Omit<InventoryItem, "id" | "createdAt">,
): Promise<string> => {
  const cleanedItem = sanitizeData({
    ...item,
    createdAt: Date.now(),
  });

  const docRef = await addDoc(collection(db, ITEMS_COLLECTION), cleanedItem);
  return docRef.id;
};

// Updates an existing inventory item in Firestore
export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<InventoryItem>,
): Promise<void> => {
  const cleanedUpdates = sanitizeData(updates);
  const docRef = doc(db, ITEMS_COLLECTION, itemId);
  await updateDoc(docRef, cleanedUpdates);
};

// Fetches all inventory items belonging to a specific user
export const fetchUserItems = async (
  userId: string,
): Promise<InventoryItem[]> => {
  const q = query(
    collection(db, ITEMS_COLLECTION),
    where("userId", "==", userId),
  );

  const querySnapshot = await getDocs(q);
  const items: InventoryItem[] = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    items.push({
      id: docSnap.id,
      userId: data.userId,
      title: data.title,
      categoryId: data.categoryId,
      categoryPath: data.categoryPath,
      vehicleId: data.vehicleId || "",
      oemNumber: data.oemNumber || "",
      storeName: data.storeName || "",
      price: data.price || 0,
      currency: data.currency || "NOK",
      link: data.link || "",
      imageUrl: data.imageUrl || "",
      notes: data.notes || "",
      createdAt: data.createdAt,
    });
  });

  return items;
};

// Deletes an inventory item by document ID
export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
};

// Bulk imports an array of inventory items into Firestore using writeBatch
export const importBulkItems = async (
  userId: string,
  itemsToImport: Omit<InventoryItem, "id" | "userId" | "createdAt">[],
): Promise<void> => {
  const batch = writeBatch(db);

  itemsToImport.forEach((item) => {
    const docRef = doc(collection(db, ITEMS_COLLECTION));
    const cleanedItem = sanitizeData({
      ...item,
      userId,
      createdAt: Date.now(),
    });
    batch.set(docRef, cleanedItem);
  });

  await batch.commit();
};
