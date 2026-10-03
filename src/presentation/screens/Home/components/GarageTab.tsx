// All comments in code are in English as per project rules

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { Vehicle } from "../../../../domain/Vehicle";
import { styles } from "../HomeScreen.styles";

interface GarageTabProps {
  vehicles: Vehicle[];
  vehName: string;
  setVehName: (value: string) => void;
  vehVin: string;
  setVehVin: (value: string) => void;
  vehPhotoUrl: string;
  setVehPhotoUrl: (value: string) => void;
  vehOemNotes: string;
  setVehOemNotes: (value: string) => void;
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onSelectVehicle: (vehicle: Vehicle) => void; // Callback to open vehicle details screen
}

export const GarageTab: React.FC<GarageTabProps> = ({
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
  onDeleteVehicle,
  onSelectVehicle,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const confirmDeleteVehicle = (id: string, name: string) => {
    Alert.alert(
      t("deleteVehicleTitle") || "Удаление автомобиля",
      `${t("deleteVehicleConfirm") || "Вы действительно хотите удалить"} "${name}"?`,
      [
        { text: t("cancel") || "Отмена", style: "cancel" },
        {
          text: t("delete") || "Удалить",
          style: "destructive",
          onPress: () => onDeleteVehicle(id),
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.cardSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("addVehicleTitle") || "Добавить автомобиль"}
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
            t("vehNamePlaceholder") ||
            "Марка / Модель (напр., Peugeot 3008 1.6 HDi)"
          }
          placeholderTextColor="#888"
          value={vehName}
          onChangeText={setVehName}
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
          placeholder={t("vinPlaceholder") || "VIN код"}
          placeholderTextColor="#888"
          value={vehVin}
          onChangeText={setVehVin}
          autoCapitalize="characters"
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
          placeholder={t("photoUrlPlaceholder") || "Ссылка на фото авто (URL)"}
          placeholderTextColor="#888"
          value={vehPhotoUrl}
          onChangeText={setVehPhotoUrl}
          autoCapitalize="none"
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
            t("oemNotesPlaceholder") ||
            "OEM допуски и спецификации (масло, фильтры)"
          }
          placeholderTextColor="#888"
          value={vehOemNotes}
          onChangeText={setVehOemNotes}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={onAddVehicle}>
          <Text style={styles.submitBtnText}>
            {t("saveVehicleBtn") || "Сохранить авто"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("myFleetTitle") || "Мой автопарк"} ({vehicles.length})
      </Text>
      {vehicles.map((veh) => (
        <TouchableOpacity
          key={veh.id}
          style={[
            styles.itemCard,
            {
              backgroundColor: colors.card,
              flexDirection: "row",
              alignItems: "center",
            },
          ]}
          onPress={() => onSelectVehicle(veh)}
          activeOpacity={0.7}
        >
          {veh.photoUrl ? (
            <Image
              source={{ uri: veh.photoUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : null}
          <View style={[styles.itemInfo, { flex: 1 }]}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              🚗 {veh.name}
            </Text>
            {veh.vin ? (
              <Text style={[styles.itemDetails, { color: colors.subText }]}>
                VIN: {veh.vin}
              </Text>
            ) : null}
            {veh.oemNotes ? (
              <Text style={[styles.itemDetails, { color: colors.subText }]}>
                {veh.oemNotes}
              </Text>
            ) : null}
          </View>

          {/* Action buttons (Edit & Delete) */}
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering card selection
                onEditVehicle(veh);
              }}
            >
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering card selection
                confirmDeleteVehicle(veh.id!, veh.name);
              }}
            >
              <Text
                style={{ fontSize: 16, color: "#ff4d4d", fontWeight: "bold" }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
