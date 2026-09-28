import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { Vehicle } from "../../../domain/Vehicle";
import { GarageTab } from "../Home/components/GarageTab";
import { styles } from "./SettingsScreen.styles";

interface SettingsScreenProps {
  vehicles: Vehicle[];
  vehName: string;
  setVehName: (val: string) => void;
  vehVin: string;
  setVehVin: (val: string) => void;
  vehPhotoUrl: string;
  setVehPhotoUrl: (val: string) => void;
  vehOemNotes: string;
  setVehOemNotes: (val: string) => void;
  onAddVehicle: () => void;
  onEditVehicle: (veh: Vehicle) => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  vehicles,
  vehName,
  setVehName,
  vehVin,
  setVehVin,
  vehPhotoUrl,
  setVehPhotoUrl,
  vehOemNotes,
  setVehOemNotes,
  onAddVehicle,
  onEditVehicle,
  onLogout,
}) => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // State to toggle Garage section visibility
  const [showGarage, setShowGarage] = useState(false);

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem("user_language", lang);
    setCurrentLang(lang);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
          <Text style={[styles.label, { color: colors.text, marginTop: 0 }]}>
            {t("darkMode") || "Темная тема (Dark Mode)"}:
          </Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>

        {/* Garage Accordion Button */}
        <View
          style={{
            marginTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: colors.inputBg,
              padding: 14,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => setShowGarage(!showGarage)}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
            >
              🚗 {t("garage") || "Гараж / Автомобиль"} ({vehicles.length})
            </Text>
            <Text style={{ fontSize: 16, color: colors.text }}>
              {showGarage ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {/* Expanded Garage Content */}
          {showGarage && (
            <View style={{ marginTop: 12 }}>
              <GarageTab
                vehicles={vehicles}
                vehName={vehName}
                setVehName={setVehName}
                vehVin={vehVin}
                setVehVin={setVehVin}
                vehPhotoUrl={vehPhotoUrl}
                setVehPhotoUrl={setVehPhotoUrl}
                vehOemNotes={vehOemNotes}
                setVehOemNotes={setVehOemNotes}
                onAddVehicle={onAddVehicle}
                onEditVehicle={onEditVehicle}
              />
            </View>
          )}
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
    </ScrollView>
  );
};
