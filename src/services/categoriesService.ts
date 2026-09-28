import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Category } from "../domain/Category";
import { db } from "./firebaseConfig";

const CATEGORIES_COLLECTION = "categories";

// Fetches all categories and subcategories for a specific user
export const fetchUserCategories = async (
  userId: string,
): Promise<Category[]> => {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    where("userId", "==", userId),
  );

  const querySnapshot = await getDocs(q);
  const categories: Category[] = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    categories.push({
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      parentId: data.parentId || null,
      createdAt: data.createdAt,
    });
  });

  return categories;
};

// Adds a new category or subcategory with optional parentId
export const addCategory = async (
  userId: string,
  name: string,
  parentId: string | null = null,
): Promise<Category> => {
  const newCategoryData = {
    userId,
    name: name.trim(),
    parentId,
    createdAt: Date.now(),
  };
  const docRef = await addDoc(
    collection(db, CATEGORIES_COLLECTION),
    newCategoryData,
  );
  return {
    id: docRef.id,
    ...newCategoryData,
  };
};

// Deletes a category by ID
export const deleteCategory = async (categoryId: string): Promise<void> => {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));
};

// Helper function to build full category display path (e.g. "Машина > Трансмиссия > Масло")
export const buildCategoryPath = (
  categoryId: string,
  categories: Category[],
): string => {
  const path: string[] = [];
  let current: Category | undefined = categories.find(
    (c) => c.id === categoryId,
  );

  while (current) {
    path.unshift(current.name);
    current = categories.find((c) => c.id === current?.parentId);
  }

  return path.join(" > ");
};
