import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

// Handles user login
export const loginUser = async (email: string, pass: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email.trim(), pass);
};

// Handles user registration
export const registerUser = async (
  email: string,
  pass: string,
): Promise<void> => {
  await createUserWithEmailAndPassword(auth, email.trim(), pass);
};

// Handles user sign out
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Deletes current user account
export const deleteUserAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }
  await deleteUser(user);
};

export default { loginUser, registerUser, logoutUser, deleteUserAccount };
