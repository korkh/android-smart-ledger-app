import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";

import { Category } from "../../../domain/Category";
import { InventoryItem } from "../../../domain/InventoryItem";
import { User } from "../../../domain/User";
import { Vehicle } from "../../../domain/Vehicle";
import {
  addCategory,
  buildCategoryPath,
  deleteCategory,
  fetchUserCategories,
} from "../../../services/categoriesService";
import {
  addInventoryItem,
  deleteInventoryItem,
  fetchUserItems,
  updateInventoryItem,
} from "../../../services/itemsService";
import {
  addVehicle,
  fetchUserVehicles,
  updateVehicle,
} from "../../../services/vehiclesService";

import { SettingsScreen } from "../SettingsScreen/SettingsScreen";
import { AddItemTab } from "./components/AddItemTab";
import { CatalogTab } from "./components/CatalogTab";
import { CategoriesTab } from "./components/CategoriesTab";
import { EditItemModal } from "./components/EditItemModal";
import { EditVehicleModal } from "./components/EditVehicleModal";
import { GarageTab } from "./components/GarageTab";
import { styles } from "./HomeScreen.styles";

type TabType = "catalog" | "add" | "garage" | "categories" | "settings";

interface HomeScreenProps {
  user: User;
  onLogout?: () => void;
}

