// All comments in code are in English as per project rules

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { Vehicle } from "../../../../domain/Vehicle";
import {
  DEFAULT_SERVICE_RULES,
  ServiceRule,
  VehicleServiceRecord,
} from "../../../../domain/VehicleService";
import { findBestMatchingCatalogItem } from "../../../../services/vehicleMatchingService";

interface VehicleDetailsScreenProps {
  vehicle: Vehicle;
  catalogItems: any[];
  onUpdateOdometer: (vehicleId: string, newKm: number) => void;
  onAddRepairRecord: (
    vehicleId: string,
    record: {
      title: string;
      cost: number;
      date: string;
      mileage: number;
      partId?: string;
    },
  ) => void;
  onUpdateServiceRecord: (
    vehicleId: string,
    record: VehicleServiceRecord,
  ) => void;
  onBack: () => void;
  rules?: ServiceRule[];
}

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({
  vehicle,
  catalogItems = [],
  onUpdateOdometer,
  onAddRepairRecord,
  onUpdateServiceRecord,
  onBack,
  rules = DEFAULT_SERVICE_RULES,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [odometerInput, setOdometerInput] = useState(
    vehicle.currentOdometer ? vehicle.currentOdometer.toString() : "0",
  );

  // Repair history form state
  const [repairTitle, setRepairTitle] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [repairMileage, setRepairMileage] = useState(
    vehicle.currentOdometer ? vehicle.currentOdometer.toString() : "",
  );
  const [repairDate, setRepairDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedPart, setSelectedPart] = useState<any | null>(null);

  // Service Edit Modal State
  const [editingRule, setEditingRule] = useState<ServiceRule | null>(null);
  const [editLastKm, setEditLastKm] = useState("");
  const [editLastDate, setEditLastDate] = useState("");

  // Catalog Part Picker Modal State
  const [isPartModalVisible, setIsPartModalVisible] = useState(false);
  const [partSearchQuery, setPartSearchQuery] = useState("");

  const handleSaveOdometer = () => {
    const km = parseInt(odometerInput, 10);
    if (isNaN(km) || km < 0) {
      Alert.alert(t("errorTitle") || "Ошибка", "Введите корректный пробег");
      return;
    }
    onUpdateOdometer(vehicle.id!, km);
    Alert.alert(t("successTitle") || "Успех", "Пробег автомобиля обновлен");
  };

  const handleSaveRepair = () => {
    if (!repairTitle.trim()) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        "Укажите название выполненных работ",
      );
      return;
    }
    onAddRepairRecord(vehicle.id!, {
      title: repairTitle.trim(),
      cost: parseFloat(repairCost) || 0,
      date: repairDate.trim() || new Date().toISOString().split("T")[0],
      mileage: parseInt(repairMileage, 10) || vehicle.currentOdometer || 0,
      partId: selectedPart ? selectedPart.id : undefined,
    });
    setRepairTitle("");
    setRepairCost("");
    setSelectedPart(null);
    Alert.alert(t("successTitle") || "Успех", "Запись о ремонте добавлена");
  };

  const handleOpenEditService = (rule: ServiceRule) => {
    const existingRecord = vehicle.serviceRecords?.find(
      (r) => r.ruleId === rule.id,
    );
    setEditingRule(rule);
    setEditLastKm(
      existingRecord ? existingRecord.lastServiceKm.toString() : "0",
    );
    setEditLastDate(
      existingRecord
        ? existingRecord.lastServiceDate
        : new Date().toISOString().split("T")[0],
    );
  };

  const handleSaveServiceRecord = () => {
    if (!editingRule) return;
    const km = parseInt(editLastKm, 10);
    if (isNaN(km)) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        "Введите корректный пробег последней замены",
      );
      return;
    }

    onUpdateServiceRecord(vehicle.id!, {
      id: `${vehicle.id}_${editingRule.id}`,
      vehicleId: vehicle.id!,
      ruleId: editingRule.id,
      lastServiceKm: km,
      lastServiceDate:
        editLastDate.trim() || new Date().toISOString().split("T")[0],
    });

    setEditingRule(null);
    Alert.alert(t("successTitle") || "Успех", "Интервал обслуживания обновлен");
  };

  const filteredCatalogParts = catalogItems.filter((item) => {
    const query = partSearchQuery.toLowerCase();
    const text =
      `${item.title} ${item.oemNumber} ${item.storeName} ${item.categoryPath}`.toLowerCase();
    return text.includes(query);
  });

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
      <TouchableOpacity
        style={[
          styles.backBtn,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
        ]}
        onPress={onBack}
      >
        <Text style={{ color: colors.text, fontWeight: "bold" }}>
          ← {t("closeBtn") || "Назад"}
        </Text>
      </TouchableOpacity>

      {/* Vehicle Header Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {vehicle.photoUrl ? (
          <Image
            source={{ uri: vehicle.photoUrl }}
            style={styles.vehImage}
            resizeMode="cover"
          />
        ) : null}
        <Text style={[styles.vehTitle, { color: colors.text }]}>
          {vehicle.name}
        </Text>
        {vehicle.vin ? (
          <Text style={[styles.subText, { color: colors.subText }]}>
            VIN: {vehicle.vin}
          </Text>
        ) : null}
      </View>

      {/* Odometer Update Section */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {t("odometerLabel") || "Текущий пробег (км):"}
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            keyboardType="numeric"
            value={odometerInput}
            onChangeText={setOdometerInput}
          />
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleSaveOdometer}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {t("updateOdoBtn") || "Обновить"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Maintenance & Service Rules Matrix */}
      <Text style={[styles.sectionHeader, { color: colors.text }]}>
        {t("serviceTitle") || "Обслуживание и сервис"}
      </Text>
      {rules.map((rule: ServiceRule) => {
        const matchedItem = findBestMatchingCatalogItem(rule.id, catalogItems);
        const record = vehicle.serviceRecords?.find(
          (r) => r.ruleId === rule.id,
        );

        const lastKm = record ? record.lastServiceKm : 0;
        const lastDate = record ? record.lastServiceDate : "Не указано";
        const nextKm =
          lastKm > 0 ? lastKm + rule.defaultKmInterval : rule.defaultKmInterval;

        return (
          <TouchableOpacity
            key={rule.id}
            style={[
              styles.serviceRuleCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => handleOpenEditService(rule)}
            activeOpacity={0.8}
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
                  fontSize: 15,
                  color: colors.text,
                  flex: 1,
                }}
              >
                {t(rule.title) || rule.title}
              </Text>
              <Text
                style={{ fontSize: 12, color: "#007AFF", fontWeight: "600" }}
              >
                ✏️ Изменить
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: colors.subText, marginTop: 4 }}>
              Интервал:{" "}
              {rule.defaultKmInterval
                ? `${rule.defaultKmInterval.toLocaleString()} км`
                : ""}{" "}
              {rule.defaultMonthsInterval
                ? `/ ${rule.defaultMonthsInterval} мес.`
                : ""}
            </Text>

            <Text style={{ fontSize: 12, color: colors.text, marginTop: 4 }}>
              📍 Последняя замена:{" "}
              <Text style={{ fontWeight: "600" }}>
                {lastKm > 0 ? `${lastKm.toLocaleString()} км` : "Нет данных"}
              </Text>{" "}
              ({lastDate})
            </Text>

            {rule.defaultKmInterval > 0 && (
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.text,
                  marginTop: 2,
                }}
              >
                🎯 Плановая замена на пробеге: ~{nextKm.toLocaleString()} км
              </Text>
            )}

            {rule.id === "eu_kontroll" ? (
              <View
                style={[
                  styles.matchBox,
                  { backgroundColor: "rgba(0, 122, 255, 0.1)" },
                ]}
              >
                <Text
                  style={{ fontSize: 12, color: "#007AFF", fontWeight: "600" }}
                >
                  🇪🇺 Официальный периодический техосмотр (запасные части не
                  требуются)
                </Text>
              </View>
            ) : matchedItem ? (
              <View style={styles.matchBox}>
                <Text
                  style={{ fontSize: 12, color: "#2e7d32", fontWeight: "600" }}
                >
                  📦 Найдено в каталоге: {matchedItem.title} (
                  {matchedItem.price} {matchedItem.currency})
                </Text>
                {matchedItem.link ? (
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => Linking.openURL(matchedItem.link)}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      🔗 Открыть товар в магазине
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
              <View style={styles.warningBox}>
                <Text style={{ fontSize: 12, color: "#e65100" }}>
                  {t("partsNotFound") ||
                    "⚠️ Запчасть не найдена в каталоге. Рекомендуем добавить."}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Edit Service Record Modal */}
      <Modal visible={!!editingRule} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text, marginBottom: 10 },
              ]}
            >
              Редактировать обслуживание:{" "}
              {editingRule ? t(editingRule.title) : ""}
            </Text>
            <Text
              style={{ fontSize: 12, color: colors.subText, marginBottom: 4 }}
            >
              Пробег на момент последней замены (км):
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                  marginBottom: 10,
                },
              ]}
              keyboardType="numeric"
              value={editLastKm}
              onChangeText={setEditLastKm}
            />
            <Text
              style={{ fontSize: 12, color: colors.subText, marginBottom: 4 }}
            >
              Дата последней замены (ГГГГ-ММ-ДД):
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                  marginBottom: 16,
                },
              ]}
              value={editLastDate}
              onChangeText={setEditLastDate}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  {
                    flex: 1,
                    backgroundColor: "#20c997",
                    paddingVertical: 12,
                    alignItems: "center",
                  },
                ]}
                onPress={handleSaveServiceRecord}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Сохранить
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  {
                    flex: 1,
                    backgroundColor: "#ff4d4d",
                    paddingVertical: 12,
                    alignItems: "center",
                  },
                ]}
                onPress={() => setEditingRule(null)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Отмена
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Repair History Form Section */}
      <Text style={[styles.sectionHeader, { color: colors.text }]}>
        {t("repairHistoryTitle") || "История ремонтов"}
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
              marginBottom: 8,
            },
          ]}
          placeholder={
            t("repairTitlePlaceholder") ||
            "Описание работ (напр. Шаровая Опора П)"
          }
          placeholderTextColor="#888"
          value={repairTitle}
          onChangeText={setRepairTitle}
        />

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.border,
                marginBottom: 0,
              },
            ]}
            placeholder="Пробег (км)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={repairMileage}
            onChangeText={setRepairMileage}
          />
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.border,
                marginBottom: 0,
              },
            ]}
            placeholder="Дата (ГГГГ-ММ-ДД)"
            placeholderTextColor="#888"
            value={repairDate}
            onChangeText={setRepairDate}
          />
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
              marginBottom: 8,
            },
          ]}
          placeholder={
            t("repairCostPlaceholder") || "Стоимость (напр. 1200 NOK)"
          }
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={repairCost}
          onChangeText={setRepairCost}
        />

        {selectedPart ? (
          <View
            style={[
              styles.selectedPartBox,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Text style={{ fontSize: 12, color: colors.text, flex: 1 }}>
              📦 Привязанная деталь:{" "}
              <Text style={{ fontWeight: "bold" }}>{selectedPart.title}</Text>
            </Text>
            <TouchableOpacity onPress={() => setSelectedPart(null)}>
              <Text
                style={{ color: "#ff4d4d", fontWeight: "bold", fontSize: 14 }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.selectPartBtn,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
            onPress={() => setIsPartModalVisible(true)}
          >
            <Text
              style={{ color: colors.text, fontSize: 13, fontWeight: "500" }}
            >
              🔍 Найти деталь в каталоге...
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, { marginTop: 12 }]}
          onPress={handleSaveRepair}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {t("addRepairBtn") || "+ Добавить запись"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Repair Timeline Feed List */}
      {vehicle.repairRecords && vehicle.repairRecords.length > 0 ? (
        vehicle.repairRecords.map((rec: any, index: number) => (
          <View
            key={index}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                padding: 12,
                marginBottom: 8,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontWeight: "bold", fontSize: 15, color: colors.text }}
              >
                🛠️ {rec.title}
              </Text>
              <Text
                style={{ fontWeight: "bold", fontSize: 14, color: colors.text }}
              >
                {rec.cost} NOK
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.subText, marginTop: 4 }}>
              📍 {rec.mileage ? `${rec.mileage.toLocaleString()} км` : ""} •{" "}
              {rec.date}
            </Text>
          </View>
        ))
      ) : (
        <Text
          style={{
            color: colors.subText,
            fontSize: 13,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Нет записей в истории ремонтов
        </Text>
      )}

      {/* Catalog Part Picker Modal */}
      <Modal
        visible={isPartModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text, marginBottom: 10 },
              ]}
            >
              Выберите деталь из каталога
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                  marginBottom: 10,
                },
              ]}
              placeholder="Поиск по названию или артикулу..."
              placeholderTextColor="#888"
              value={partSearchQuery}
              onChangeText={setPartSearchQuery}
            />
            <ScrollView style={{ maxHeight: 300, marginBottom: 12 }}>
              {filteredCatalogParts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.partListItem,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedPart(item);
                    setIsPartModalVisible(false);
                    setPartSearchQuery("");
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 13,
                      color: colors.text,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.subText }}>
                    {item.storeName || "Магазин не указан"} | {item.price}{" "}
                    {item.currency}
                  </Text>
                </TouchableOpacity>
              ))}
              {filteredCatalogParts.length === 0 && (
                <Text
                  style={{
                    textAlign: "center",
                    color: colors.subText,
                    padding: 20,
                  }}
                >
                  Ничего не найдено
                </Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: "#ff4d4d",
                  paddingVertical: 10,
                  alignItems: "center",
                },
              ]}
              onPress={() => setIsPartModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  card: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  vehImage: { width: "100%", height: 160, borderRadius: 8, marginBottom: 10 },
  vehTitle: { fontSize: 18, fontWeight: "bold" },
  subText: { fontSize: 13, marginTop: 2 },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  serviceRuleCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  matchBox: {
    marginTop: 6,
    padding: 8,
    backgroundColor: "rgba(46, 125, 50, 0.1)",
    borderRadius: 6,
  },
  warningBox: {
    marginTop: 6,
    padding: 6,
    backgroundColor: "rgba(230, 81, 0, 0.1)",
    borderRadius: 6,
  },
  linkBtn: {
    backgroundColor: "#2e7d32",
    padding: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: "#20c997",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectPartBtn: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    borderStyle: "dashed",
  },
  selectedPartBox: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { padding: 16, borderRadius: 12 },
  partListItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
});
