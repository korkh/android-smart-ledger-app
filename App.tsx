// React Native: App entry point with Firebase auth and ThemeProvider
import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { styles } from "./App.styles";
import { ThemeProvider } from "./src/context/ThemeContext";
import { User } from "./src/domain/User";
import "./src/i18n";
import AuthScreen from "./src/presentation/screens/Auth/AuthScreen";
import HomeScreen from "./src/presentation/screens/Home/HomeScreen";
import { auth } from "./src/services/firebaseConfig";

export default function App(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      {!user ? (
        <AuthScreen />
      ) : (
        <HomeScreen user={user} onLogout={handleLogout} />
      )}
    </ThemeProvider>
  );
}
