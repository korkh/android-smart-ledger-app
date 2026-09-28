import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { Category } from "../../../../domain/Category";
import { styles } from "../HomeScreen.styles";

interface CategoriesTabProps {
  categories: Category[];
  selectedParentId: string | null;
  setSelectedParentId: (id: string | null) => void;
  newCatName: string;
  setNewCatName: (value: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id?: string, name?: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  selectedParentId,
  setSelectedParentId,
  newCatName,
  setNewCatName,
  onAddCategory,
  onDeleteCategory,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={[styles.cardSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("createCategoryTitle") || "Создать категорию / подкатегорию"}
        </Text>

        <Text style={{ fontSize: 13, color: colors.subText, marginBottom: 6 }}>
          {t("parentCategoryLabel") ||
            "Родительская категория (оставьте невыбранной для главной):"}
        </Text>

        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              { backgroundColor: colors.inputBg },
              selectedParentId === null && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedParentId(null)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: colors.text },
                selectedParentId === null && styles.categoryTextSelected,
              ]}
            >
              {t("mainCategoryChip") || "[Главная]"}
            </Text>
          </TouchableOpacity>

          {rootCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                { backgroundColor: colors.inputBg },
                selectedParentId === cat.id && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedParentId(cat.id || null)}
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
            selectedParentId
              ? t("subcategoryNamePlaceholder") || "Название подкатегории"
              : t("mainCategoryNamePlaceholder") || "Название главной категории"
          }
          placeholderTextColor="#888"
          value={newCatName}
          onChangeText={setNewCatName}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={onAddCategory}>
          <Text style={styles.submitBtnText}>
            {t("addCategoryBtn") || "Добавить категорию"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("allCategoriesTitle") || "Все категории"} ({categories.length})
      </Text>

      {rootCategories.map((root) => {
        const subs = categories.filter((c) => c.parentId === root.id);
        return (
          <View
            key={root.id}
            style={[styles.cardSection, { backgroundColor: colors.card }]}
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
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                {root.name}
              </Text>
              <TouchableOpacity
                onPress={() => onDeleteCategory(root.id, root.name)}
              >
                <Text style={{ color: "#d32f2f" }}>
                  {t("deleteBtn") || "Удалить"}
                </Text>
              </TouchableOpacity>
            </View>

            {subs.map((sub) => (
              <View
                key={sub.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                  paddingLeft: 12,
                }}
              >
                <Text style={{ color: colors.subText }}>↳ {sub.name}</Text>
                <TouchableOpacity
                  onPress={() => onDeleteCategory(sub.id, sub.name)}
                >
                  <Text style={{ color: "#d32f2f", fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
};
