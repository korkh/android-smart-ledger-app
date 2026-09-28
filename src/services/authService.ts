import {
  createUserWithEmailAndPassword,
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

export default { loginUser, registerUser, logoutUser };