export default function HomeScreen({
  user,
  onLogout,
}: HomeScreenProps): React.JSX.Element {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Edit Modals State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCatId, setFilterCatId] = useState<string | null>(null);
  const [filterSubCatId, setFilterSubCatId] = useState<string | null>(null);

  // Form State
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    string | null
  >(null);
  const [newCatName, setNewCatName] = useState<string>("");

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [vehName, setVehName] = useState<string>("");
  const [vehVin, setVehVin] = useState<string>("");
  const [vehPhotoUrl, setVehPhotoUrl] = useState<string>("");
  const [vehOemNotes, setVehOemNotes] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [oemNumber, setOemNumber] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("NOK");
  const [link, setLink] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [fetchedItems, fetchedCategories, fetchedVehicles] =
        await Promise.all([
          fetchUserItems(user.uid),
          fetchUserCategories(user.uid),
          fetchUserVehicles(user.uid),
        ]);

      setItems(fetchedItems);
      setCategories(fetchedCategories);
      setVehicles(fetchedVehicles);

      const roots = fetchedCategories.filter((c) => !c.parentId);
      if (roots.length > 0 && roots[0].id) {
        setSelectedParentId(roots[0].id);
      }

      if (fetchedVehicles.length > 0 && fetchedVehicles[0].id) {
        setSelectedVehicleId(fetchedVehicles[0].id);
      }
    } catch (error: any) {
      Alert.alert("Ошибка загрузки", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (): Promise<void> => {
    if (!title.trim()) {
      Alert.alert("Ошибка", "Укажите название позиции");
      return;
    }

    const targetCategoryId = selectedSubcategoryId || selectedParentId;
    if (!targetCategoryId) {
      Alert.alert("Ошибка", "Выберите категорию");
      return;
    }

    const categoryPath = buildCategoryPath(targetCategoryId, categories);

    setSubmitting(true);
    try {
      await addInventoryItem({
        userId: user.uid,
        title: title.trim(),
        categoryId: targetCategoryId,
        categoryPath,
        vehicleId: selectedVehicleId || "",
        oemNumber: oemNumber.trim(),
        storeName: storeName.trim(),
        price: parseFloat(price) || 0,
        currency: currency.trim() || "NOK",
        link: link.trim(),
        imageUrl: imageUrl.trim(),
        notes: notes.trim(),
      });

      setTitle("");
      setOemNumber("");
      setStoreName("");
      setPrice("");
      setLink("");
      setImageUrl("");
      setNotes("");

      const updatedItems = await fetchUserItems(user.uid);
      setItems(updatedItems);
      setActiveTab("catalog");
      Alert.alert("Успешно", "Позиция сохранена в каталог!");
    } catch (error: any) {
      Alert.alert("Ошибка сохранения", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveUpdatedItem = async (
    updatedItem: InventoryItem,
  ): Promise<void> => {
    if (!updatedItem.id) return;
    await updateInventoryItem(updatedItem.id, updatedItem);
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    Alert.alert("Успешно", "Данные позиции обновлены");
  };

  const handleSaveUpdatedVehicle = async (
    updatedVehicle: Vehicle,
  ): Promise<void> => {
    if (!updatedVehicle.id) return;
    await updateVehicle(updatedVehicle.id, updatedVehicle);
    setVehicles((prev) =>
      prev.map((veh) => (veh.id === updatedVehicle.id ? updatedVehicle : veh)),
    );
    Alert.alert("Успешно", "Данные автомобиля обновлены");
  };

  const handleDeleteItem = async (
    id?: string,
    itemTitle?: string,
  ): Promise<void> => {
    if (!id) return;

    Alert.alert(
      "Удаление позиции",
      `Вы уверены, что хотите удалить "${itemTitle || "эту позицию"}"?`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteInventoryItem(id);
              setItems((prev) => prev.filter((item) => item.id !== id));
            } catch (error: any) {
              Alert.alert("Ошибка удаления", error.message);
            }
          },
        },
      ],
    );
  };

  const handleAddCategory = async (): Promise<void> => {
    if (!newCatName.trim()) {
      Alert.alert("Ошибка", "Введите название");
      return;
    }

    try {
      const created = await addCategory(
        user.uid,
        newCatName.trim(),
        selectedParentId,
      );
      setCategories((prev) => [...prev, created]);
      setNewCatName("");
    } catch (error: any) {
      Alert.alert("Ошибка добавления", error.message);
    }
  };

  const handleDeleteCategory = async (
    catId?: string,
    catName?: string,
  ): Promise<void> => {
    if (!catId) return;
    Alert.alert("Удаление", `Удалить категорию "${catName}"?`, [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(catId);
            setCategories((prev) =>
              prev.filter((c) => c.id !== catId && c.parentId !== catId),
            );
          } catch (error: any) {
            Alert.alert("Ошибка удаления", error.message);
          }
        },
      },
    ]);
  };

  const handleAddVehicle = async (): Promise<void> => {
    if (!vehName.trim()) {
      Alert.alert("Ошибка", "Укажите марку/модель авто");
      return;
    }

    try {
      const created = await addVehicle({
        userId: user.uid,
        name: vehName.trim(),
        vin: vehVin.trim(),
        photoUrl: vehPhotoUrl.trim(),
        oemNotes: vehOemNotes.trim(),
      });

      setVehicles((prev) => [...prev, created]);
      setSelectedVehicleId(created.id || null);
      setVehName("");
      setVehVin("");
      setVehPhotoUrl("");
      setVehOemNotes("");
      Alert.alert("Успешно", "Автомобиль добавлен!");
    } catch (error: any) {
      Alert.alert("Ошибка сохранения авто", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Smart Ledger</Text>
        <TouchableOpacity onPress={() => setActiveTab("settings")}>
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "catalog" && styles.activeTabItem,
          ]}
          onPress={() => setActiveTab("catalog")}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.subText },
              activeTab === "catalog" && styles.activeTabText,
            ]}
          >
            📦 {t("catalog") || "Каталог"} ({items.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "add" && styles.activeTabItem]}
          onPress={() => setActiveTab("add")}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.subText },
              activeTab === "add" && styles.activeTabText,
            ]}
          >
            ➕ {t("add") || "Добавить"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "garage" && styles.activeTabItem,
          ]}
          onPress={() => setActiveTab("garage")}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.subText },
              activeTab === "garage" && styles.activeTabText,
            ]}
          >
            🚗 {t("garage") || "Гараж"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "categories" && styles.activeTabItem,
          ]}
          onPress={() => setActiveTab("categories")}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.subText },
              activeTab === "categories" && styles.activeTabText,
            ]}
          >
            🏷️ {t("categories") || "Категории"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Tab View */}
      <View style={styles.tabContent}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            {activeTab === "catalog" && (
              <CatalogTab
                userId={user.uid}
                items={items}
                categories={categories}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterCatId={filterCatId}
                setFilterCatId={setFilterCatId}
                filterSubCatId={filterSubCatId}
                setFilterSubCatId={setFilterSubCatId}
                onDeleteItem={handleDeleteItem}
                onEditItem={(item) => setEditingItem(item)}
                onRefreshItems={loadInitialData}
              />
            )}

            {activeTab === "add" && (
              <AddItemTab
                categories={categories}
                selectedParentId={selectedParentId}
                setSelectedParentId={setSelectedParentId}
                selectedSubcategoryId={selectedSubcategoryId}
                setSelectedSubcategoryId={setSelectedSubcategoryId}
                title={title}
                setTitle={setTitle}
                oemNumber={oemNumber}
                setOemNumber={setOemNumber}
                storeName={storeName}
                setStoreName={setStoreName}
                price={price}
                setPrice={setPrice}
                currency={currency}
                setCurrency={setCurrency}
                link={link}
                setLink={setLink}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                notes={notes}
                setNotes={setNotes}
                submitting={submitting}
                onAddItem={handleAddItem}
              />
            )}

            {activeTab === "garage" && (
              <GarageTab
                vehicles={vehicles}
                vehName={vehName}
                setVehName={setVehName}
                vehVin={vehVin}
                setVehVin={setVehVin}
                vehPhotoUrl={vehPhotoUrl}
                setVehPhotoUrl={setVehPhotoUrl}
                vehOemNotes={vehOemNotes}
                setVehOemNotes={setVehOemNotes}
                onAddVehicle={handleAddVehicle}
                onEditVehicle={(veh) => setEditingVehicle(veh)}
              />
            )}

            {activeTab === "categories" && (
              <CategoriesTab
                categories={categories}
                selectedParentId={selectedParentId}
                setSelectedParentId={setSelectedParentId}
                newCatName={newCatName}
                setNewCatName={setNewCatName}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {/* ВАЖНО: передаем пропс onLogout в SettingsScreen */}
            {activeTab === "settings" && <SettingsScreen onLogout={onLogout} />}
          </>
        )}
      </View>

      {/* Item Edit Modal */}
      <EditItemModal
        visible={!!editingItem}
        item={editingItem}
        categories={categories}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveUpdatedItem}
      />

      {/* Vehicle Edit Modal */}
      <EditVehicleModal
        visible={!!editingVehicle}
        vehicle={editingVehicle}
        onClose={() => setEditingVehicle(null)}
        onSave={handleSaveUpdatedVehicle}
      />
    </View>
  );
}
