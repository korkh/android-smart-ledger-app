import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useTheme } from "../../../../context/ThemeContext";
import { Category } from "../../../../domain/Category";
import { InventoryItem } from "../../../../domain/InventoryItem";
import { buildCategoryPath } from "../../../../services/categoriesService";
import { styles } from "../HomeScreen.styles";

interface EditItemModalProps {
  visible: boolean;
  item: InventoryItem | null;
  categories: Category[];
  onClose: () => void;
  onSave: (updatedItem: InventoryItem) => Promise<void>;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  item,
  categories,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [title, setTitle] = useState("");
  const [oemNumber, setOemNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("NOK");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    string | null
  >(null);
  const [saving, setSaving] = useState(false);

  // Populate form with existing item values when opened
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setOemNumber(item.oemNumber || "");
      setStoreName(item.storeName || "");
      setPrice(item.price ? item.price.toString() : "");
      setCurrency(item.currency || "NOK");
      setLink(item.link || "");
      setImageUrl(item.imageUrl || "");
      setNotes(item.notes || "");

      // Resolve category selection state
      const currentCat = categories.find((c) => c.id === item.categoryId);
      if (currentCat) {
        if (currentCat.parentId) {
          setSelectedParentId(currentCat.parentId);
          setSelectedSubcategoryId(currentCat.id || null);
        } else {
          setSelectedParentId(currentCat.id || null);
          setSelectedSubcategoryId(null);
        }
      }
    }
  }, [item, categories]);

  const handleSave = async () => {
    if (!item) return;

    if (!title.trim()) {
      Alert.alert(
        t("saveError") || "Ошибка сохранения",
        t("specifyTitleError") || "Укажите название",
      );
      return;
    }

    const targetCategoryId =
      selectedSubcategoryId || selectedParentId || item.categoryId;
    const categoryPath = buildCategoryPath(targetCategoryId, categories);

    setSaving(true);
    try {
      await onSave({
        ...item,
        title: title.trim(),
        oemNumber: oemNumber.trim(),
        storeName: storeName.trim(),
        price: parseFloat(price) || 0,
        currency: currency.trim() || "NOK",
        link: link.trim(),
        imageUrl: imageUrl.trim(),
        notes: notes.trim(),
        categoryId: targetCategoryId,
        categoryPath,
      });
      onClose();
    } catch (error: any) {
      Alert.alert(t("saveError") || "Ошибка сохранения", error.message);
    } finally {
      setSaving(false);
    }
  };

  const rootCategories = categories.filter((c) => !c.parentId);
  const subCategories = selectedParentId
    ? categories.filter((c) => c.parentId === selectedParentId)
    : [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
        }}
      >
        <View
          style={[
            styles.cardSection,
            { margin: 20, maxHeight: "85%", backgroundColor: colors.card },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("editItemTitle") || "Редактировать позицию"}
          </Text>

          <ScrollView style={{ marginBottom: 10 }}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder={t("titlePlaceholderEdit") || "Название"}
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
              placeholder={t("codePlaceholderEdit") || "Артикул / Модель / Код"}
              placeholderTextColor="#888"
              value={oemNumber}
              onChangeText={setOemNumber}
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
              placeholder={t("storePlaceholderEdit") || "Название магазина"}
              placeholderTextColor="#888"
              value={storeName}
              onChangeText={setStoreName}
            />

            <Text
              style={{ fontSize: 13, color: colors.subText, marginBottom: 6 }}
            >
              {t("categoryLabel") || "Категория:"}
            </Text>
            <View style={styles.categoriesContainer}>
              {rootCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.inputBg },
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

            {subCategories.length > 0 && (
              <View style={styles.categoriesContainer}>
                {subCategories.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: colors.inputBg },
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
            )}

            <View style={styles.row}>
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  {
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={t("pricePlaceholder") || "Цена"}
                placeholderTextColor="#888"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={[
                  styles.input,
                  styles.halfInput,
                  {
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={t("currencyPlaceholder") || "Валюта"}
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
              placeholder={t("linkPlaceholderEdit") || "Ссылка на магазин"}
              placeholderTextColor="#888"
              value={link}
              onChangeText={setLink}
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
              placeholder={t("imageUrlPlaceholderEdit") || "Ссылка на фото"}
              placeholderTextColor="#888"
              value={imageUrl}
              onChangeText={setImageUrl}
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
              placeholder={t("notesPlaceholderEdit") || "Заметки"}
              placeholderTextColor="#888"
              value={notes}
              onChangeText={setNotes}
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
              <Text style={styles.submitBtnText}>
                {t("cancelBtn") || "Отмена"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, { width: "48%" }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {t("saveChangesBtn") || "Сохранить"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
