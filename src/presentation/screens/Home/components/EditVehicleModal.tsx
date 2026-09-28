import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Vehicle } from "../../../../domain/Vehicle";
import { styles } from "../HomeScreen.styles";

interface EditVehicleModalProps {
  visible: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (updatedVehicle: Vehicle) => Promise<void>;
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  visible,
  vehicle,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [vin, setVin] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [oemNotes, setOemNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setName(vehicle.name || "");
      setVin(vehicle.vin || "");
      setPhotoUrl(vehicle.photoUrl || "");
      setOemNotes(vehicle.oemNotes || "");
    }
  }, [vehicle]);

  const handleSave = async () => {
    if (!vehicle) return;

    if (!name.trim()) {
      Alert.alert("Ошибка", "Укажите марку/модель авто");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...vehicle,
        name: name.trim(),
        vin: vin.trim(),
        photoUrl: photoUrl.trim(),
        oemNotes: oemNotes.trim(),
      });
      onClose();
    } catch (error: any) {
      Alert.alert("Ошибка сохранения", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
        }}
      >
        <View style={[styles.cardSection, { margin: 20 }]}>
          <Text style={styles.sectionTitle}>Редактировать автомобиль</Text>

          <ScrollView style={{ marginBottom: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Марка / Модель"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="VIN код"
              value={vin}
              onChangeText={setVin}
              autoCapitalize="characters"
            />

            <TextInput
              style={styles.input}
              placeholder="Ссылка на фото авто (URL)"
              value={photoUrl}
              onChangeText={setPhotoUrl}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="OEM допуски и спецификации"
              value={oemNotes}
              onChangeText={setOemNotes}
            />
          </ScrollView>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: "#8e8e93", width: "48%" },
              ]}
              onPress={onClose}
            >
              <Text style={styles.submitBtnText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { width: "48%" }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Сохранить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
