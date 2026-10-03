// All comments in code are in English as per project rules

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
import { FamilyMember } from "../../../domain/FamilyMember";
import { InventoryItem } from "../../../domain/InventoryItem";
import { Room } from "../../../domain/Room";
import { User } from "../../../domain/User";
import { Vehicle } from "../../../domain/Vehicle";
import {
  addCategory,
  buildCategoryPath,
  deleteCategory,
  fetchUserCategories,
} from "../../../services/categoriesService";
import {
  addFamilyMember,
  deleteFamilyMember,
  fetchUserFamilyMembers,
} from "../../../services/familyService";
import {
  addInventoryItem,
  deleteInventoryItem,
  fetchUserItems,
  updateInventoryItem,
} from "../../../services/itemsService";
import {
  addRoom,
  deleteRoom,
  fetchUserRooms,
} from "../../../services/roomsService";
import {
  addVehicle,
  deleteVehicle,
  fetchUserVehicles,
  updateVehicle,
} from "../../../services/vehiclesService";

import { SettingsScreen } from "../SettingsScreen/SettingsScreen";
import { AddItemTab } from "./components/AddItemTab";
import { CatalogTab } from "./components/CatalogTab";
import { EditItemModal } from "./components/EditItemModal";
import { EditVehicleModal } from "./components/EditVehicleModal";
import { styles } from "./HomeScreen.styles";

