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
import { fetchLinkMetadata } from "../../../../services/linkMetadataService";
import { styles } from "../HomeScreen.styles";

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
}) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const [loadingMeta, setLoadingMeta] = useState(false);

  const rootCategories = categories.filter((c) => !c.parentId);
  const subCategories = selectedParentId
    ? categories.filter((c) => c.parentId === selectedParentId)
    : [];

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

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.cardSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("addNewItem") || "Добавить в каталог"}
        </Text>

        {/* Ссылка и кнопка автозаполнения */}
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

        {/* Основная форма */}
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

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder={t("codePlaceholder") || "Артикул / Модель / OEM номер"}
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
          placeholder={t("storePlaceholder") || "Название магазина"}
          placeholderTextColor="#888"
          value={storeName}
          onChangeText={setStoreName}
        />

        <Text style={{ fontSize: 13, color: colors.subText, marginBottom: 6 }}>
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
                  selectedParentId === cat.id && styles.categoryTextSelected,
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
    </ScrollView>
  );
};
