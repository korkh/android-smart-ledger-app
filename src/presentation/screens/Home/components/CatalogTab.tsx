import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { Category } from "../../../../domain/Category";
import { InventoryItem } from "../../../../domain/InventoryItem";
import { importBulkItems } from "../../../../services/itemsService";
import { styles } from "../HomeScreen.styles";
import { ItemDetailModal } from "./ItemDetailModal";

type SortOption = "nameAsc" | "nameDesc" | "priceAsc" | "priceDesc";

interface CatalogTabProps {
  userId: string;
  items: InventoryItem[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCatId: string | null;
  setFilterCatId: (id: string | null) => void;
  filterSubCatId: string | null;
  setFilterSubCatId: (id: string | null) => void;
  onDeleteItem: (id?: string, title?: string) => void;
  onEditItem: (item: InventoryItem) => void;
  onRefreshItems: () => Promise<void>;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  userId,
  items,
  categories,
  searchQuery,
  setSearchQuery,
  filterCatId,
  setFilterCatId,
  filterSubCatId,
  setFilterSubCatId,
  onDeleteItem,
  onEditItem,
  onRefreshItems,
}) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();

  // Selected Item for Detail Modal
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<InventoryItem | null>(null);

  // Sorting state
  const [sortOption, setSortOption] = useState<SortOption>("nameAsc");

  const rootCategories = categories.filter((c) => !c.parentId);
  const filterSubCategories = filterCatId
    ? categories.filter((c) => c.parentId === filterCatId)
    : [];

  const parseCSVContent = (
    csvText: string,
  ): Omit<InventoryItem, "id" | "userId" | "createdAt">[] => {
    const cleanText = csvText.replace(/^\uFEFF/, "");
    const lines = cleanText.split(/\r?\n/).filter((line) => line.trim() !== "");

    if (lines.length < 2) return [];

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ";" && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    };

    const dataRows = lines.slice(1);

    return dataRows.map((line) => {
      const fields = parseCSVLine(line);
      const title = fields[0] || "";
      const categoryPath = fields[1] || "";
      const oemNumber = fields[2] || "";
      const storeName = fields[3] || "";
      const price = parseFloat(fields[4]) || 0;
      const currency = fields[5] || "NOK";
      const link = fields[6] || "";
      const notes = fields[7] || "";

      const matchedCat = categories.find((c) => c.name === categoryPath);
      const categoryId = matchedCat?.id || categories[0]?.id || "";

      return {
        title,
        categoryId,
        categoryPath,
        oemNumber,
        storeName,
        price,
        currency,
        link,
        notes,
      };
    });
  };

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsedItems = parseCSVContent(fileContent);

      if (parsedItems.length === 0) {
        Alert.alert(
          t("importError") || "Ошибка импорта",
          t("csvParseError") || "Файл пуст или имеет неверный формат CSV",
        );
        return;
      }

      await importBulkItems(userId, parsedItems);
      await onRefreshItems();
      Alert.alert(
        "OK",
        `${t("importSuccess") || "Загружено позиций из CSV:"} ${parsedItems.length}`,
      );
    } catch (error: any) {
      Alert.alert(t("importError") || "Ошибка импорта", error.message);
    }
  };

  const handleCopyOem = async (oem?: string) => {
    if (!oem) return;
    await Clipboard.setStringAsync(oem);
    Alert.alert(
      "OK",
      `${t("oemCopiedToast") || "Номер скопирован в буфер обмена"}: "${oem}"`,
    );
  };

  const handleExportCSV = async () => {
    if (items.length === 0) {
      Alert.alert(
        t("exportError") || "Ошибка экспорта",
        t("exportEmptyError") || "Каталог пуст. Нечего экспортировать.",
      );
      return;
    }

    try {
      const headers = [
        "Title",
        "Category",
        "Code/OEM",
        "Store",
        "Price",
        "Currency",
        "Link",
        "Notes",
      ];

      const escapeCsvField = (text?: string | number) => {
        if (text === undefined || text === null) return '""';
        const str = String(text).replace(/"/g, '""');
        return `"${str}"`;
      };

      const csvRows = items.map((item) => {
        return [
          escapeCsvField(item.title),
          escapeCsvField(item.categoryPath || t("uncategorized")),
          escapeCsvField(item.oemNumber || ""),
          escapeCsvField(item.storeName || ""),
          item.price || 0,
          escapeCsvField(item.currency || "NOK"),
          escapeCsvField(item.link || ""),
          escapeCsvField(item.notes || ""),
        ].join(";");
      });

      const csvContent = "\uFEFF" + [headers.join(";"), ...csvRows].join("\n");
      const fileUri = `${FileSystem.documentDirectory}catalog_export.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: t("exportCsv") || "Экспорт CSV",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert(
          t("exportError") || "Ошибка экспорта",
          t("fileSharingUnavailable") ||
            "Функция обмена файлами недоступна на данном устройстве",
        );
      }
    } catch (error: any) {
      Alert.alert(t("exportError") || "Ошибка экспорта", error.message);
    }
  };

  // Filter and Sort items logic
  const filteredAndSortedItems = items
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.oemNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesCategory = true;

      if (filterSubCatId) {
        matchesCategory = item.categoryId === filterSubCatId;
      } else if (filterCatId) {
        const subCatIds = categories
          .filter((c) => c.parentId === filterCatId)
          .map((c) => c.id);

        matchesCategory =
          item.categoryId === filterCatId ||
          (!!item.categoryId && subCatIds.includes(item.categoryId));
      }

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === "nameAsc") {
        return a.title.localeCompare(b.title);
      }
      if (sortOption === "nameDesc") {
        return b.title.localeCompare(a.title);
      }
      if (sortOption === "priceAsc") {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortOption === "priceDesc") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredAndSortedItems}
        keyExtractor={(item) => item.id || Math.random().toString()}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            {/* Search Input */}
            <TextInput
              style={[
                styles.input,
                styles.searchBar,
                {
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  borderColor: colors.border,
                  marginBottom: 8,
                },
              ]}
              placeholder={
                t("searchPlaceholder") || "🔍 Поиск по названию, коду..."
              }
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {/* CSV Action Buttons */}
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    flex: 1,
                    marginTop: 0,
                    marginRight: 6,
                    paddingVertical: 10,
                    backgroundColor: "#007AFF",
                    alignItems: "center",
                  },
                ]}
                onPress={handleImportCSV}
              >
                <Text style={styles.submitBtnText}>
                  {t("importCsv") || "📤 Импорт CSV"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    flex: 1,
                    marginTop: 0,
                    marginLeft: 6,
                    paddingVertical: 10,
                    backgroundColor: "#34C759",
                    alignItems: "center",
                  },
                ]}
                onPress={handleExportCSV}
              >
                <Text style={styles.submitBtnText}>
                  {t("exportCsv") || "📥 Экспорт CSV"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.inputBg },
                  filterCatId === null && styles.categoryChipSelected,
                ]}
                onPress={() => {
                  setFilterCatId(null);
                  setFilterSubCatId(null);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: colors.text },
                    filterCatId === null && styles.categoryTextSelected,
                  ]}
                >
                  {t("allFilter") || "Все"}
                </Text>
              </TouchableOpacity>

              {rootCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.inputBg },
                    filterCatId === cat.id && styles.categoryChipSelected,
                  ]}
                  onPress={() => {
                    setFilterCatId(cat.id || null);
                    setFilterSubCatId(null);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: colors.text },
                      filterCatId === cat.id && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Subcategory Filter Chips */}
            {filterSubCategories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 6 }}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.inputBg },
                    filterSubCatId === null && styles.categoryChipSelected,
                  ]}
                  onPress={() => setFilterSubCatId(null)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: colors.text },
                      filterSubCatId === null && styles.categoryTextSelected,
                    ]}
                  >
                    {t("allSubcategoriesFilter") || "Все подкатегории"}
                  </Text>
                </TouchableOpacity>

                {filterSubCategories.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: colors.inputBg },
                      filterSubCatId === sub.id && styles.categoryChipSelected,
                    ]}
                    onPress={() => setFilterSubCatId(sub.id || null)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: colors.text },
                        filterSubCatId === sub.id &&
                          styles.categoryTextSelected,
                      ]}
                    >
                      ↳ {sub.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Sorting Bar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
                paddingHorizontal: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.subText,
                  marginRight: 6,
                }}
              >
                {t("sortLabel") || "Сортировка:"}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { key: "nameAsc", label: t("sortNameAsc") || "А-Я" },
                  { key: "nameDesc", label: t("sortNameDesc") || "Я-А" },
                  { key: "priceAsc", label: t("sortPriceAsc") || "Цена ⬆" },
                  { key: "priceDesc", label: t("sortPriceDesc") || "Цена ⬇" },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.key}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor:
                        sortOption === s.key ? "#007AFF" : colors.inputBg,
                      marginRight: 6,
                    }}
                    onPress={() => setSortOption(s.key as SortOption)}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: sortOption === s.key ? "#fff" : colors.text,
                      }}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.subText }]}>
            {t("emptyCatalog") || "Ничего не найдено в каталоге"}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              onPress={() => setSelectedDetailItem(item)}
              activeOpacity={0.7}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              ) : null}

              <View style={styles.itemInfo}>
                {/* Category Badge - FIXED dark theme background */}
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: isDarkMode ? "#1e293b" : "#e7f5ff",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: isDarkMode ? "#38bdf8" : "#007AFF",
                    }}
                  >
                    {item.categoryPath || t("uncategorized")}
                  </Text>
                </View>

                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {item.title}
                </Text>

                {item.storeName ? (
                  <Text style={[styles.itemDetails, { color: colors.subText }]}>
                    🏪 {item.storeName}
                  </Text>
                ) : null}

                {item.oemNumber ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 2,
                    }}
                  >
                    <Text style={styles.oemTag}>
                      Code/OEM: {item.oemNumber}
                    </Text>
                    <TouchableOpacity
                      style={{
                        marginLeft: 6,
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                        backgroundColor: colors.inputBg,
                        borderRadius: 4,
                      }}
                      onPress={() => handleCopyOem(item.oemNumber)}
                    >
                      <Text style={{ fontSize: 12 }}>📋</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {item.price > 0 && (
                  <Text style={[styles.itemDetails, { color: colors.subText }]}>
                    {item.price} {item.currency}
                  </Text>
                )}

                {item.notes ? (
                  <Text
                    numberOfLines={1}
                    style={[styles.itemDetails, { color: colors.subText }]}
                  >
                    {item.notes}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onEditItem(item)}
              >
                <Text style={{ fontSize: 16 }}>✏️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDeleteItem(item.id, item.title)}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Item Details Modal */}
      <ItemDetailModal
        item={selectedDetailItem}
        visible={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />
    </View>
  );
};
