import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { Category } from "../../../domain/Category";
import { FamilyMember } from "../../../domain/FamilyMember";
import { Room } from "../../../domain/Room";
import { Vehicle } from "../../../domain/Vehicle";
import { deleteUserAccount } from "../../../services/authService";
import { CategoriesTab } from "../Home/components/CategoriesTab";
import { FamilyTab } from "../Home/components/FamilyTab";
import { GarageTab } from "../Home/components/GarageTab";

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
  onDeleteVehicle: (id: string) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;

  categories: Category[];
  selectedParentId: string | null;
  setSelectedParentId: (id: string | null) => void;
  newCatName: string;
  setNewCatName: (value: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id?: string, name?: string) => void;

  familyMembers: FamilyMember[];
  onAddFamilyMember: (member: FamilyMember) => void;
  onDeleteFamilyMember: (id: string) => void;

  rooms: Room[];
  onAddRoom: (room: Omit<Room, "id" | "userId">) => void;
  onDeleteRoom: (id: string) => void;

  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  vehicles = [],
  onDeleteVehicle,
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
  onSelectVehicle,
  categories = [],
  selectedParentId,
  setSelectedParentId,
  newCatName,
  setNewCatName,
  onAddCategory,
  onDeleteCategory,
  familyMembers = [],
  onAddFamilyMember,
  onDeleteFamilyMember,
  rooms = [],
  onAddRoom,
  onDeleteRoom,
  onLogout,
}) => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const [showGarage, setShowGarage] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showFamily, setShowFamily] = useState(false);
  const [showRooms, setShowRooms] = useState(false);

  // New Room local state
  const [roomName, setRoomName] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [roomDimensions, setRoomDimensions] = useState("");
  const [roomWindows, setRoomWindows] = useState("");
  const [roomDoors, setRoomDoors] = useState("");

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem("user_language", lang);
    setCurrentLang(lang);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("deleteAccountTitle") || "Удаление аккаунта",
      t("deleteAccountConfirm") ||
        "Вы уверены, что хотите удалить свой аккаунт и все связанные локальные данные? Это действие необратимо.",
      [
        { text: t("cancel") || "Отмена", style: "cancel" },
        {
          text: t("delete") || "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserAccount();
              await AsyncStorage.clear();
              Alert.alert(
                t("successTitle") || "Успех",
                t("accountDeletedMessage") ||
                  "Ваш аккаунт и данные были успешно удалены.",
              );
            } catch (error: any) {
              Alert.alert(
                t("errorTitle") || "Ошибка",
                error.message ||
                  "Не удалось удалить аккаунт. Возможно, требуется повторный вход.",
              );
            }
          },
        },
      ],
    );
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

        {/* Garage Accordion */}
        <View
          style={{
            marginTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity
            style={styles.accordionHeaderButton}
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

          {showGarage && (
            <View style={{ marginTop: 12 }}>
              <GarageTab
                onDeleteVehicle={(id) => onDeleteVehicle(id)}
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
                onSelectVehicle={onSelectVehicle}
              />
            </View>
          )}
        </View>

        {/* Categories Accordion */}
        <View
          style={{
            marginTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity
            style={styles.accordionHeaderButton}
            onPress={() => setShowCategories(!showCategories)}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
            >
              📁 {t("categories") || "Категории"} ({categories.length})
            </Text>
            <Text style={{ fontSize: 16, color: colors.text }}>
              {showCategories ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {showCategories && (
            <View style={{ marginTop: 12 }}>
              <CategoriesTab
                categories={categories}
                selectedParentId={selectedParentId}
                setSelectedParentId={setSelectedParentId}
                newCatName={newCatName}
                setNewCatName={setNewCatName}
                onAddCategory={onAddCategory}
                onDeleteCategory={onDeleteCategory}
              />
            </View>
          )}
        </View>

        {/* Family Sizes Accordion */}
        <View
          style={{
            marginTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity
            style={styles.accordionHeaderButton}
            onPress={() => setShowFamily(!showFamily)}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
            >
              👥 {t("familySizesTitle") || "Размеры одежды семьи"} (
              {familyMembers.length})
            </Text>
            <Text style={{ fontSize: 16, color: colors.text }}>
              {showFamily ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {showFamily && (
            <View style={{ marginTop: 12 }}>
              <FamilyTab
                members={familyMembers}
                onAddMember={onAddFamilyMember}
                onDeleteMember={onDeleteFamilyMember}
              />
            </View>
          )}
        </View>

        {/* Home Organizer Accordion */}
        <View
          style={{
            marginTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity
            style={styles.accordionHeaderButton}
            onPress={() => setShowRooms(!showRooms)}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
            >
              🏠 {t("homeOrganizer") || "Организатор дома (Комнаты и проемы)"} (
              {rooms.length})
            </Text>
            <Text style={{ fontSize: 16, color: colors.text }}>
              {showRooms ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {showRooms && (
            <View style={{ marginTop: 12 }}>
              {/* Existing Rooms List Container */}
              {rooms.length > 0 && (
                <View style={{ marginBottom: 14 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.subText,
                      marginBottom: 8,
                    }}
                  >
                    {t("existingRooms") || "Существующие помещения"}:
                  </Text>
                  {rooms.map((room) => (
                    <View
                      key={room.id}
                      style={{
                        backgroundColor: colors.inputBg,
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "bold",
                            color: colors.text,
                            fontSize: 14,
                          }}
                        >
                          📍 {room.name} {room.floor ? `(${room.floor})` : ""}
                        </Text>
                        <TouchableOpacity
                          onPress={() => onDeleteRoom(room.id!)}
                        >
                          <Text
                            style={{
                              color: "#ff4d4d",
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            ✕
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {room.dimensions ? (
                        <Text
                          style={{
                            color: colors.subText,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          📏 {t("sizeLabel") || "Размер"}: {room.dimensions}
                        </Text>
                      ) : null}
                      {room.windowsSize ? (
                        <Text
                          style={{
                            color: colors.subText,
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          🪟 {t("windowsLabel") || "Окна"}: {room.windowsSize}
                        </Text>
                      ) : null}
                      {room.doorsSize ? (
                        <Text
                          style={{
                            color: colors.subText,
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          🚪 {t("doorsLabel") || "Двери"}: {room.doorsSize}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}

              {/* Add New Room Form Card */}
              <View
                style={{
                  backgroundColor: colors.background,
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 10,
                  }}
                >
                  + {t("addNewRoom") || "Добавить новую комнату"}:
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={
                    t("roomNamePlaceholder") ||
                    "Название комнаты (напр. Гостиная)"
                  }
                  placeholderTextColor="#888"
                  value={roomName}
                  onChangeText={setRoomName}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={
                    t("roomFloorPlaceholder") || "Этаж (напр. 1 этаж)"
                  }
                  placeholderTextColor="#888"
                  value={roomFloor}
                  onChangeText={setRoomFloor}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={
                    t("roomDimensionsPlaceholder") ||
                    "Размер комнаты (напр. 4x5 м, высота 2.6м)"
                  }
                  placeholderTextColor="#888"
                  value={roomDimensions}
                  onChangeText={setRoomDimensions}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={
                    t("roomWindowsPlaceholder") ||
                    "Размеры окон (напр. 140x160 см)"
                  }
                  placeholderTextColor="#888"
                  value={roomWindows}
                  onChangeText={setRoomWindows}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={
                    t("roomDoorsPlaceholder") ||
                    "Размеры дверей (напр. 90x200 см)"
                  }
                  placeholderTextColor="#888"
                  value={roomDoors}
                  onChangeText={setRoomDoors}
                />

                <TouchableOpacity
                  style={{
                    backgroundColor: "#20c997",
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginTop: 4,
                  }}
                  onPress={() => {
                    if (!roomName.trim()) {
                      Alert.alert(
                        t("errorTitle") || "Ошибка",
                        t("enterRoomNameAlert") || "Введите название комнаты",
                      );
                      return;
                    }
                    onAddRoom({
                      name: roomName.trim(),
                      floor: roomFloor.trim(),
                      dimensions: roomDimensions.trim(),
                      windowsSize: roomWindows.trim(),
                      doorsSize: roomDoors.trim(),
                    });
                    setRoomName("");
                    setRoomFloor("");
                    setRoomDimensions("");
                    setRoomWindows("");
                    setRoomDoors("");
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}
                  >
                    {t("saveRoomBtn") || "Сохранить комнату"}
                  </Text>
                </TouchableOpacity>
              </View>
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

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteAccountBtn}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteAccountText}>
            ⚠️ {t("deleteAccount") || "Удалить аккаунт и данные"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8, marginTop: 12 },
  langContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  langBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  langBtnActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  langText: { fontSize: 13, fontWeight: "500" },
  langTextActive: { color: "#fff", fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  accordionHeaderButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  input: {
    height: 46,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 10,
    fontSize: 14,
  },
  logoutBtn: {
    backgroundColor: "#ffebee",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  logoutText: {
    color: "#d32f2f",
    fontWeight: "bold",
    fontSize: 15,
  },
  deleteAccountBtn: {
    backgroundColor: "#b71c1c",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#d32f2f",
  },
  deleteAccountText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});
