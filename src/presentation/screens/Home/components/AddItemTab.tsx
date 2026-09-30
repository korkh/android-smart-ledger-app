import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { Category } from "../../../../domain/Category";
import { fetchProductByBarcode } from "../../../../services/barcodeService";
import { fetchLinkMetadata } from "../../../../services/linkMetadataService";
import { styles } from "../HomeScreen.styles";
import { BarcodeScannerModal } from "./BarcodeScannerModal";

interface AddItemTabProps {
  categories: Category[];
  selectedParentId: string | null;
  setSelectedParentId: (id: string | null) => void;
  selectedSubcategoryId: string | null;
  setSelectedSubcategoryId: (id: string | null) => void;
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
  // Callback to create a new category directly from AddItemTab
  onCreateCategory?: (
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
  const { colors, isDarkMode } = useTheme();
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingBarcode, setLoadingBarcode] = useState(false);

  // Scanner visibility state
  const [scannerVisible, setScannerVisible] = useState(false);

  // State for quick inline category creation when list is empty or needed
  const [quickCatName, setQuickCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  const rootCategories = categories.filter((c) => !c.parentId);
  const subCategories = selectedParentId
    ? categories.filter((c) => c.parentId === selectedParentId)
    : [];

  const handleBarCodeScanned = async (scannedData: string) => {
    setOemNumber(scannedData);
    setLoadingBarcode(true);

    try {
      const productInfo = await fetchProductByBarcode(scannedData);
      if (productInfo) {
        if (productInfo.title && !title) setTitle(productInfo.title);
        if (productInfo.imageUrl && !imageUrl)
          setImageUrl(productInfo.imageUrl);
        if (productInfo.storeName && !storeName)
          setStoreName(productInfo.storeName);

        Alert.alert(
          t("successTitle") || "Успешно",
          t("barcodeFoundAlert") ||
            "Товар найден в базе по штрих-коду и данные заполнены!",
        );
      } else {
        const alertTitle = t("infoTitle") || "Штрих-код сохранен";
        const alertMessage = (
          t("barcodeNotFoundDetailed") ||
          "Штрих-код «{code}» записан в артикул.\n\nТовар не найден в публичной базе."
        ).replace("{code}", scannedData);

        Alert.alert(alertTitle, alertMessage);
      }
    } catch (error) {
      console.error("Barcode lookup error:", error);
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("barcodeErrorAlert") ||
          "Не удалось проверить штрих-код в базе, но он сохранен в артикул.",
      );
    } finally {
      setLoadingBarcode(false);
    }
  };

  const handleAutoFetch = async () => {
    if (!link) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("enterLinkFirstAlert") || "Сначала вставьте ссылку в поле",
      );
      return;
    }

    setLoadingMeta(true);
    try {
      const data = await fetchLinkMetadata(link);

      if (data.title) setTitle(data.title);
      if (data.price) setPrice(data.price);
      if (data.currency) setCurrency(data.currency);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.storeName) setStoreName(data.storeName);

      Alert.alert(
        t("successTitle") || "Успешно",
        t("metadataSuccessAlert") ||
          "Данные товара успешно загружены из ссылки!",
      );
    } catch (e) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("metadataErrorAlert") || "Не удалось извлечь данные со страницы",
      );
    } finally {
      setLoadingMeta(false);
    }
  };

  // Quick category creation handler
  const handleQuickCreateCategory = async () => {
    if (!quickCatName.trim() || !onCreateCategory) return;

    setCreatingCat(true);
    try {
      const newId = await onCreateCategory(
        quickCatName.trim(),
        selectedParentId,
      );
      setQuickCatName("");
      if (newId && typeof newId === "string") {
        if (!selectedParentId) {
          setSelectedParentId(newId);
        } else {
          setSelectedSubcategoryId(newId);
        }
      }
    } catch (error: any) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        error.message || "Не удалось создать категорию",
      );
    } finally {
      setCreatingCat(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.cardSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("addNewItem") || "Добавить в каталог"}
        </Text>

        {/* Link and Auto-fetch button */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("linkPlaceholder") || "Ссылка на интернет-магазин"}
          placeholderTextColor="#888"
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={{
            backgroundColor: isDarkMode ? "#122b22" : "#e6fcf5",
            borderWidth: 1,
            borderColor: "#20c997",
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
          onPress={handleAutoFetch}
          disabled={loadingMeta}
        >
          {loadingMeta ? (
            <ActivityIndicator color="#0ca678" />
          ) : (
            <Text style={{ color: "#20c997", fontWeight: "700", fontSize: 13 }}>
              {t("autoFetchBtn") || "⚡ Заполнить данные из ссылки"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Main Form Fields */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("titlePlaceholder") || "Название"}
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        {/* OEM Number / Barcode input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.inputBg,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12,
            paddingRight: 6,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              height: 48,
              paddingHorizontal: 12,
              color: colors.text,
              fontSize: 14,
            }}
            placeholder={t("codePlaceholder") || "Артикул / Модель / OEM номер"}
            placeholderTextColor="#888"
            value={oemNumber}
            onChangeText={setOemNumber}
            autoCapitalize="characters"
          />
          {loadingBarcode ? (
            <ActivityIndicator
              size="small"
              color="#20c997"
              style={{ width: 36, height: 36 }}
            />
          ) : (
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDarkMode ? "#334155" : "#cbd5e1",
                borderRadius: 6,
              }}
              onPress={() => setScannerVisible(true)}
            >
              <Text style={{ fontSize: 16 }}>📷</Text>
            </TouchableOpacity>
          )}
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
          placeholder={t("storePlaceholder") || "Название магазина"}
          placeholderTextColor="#888"
          value={storeName}
          onChangeText={setStoreName}
        />

        {/* Category Selection & Quick Creation */}
        <Text style={{ fontSize: 13, color: colors.subText, marginBottom: 6 }}>
          {t("categoryLabel") || "Категория:"}
        </Text>

        {rootCategories.length > 0 ? (
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
                    selectedParentId === cat.id && styles.categoryTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text
            style={{
              fontSize: 12,
              color: colors.subText,
              marginBottom: 8,
              fontStyle: "italic",
            }}
          >
            {t("noCategoriesYet") ||
              "Категорий пока нет. Создайте первую ниже:"}
          </Text>
        )}

        {/* Quick Add Category Input directly in AddItemTab */}
        <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                marginBottom: 0,
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.border,
                height: 42,
              },
            ]}
            placeholder={
              selectedParentId
                ? t("newSubcategoryPlaceholder") || "+ Новая подкатегория"
                : t("newCategoryPlaceholder") || "+ Новая категория"
            }
            placeholderTextColor="#888"
            value={quickCatName}
            onChangeText={setQuickCatName}
          />
          <TouchableOpacity
            style={{
              backgroundColor: "#20c997",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
              borderRadius: 8,
              height: 42,
            }}
            onPress={handleQuickCreateCategory}
            disabled={creatingCat || !quickCatName.trim()}
          >
            {creatingCat ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
                {t("addBtn") || "Добавить"}
              </Text>
            )}
          </TouchableOpacity>
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
            placeholder={t("price") || "Цена"}
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
            placeholder={t("currency") || "Валюта"}
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
          placeholder={t("imageUrlPlaceholder") || "Ссылка на фото (URL)"}
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
          placeholder={t("notesPlaceholder") || "Заметки, спецификации"}
          placeholderTextColor="#888"
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={onAddItem}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {t("saveBtn") || "Сохранить в каталог"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Barcode Scanner Modal Component */}
      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarCodeScanned}
      />
    </ScrollView>
  );
};
