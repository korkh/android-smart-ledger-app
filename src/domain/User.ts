export interface AppUser {
  uid: string;
  email: string | null;
}

export interface User extends AppUser {
  displayName: string | null;
  photoURL: string | null;
}

export const EMPTY_USER: User = {
  uid: "",
  email: null,
  displayName: null,
  photoURL: null,
};