type TabType = "catalog" | "add" | "settings";

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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
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
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<
    string | null
  >(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState<string>("");

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [vehName, setVehName] = useState<string>("");
  const [vehVin, setVehVin] = useState<string>("");
  const [vehPhotoUrl, setVehPhotoUrl] = useState<string>("");
  const [vehOemNotes, setVehOemNotes] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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
      const [
        fetchedItems,
        fetchedCategories,
        fetchedVehicles,
        fetchedFamily,
        fetchedRooms,
      ] = await Promise.all([
        fetchUserItems(user.uid),
        fetchUserCategories(user.uid),
        fetchUserVehicles(user.uid),
        fetchUserFamilyMembers(user.uid),
        fetchUserRooms(user.uid),
      ]);

      setItems(fetchedItems);
      setCategories(fetchedCategories);
      setVehicles(fetchedVehicles);
      setFamilyMembers(fetchedFamily);
      setRooms(fetchedRooms);

      const roots = fetchedCategories.filter((c) => !c.parentId);
      if (roots.length > 0 && roots[0].id) {
        setSelectedParentId(roots[0].id);
      }

      if (fetchedVehicles.length > 0 && fetchedVehicles[0].id) {
        setSelectedVehicleId(fetchedVehicles[0].id);
      }
    } catch (error: any) {
      Alert.alert(t("errorTitle") || "Ошибка загрузки", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (): Promise<void> => {
    if (!title.trim()) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("enterItemName") || "Укажите название позиции",
      );
      return;
    }

    const targetCategoryId = selectedSubcategoryId || selectedParentId;
    if (!targetCategoryId) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("selectCategory") || "Выберите категорию",
      );
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
        familyMemberId: selectedFamilyMemberId || "",
        roomId: selectedRoomId || "",
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
      setSelectedFamilyMemberId(null);
      setSelectedRoomId(null);

      const updatedItems = await fetchUserItems(user.uid);
      setItems(updatedItems);
      setActiveTab("catalog");
      Alert.alert(
        t("successTitle") || "Успешно",
        t("itemSaved") || "Позиция сохранена в каталог!",
      );
    } catch (error: any) {
      Alert.alert(t("errorTitle") || "Ошибка сохранения", error.message);
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
    Alert.alert(
      t("successTitle") || "Успешно",
      t("itemUpdated") || "Данные позиции обновлены",
    );
  };

  const handleSaveUpdatedVehicle = async (
    updatedVehicle: Vehicle,
  ): Promise<void> => {
    if (!updatedVehicle.id) return;
    await updateVehicle(updatedVehicle.id, updatedVehicle);
    setVehicles((prev) =>
      prev.map((veh) => (veh.id === updatedVehicle.id ? updatedVehicle : veh)),
    );
    Alert.alert(
      t("successTitle") || "Успешно",
      t("vehicleUpdated") || "Данные автомобиля обновлены",
    );
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleDeleteItem = async (
    id?: string,
    itemTitle?: string,
  ): Promise<void> => {
    if (!id) return;

    Alert.alert(
      t("deleteItemTitle") || "Удаление позиции",
      `Вы уверены, что хотите удалить "${itemTitle || "эту позицию"}"?`,
      [
        { text: t("cancel") || "Отмена", style: "cancel" },
        {
          text: t("delete") || "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteInventoryItem(id);
              setItems((prev) => prev.filter((item) => item.id !== id));
            } catch (error: any) {
              Alert.alert(t("errorTitle") || "Ошибка удаления", error.message);
            }
          },
        },
      ],
    );
  };

  const handleAddCategory = async (): Promise<void> => {
    if (!newCatName.trim()) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("categoryNameRequired") || "Введите название",
      );
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
      Alert.alert(t("errorTitle") || "Ошибка добавления", error.message);
    }
  };

  const handleQuickCreateCategory = async (
    name: string,
    parentId?: string | null,
  ): Promise<string | void> => {
    try {
      const created = await addCategory(
        user.uid,
        name,
        parentId !== undefined ? parentId : selectedParentId,
      );
      setCategories((prev) => [...prev, created]);
      return created.id;
    } catch (error: any) {
      Alert.alert(t("errorTitle") || "Ошибка добавления", error.message);
    }
  };

  const handleDeleteCategory = async (
    catId?: string,
    catName?: string,
  ): Promise<void> => {
    if (!catId) return;
    Alert.alert(
      t("deleteCategoryTitle") || "Удаление",
      `Удалить категорию "${catName}"?`,
      [
        { text: t("cancel") || "Отмена", style: "cancel" },
        {
          text: t("delete") || "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(catId);
              setCategories((prev) =>
                prev.filter((c) => c.id !== catId && c.parentId !== catId),
              );
            } catch (error: any) {
              Alert.alert(t("errorTitle") || "Ошибка удаления", error.message);
            }
          },
        },
      ],
    );
  };

  const handleAddVehicle = async (): Promise<void> => {
    if (!vehName.trim()) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("vehicleNameRequired") || "Укажите марку/модель авто",
      );
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
      Alert.alert(
        t("successTitle") || "Успешно",
        t("vehicleAdded") || "Автомобиль добавлен!",
      );
    } catch (error: any) {
      Alert.alert(t("errorTitle") || "Ошибка сохранения авто", error.message);
    }
  };

  // Delete vehicle handler
  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await deleteVehicle(vehicleId); // вызываем функцию из vehiclesService
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      Alert.alert(
        t("successTitle") || "Успех",
        `${vehicles.find((v) => v.id === vehicleId)?.name} успешно удален из гаража.`,
      );
    } catch (error: any) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        error.message || "Не удалось удалить автомобиль.",
      );
    }
  };

  const handleAddFamilyMember = async (member: FamilyMember): Promise<void> => {
    if (!member.name.trim()) return;

    try {
      const created = await addFamilyMember({
        userId: user.uid,
        name: member.name.trim(),
        relation: member.relation?.trim() || "",
        clothingSize: member.clothingSize?.trim() || "",
        shoeSize: member.shoeSize?.trim() || "",
        height: member.height?.trim() || "",
        notes: member.notes?.trim() || "",
      });

      setFamilyMembers((prev) => [...prev, created]);
      Alert.alert(
        t("successTitle") || "Успешно",
        t("familyMemberSaved") || "Параметры члена семьи сохранены!",
      );
    } catch (error: any) {
      Alert.alert(t("errorTitle") || "Ошибка сохранения", error.message);
    }
  };

  const handleDeleteFamilyMember = async (id: string): Promise<void> => {
    Alert.alert(
      t("deleteTitle") || "Удаление",
      t("deleteFamilyMember") || "Удалить этого члена семьи?",
      [
        { text: t("cancel") || "Отмена", style: "cancel" },
        {
          text: t("delete") || "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFamilyMember(id);
              setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
            } catch (error: any) {
              Alert.alert(t("errorTitle") || "Ошибка удаления", error.message);
            }
          },
        },
      ],
    );
  };

  const handleAddRoom = async (
    roomData: Omit<Room, "id" | "userId">,
  ): Promise<void> => {
    try {
      const created = await addRoom({
        userId: user.uid,
        ...roomData,
      });
      setRooms((prev) => [...prev, created]);
      Alert.alert(
        t("successTitle") || "Успешно",
        t("roomAdded") || "Комната добавлена в организатор!",
      );
    } catch (error: any) {
      Alert.alert(t("errorTitle") || "Ошибка", error.message);
    }
  };

  const handleDeleteRoom = async (id: string): Promise<void> => {
    Alert.alert(
      t("deleteTitle") || "Удаление",
      t("deleteRoom") || "Удалить эту комнату?",
      [
        { text: t("cancel") || "Отмена", style: "cancel" },
        {
          text: t("delete") || "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoom(id);
              setRooms((prev) => prev.filter((r) => r.id !== id));
            } catch (error: any) {
              Alert.alert(t("errorTitle") || "Ошибка", error.message);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Toggle Settings */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("appTitle") || "Smart Ledger"}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (activeTab === "settings") {
              setActiveTab("catalog");
            } else {
              setActiveTab("settings");
            }
          }}
        >
          <Text style={{ fontSize: 22 }}>
            {activeTab === "settings" ? "❌" : "⚙️"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Bar (Catalog & Add) */}
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
                familyMembers={familyMembers}
                selectedFamilyMemberId={selectedFamilyMemberId}
                setSelectedFamilyMemberId={setSelectedFamilyMemberId}
                rooms={rooms}
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
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
                onCreateCategory={handleQuickCreateCategory}
              />
            )}
            {activeTab === "settings" && (
              <SettingsScreen
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
                categories={categories}
                selectedParentId={selectedParentId}
                setSelectedParentId={setSelectedParentId}
                newCatName={newCatName}
                setNewCatName={setNewCatName}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                familyMembers={familyMembers}
                onAddFamilyMember={handleAddFamilyMember}
                onDeleteFamilyMember={handleDeleteFamilyMember}
                rooms={rooms}
                onAddRoom={handleAddRoom}
                onDeleteRoom={handleDeleteRoom}
                onLogout={onLogout}
                onDeleteVehicle={(id) => handleDeleteVehicle(id)}
                onSelectVehicle={handleSelectVehicle}
              />
            )}
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
