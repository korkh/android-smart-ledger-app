// All comments in code are in English as per project rules

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { Category } from "../../../../domain/Category";
import { FamilyMember } from "../../../../domain/FamilyMember";
import { Room } from "../../../../domain/Room";
import { fetchLinkMetadata } from "../../../../services/itemsService";

interface AddItemTabProps {
  categories: Category[];
  selectedParentId: string | null;
  setSelectedParentId: (id: string | null) => void;
  selectedSubcategoryId: string | null;
  setSelectedSubcategoryId: (id: string | null) => void;

  familyMembers?: FamilyMember[];
  selectedFamilyMemberId?: string | null;
  setSelectedFamilyMemberId?: (id: string | null) => void;

  rooms?: Room[];
  selectedRoomId?: string | null;
  setSelectedRoomId?: (id: string | null) => void;

  title: string;
  setTitle: (value: string) => void;
  oemNumber: string;
  setOemNumber: (value: string) => void;
  storeName: string;
  setStoreName: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  link: string;
  setLink: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  submitting: boolean;
  onAddItem: () => void;
  onCreateCategory: (
    name: string,
    parentId?: string | null,
  ) => Promise<string | void>;
}

export const AddItemTab: React.FC<AddItemTabProps> = ({
  categories,
  selectedParentId,
  setSelectedParentId,
  selectedSubcategoryId,
  setSelectedSubcategoryId,
  familyMembers = [],
  selectedFamilyMemberId,
  setSelectedFamilyMemberId,
  rooms = [],
  selectedRoomId,
  setSelectedRoomId,
  title,
  setTitle,
  oemNumber,
  setOemNumber,
  storeName,
  setStoreName,
  price,
  setPrice,
  currency,
  setCurrency,
  link,
  setLink,
  imageUrl,
  setImageUrl,
  notes,
  setNotes,
  submitting,
  onAddItem,
  onCreateCategory,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [fetchingMeta, setFetchingMeta] = useState<boolean>(false);
  const [newSubCatName, setNewSubCatName] = useState<string>("");

  // Toggles for collapsible sections
  const [showSubcatsSection, setShowSubcatsSection] = useState<boolean>(false);
  const [showFamilySection, setShowFamilySection] = useState<boolean>(false);
  const [showRoomSection, setShowRoomSection] = useState<boolean>(false);

  const parentCategories = categories.filter((c) => !c.parentId);
  const subcategories = categories.filter(
    (c) => c.parentId === selectedParentId,
  );

  const selectedParentName =
    parentCategories.find((c) => c.id === selectedParentId)?.name ||
    "Не выбрана";
  const selectedSubcatName =
    subcategories.find((c) => c.id === selectedSubcategoryId)?.name ||
    "— Нет —";
  const selectedFamilyName =
    familyMembers.find((m) => m.id === selectedFamilyMemberId)?.name ||
    "— Нет —";
  const selectedRoomName =
    rooms.find((r) => r.id === selectedRoomId)?.name || "— Нет —";

  const handleFetchMetadata = async () => {
    if (!link.trim()) {
      Alert.alert("Ошибка", "Введите ссылку на товар");
      return;
    }

    setFetchingMeta(true);
    try {
      const meta = await fetchLinkMetadata(link.trim());
      if (meta.title) setTitle(meta.title);
      if (meta.price) setPrice(meta.price);
      if (meta.currency) setCurrency(meta.currency);
      if (meta.imageUrl) setImageUrl(meta.imageUrl);
      if (meta.storeName) setStoreName(meta.storeName);

      Alert.alert("Успешно", "Данные успешно загружены!");
    } catch (error: any) {
      Alert.alert(
        "Ошибка",
        "Не удалось автоматически загрузить данные по ссылке. Заполните вручную.",
      );
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCatName.trim()) return;
    const createdId = await onCreateCategory(
      newSubCatName.trim(),
      selectedParentId,
    );
    if (createdId && typeof createdId === "string") {
      setSelectedSubcategoryId(createdId);
    }
    setNewSubCatName("");
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("addNewItem") || "Добавить в каталог"}
        </Text>

        {/* TOP INPUTS */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Ссылка на магазин в интернете"
          placeholderTextColor="#888"
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.fetchBtn, { backgroundColor: "#e8f5e9" }]}
          onPress={handleFetchMetadata}
          disabled={fetchingMeta}
        >
          {fetchingMeta ? (
            <ActivityIndicator size="small" color="#2e7d32" />
          ) : (
            <Text style={{ color: "#2e7d32", fontWeight: "bold" }}>
              ⚡ Заполнить данные из ссылки
            </Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Название (напр., Дрель, Куртка, Масло)"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
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
          placeholder="Артикул / Модель / OEM номер"
          placeholderTextColor="#888"
          value={oemNumber}
          onChangeText={setOemNumber}
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
          placeholder="Магазин (напр., Biltema, Mekonomen)"
          placeholderTextColor="#888"
          value={storeName}
          onChangeText={setStoreName}
        />

        {/* Price & Currency */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 2,
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Цена"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
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
            placeholder="Валюта"
            placeholderTextColor="#888"
            value={currency}
            onChangeText={setCurrency}
          />
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Ссылка на фото (URL)"
          placeholderTextColor="#888"
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input,
            {
              height: 70,
              textAlignVertical: "top",
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Заметки, спецификации, допуски"
          placeholderTextColor="#888"
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={onAddItem}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Сохранить в каталог</Text>
          )}
        </TouchableOpacity>

        {/* STYLISH BOTTOM CARD FOR OPTIONAL BINDINGS */}
        <View
          style={[
            styles.extraCard,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.extraCardHeader}>
            <Text
              style={{ color: colors.text, fontWeight: "bold", fontSize: 14 }}
            >
              📌 Дополнительные привязки
            </Text>
          </View>

          {/* Parent Categories */}
          <View style={{ marginBottom: 12 }}>
            <Text style={[styles.label, { color: colors.subText }]}>
              Категория:{" "}
              <Text style={{ color: colors.text, fontWeight: "bold" }}>
                {selectedParentName}
              </Text>
            </Text>
            <View style={styles.categoriesContainer}>
              {parentCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    selectedParentId === cat.id && styles.categoryChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedParentId(cat.id || null);
                    setSelectedSubcategoryId(null);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: colors.text },
                      selectedParentId === cat.id &&
                        styles.categoryTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* SUBCATEGORIES ACCORDION */}
          <View style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={[
                styles.accordionToggle,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setShowSubcatsSection(!showSubcatsSection)}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>
                📁 Подкатегория:{" "}
                <Text style={{ fontWeight: "bold" }}>{selectedSubcatName}</Text>
              </Text>
              <Text style={{ color: colors.subText, fontSize: 12 }}>
                {showSubcatsSection ? "▲ Скрыть" : "▼ Изменить"}
              </Text>
            </TouchableOpacity>

            {showSubcatsSection && (
              <View
                style={[
                  styles.accordionContent,
                  { borderColor: colors.border },
                ]}
              >
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        marginBottom: 0,
                        backgroundColor: colors.card,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="+ Новая подкатегория"
                    placeholderTextColor="#888"
                    value={newSubCatName}
                    onChangeText={setNewSubCatName}
                  />
                  <TouchableOpacity
                    style={styles.addSubCategoryBtn}
                    onPress={handleAddSubCategory}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                    >
                      Добавить
                    </Text>
                  </TouchableOpacity>
                </View>

                {subcategories.length > 0 ? (
                  <View style={styles.categoriesContainer}>
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                        selectedSubcategoryId === null &&
                          styles.categoryChipSelected,
                      ]}
                      onPress={() => setSelectedSubcategoryId(null)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: colors.text },
                          selectedSubcategoryId === null &&
                            styles.categoryTextSelected,
                        ]}
                      >
                        — Нет —
                      </Text>
                    </TouchableOpacity>

                    {subcategories.map((sub) => (
                      <TouchableOpacity
                        key={sub.id}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                          selectedSubcategoryId === sub.id &&
                            styles.categoryChipSelected,
                        ]}
                        onPress={() => setSelectedSubcategoryId(sub.id || null)}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            { color: colors.text },
                            selectedSubcategoryId === sub.id &&
                              styles.categoryTextSelected,
                          ]}
                        >
                          ↳ {sub.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text
                    style={{
                      color: colors.subText,
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    Нет подкатегорий. Создайте первую выше ↑
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* FAMILY MEMBER ACCORDION */}
          {familyMembers.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  styles.accordionToggle,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowFamilySection(!showFamilySection)}
              >
                <Text style={{ color: colors.text, fontSize: 13 }}>
                  👥 Член семьи:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {selectedFamilyName}
                  </Text>
                </Text>
                <Text style={{ color: colors.subText, fontSize: 12 }}>
                  {showFamilySection ? "▲ Скрыть" : "▼ Изменить"}
                </Text>
              </TouchableOpacity>

              {showFamilySection && (
                <View
                  style={[
                    styles.accordionContent,
                    { borderColor: colors.border },
                  ]}
                >
                  <View style={styles.categoriesContainer}>
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                        selectedFamilyMemberId === null &&
                          styles.categoryChipSelected,
                      ]}
                      onPress={() =>
                        setSelectedFamilyMemberId &&
                        setSelectedFamilyMemberId(null)
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: colors.text },
                          selectedFamilyMemberId === null &&
                            styles.categoryTextSelected,
                        ]}
                      >
                        — Нет —
                      </Text>
                    </TouchableOpacity>

                    {familyMembers.map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                          selectedFamilyMemberId === member.id &&
                            styles.categoryChipSelected,
                        ]}
                        onPress={() =>
                          setSelectedFamilyMemberId &&
                          setSelectedFamilyMemberId(member.id || null)
                        }
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            { color: colors.text },
                            selectedFamilyMemberId === member.id &&
                              styles.categoryTextSelected,
                          ]}
                        >
                          👤 {member.name}{" "}
                          {member.clothingSize
                            ? `(${member.clothingSize})`
                            : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ROOM ACCORDION (Home Organizer) */}
          {rooms.length > 0 && (
            <View style={{ marginBottom: 4 }}>
              <TouchableOpacity
                style={[
                  styles.accordionToggle,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowRoomSection(!showRoomSection)}
              >
                <Text style={{ color: colors.text, fontSize: 13 }}>
                  🏠 Комната:{" "}
                  <Text style={{ fontWeight: "bold" }}>{selectedRoomName}</Text>
                </Text>
                <Text style={{ color: colors.subText, fontSize: 12 }}>
                  {showRoomSection ? "▲ Скрыть" : "▼ Изменить"}
                </Text>
              </TouchableOpacity>

              {showRoomSection && (
                <View
                  style={[
                    styles.accordionContent,
                    { borderColor: colors.border },
                  ]}
                >
                  <View style={styles.categoriesContainer}>
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                        selectedRoomId === null && styles.categoryChipSelected,
                      ]}
                      onPress={() =>
                        setSelectedRoomId && setSelectedRoomId(null)
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: colors.text },
                          selectedRoomId === null &&
                            styles.categoryTextSelected,
                        ]}
                      >
                        — Нет —
                      </Text>
                    </TouchableOpacity>

                    {rooms.map((room) => (
                      <TouchableOpacity
                        key={room.id}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                          selectedRoomId === room.id &&
                            styles.categoryChipSelected,
                        ]}
                        onPress={() =>
                          setSelectedRoomId &&
                          setSelectedRoomId(room.id || null)
                        }
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            { color: colors.text },
                            selectedRoomId === room.id &&
                              styles.categoryTextSelected,
                          ]}
                        >
                          📍 {room.name} {room.floor ? `(${room.floor})` : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 4 },
  input: {
    height: 46,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 14,
  },
  fetchBtn: {
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryText: { fontSize: 13, fontWeight: "500" },
  categoryTextSelected: { color: "#fff", fontWeight: "bold" },
  addSubCategoryBtn: {
    backgroundColor: "#20c997",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    height: 42,
  },
  extraCard: {
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  extraCardHeader: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  accordionToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  accordionContent: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  submitBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  submitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
