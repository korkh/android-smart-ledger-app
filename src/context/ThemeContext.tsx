// React Native: Theme context for global Light / Dark mode management
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: (value: boolean) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    subText: string;
    inputBg: string;
    border: string;
  };
}

const lightColors = {
  background: "#f8f9fa",
  card: "#ffffff",
  text: "#212529",
  subText: "#6c757d",
  inputBg: "#f1f3f5",
  border: "#dee2e6",
};

const darkColors = {
  background: "#121212",
  card: "#1e1e1e",
  text: "#f8f9fa",
  subText: "#adb5bd",
  inputBg: "#2c2c2c",
  border: "#3d3d3d",
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("user_theme").then((theme) => {
      if (theme === "dark") setIsDarkMode(true);
    });
  }, []);

  const toggleTheme = async (value: boolean) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem("user_theme", value ? "dark" : "light");
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
