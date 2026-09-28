// React Native: SettingsScreen component
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { styles } from "./SettingsScreen.styles";

interface SettingsScreenProps {
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout }) => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem("user_language", lang);
    setCurrentLang(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("settings") || "Настройки"}
      </Text>

      {/* Language Switcher */}
      <Text style={[styles.label, { color: colors.subText }]}>
        {t("language") || "Язык интерфейса / Language"}:
      </Text>
      <View style={styles.langContainer}>
        {[
          { code: "no", label: "🇳🇴 Norsk" },
          { code: "en", label: "🇬🇧 English" },
          { code: "ru", label: "🇷🇺 Русский" },
        ].map((item) => (
          <TouchableOpacity
            key={item.code}
            style={[
              styles.langBtn,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
              currentLang === item.code && styles.langBtnActive,
            ]}
            onPress={() => changeLanguage(item.code)}
          >
            <Text
              style={[
                styles.langText,
                { color: colors.text },
                currentLang === item.code && styles.langTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dark Mode Switcher */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("darkMode") || "Темная тема (Dark Mode)"}:
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      {/* Logout Button */}
      {onLogout && (
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>
            🚪 {t("logout") || "Выйти из аккаунта"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
