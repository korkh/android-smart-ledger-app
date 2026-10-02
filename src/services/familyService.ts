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
import { FamilyMember } from "../domain/FamilyMember";
import { db } from "./firebaseConfig";

const COLLECTION_NAME = "familyMembers";

// Fetch user family members from Firestore
export async function fetchUserFamilyMembers(
  userId: string,
): Promise<FamilyMember[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
    );
    // Note: if your Firestore rule uses 'userId', ensure it matches. Usually it's 'userId'.
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const members: FamilyMember[] = [];

    querySnapshot.forEach((documentSnapshot) => {
      const data = documentSnapshot.data();
      if (data.userId === userId) {
        members.push({
          id: documentSnapshot.id,
          name: data.name,
          relation: data.relation,
          clothingSize: data.clothingSize,
          shoeSize: data.shoeSize,
          height: data.height,
          notes: data.notes,
        });
      }
    });
    return members;
  } catch (error) {
    console.error("Error fetching family members:", error);
    throw error;
  }
}

// Add new family member to Firestore
export async function addFamilyMember(
  member: FamilyMember & { userId: string },
): Promise<FamilyMember> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), member);
    return {
      ...member,
      id: docRef.id,
    };
  } catch (error) {
    console.error("Error adding family member:", error);
    throw error;
  }
}

// Delete family member from Firestore
export async function deleteFamilyMember(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting family member:", error);
    throw error;
  }
}
