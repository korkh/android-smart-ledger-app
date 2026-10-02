// All comments in code are in English as per project rules

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { FamilyMember } from "../../../../domain/FamilyMember";

interface FamilyTabProps {
  members: FamilyMember[];
  onAddMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({
  members,
  onAddMember,
  onDeleteMember,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [clothingSize, setClothingSize] = useState("");
  const [shoeSize, setShoeSize] = useState("");
  const [height, setHeight] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(
        t("errorTitle") || "Error",
        t("specifyNameError") || "Please specify name",
      );
      return;
    }

    onAddMember({
      name: name.trim(),
      relation: relation.trim(),
      clothingSize: clothingSize.trim(),
      shoeSize: shoeSize.trim(),
      height: height.trim(),
      notes: notes.trim(),
    });

    // Reset form fields
    setName("");
    setRelation("");
    setClothingSize("");
    setShoeSize("");
    setHeight("");
    setNotes("");
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: colors.text,
          marginBottom: 16,
        }}
      >
        👥 {t("familySizesTitle") || "Размеры одежды семьи"}
      </Text>

      {/* Add Member Form Card */}
      <View
        style={{
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 12,
          }}
        >
          {t("addFamilyMember") || "Добавить члена семьи"}
        </Text>

        <TextInput
          style={{
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 44,
            marginBottom: 12,
          }}
          placeholder={t("memberNamePlaceholder") || "Имя (напр., Анна, Данил)"}
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={{
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 44,
            marginBottom: 12,
          }}
          placeholder={t("relationPlaceholder") || "Роль (Жена, Сын и т.д.)"}
          placeholderTextColor="#888"
          value={relation}
          onChangeText={setRelation}
        />

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              height: 44,
            }}
            placeholder={t("clothingSizePlaceholder") || "Одежда (M, 128)"}
            placeholderTextColor="#888"
            value={clothingSize}
            onChangeText={setClothingSize}
          />
          <TextInput
            style={{
              flex: 1,
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              height: 44,
            }}
            placeholder={t("shoeSizePlaceholder") || "Обувь (38, 28)"}
            placeholderTextColor="#888"
            value={shoeSize}
            onChangeText={setShoeSize}
          />
        </View>

        <TextInput
          style={{
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 44,
            marginBottom: 12,
          }}
          placeholder={t("heightPlaceholder") || "Рост (напр., 125 см)"}
          placeholderTextColor="#888"
          value={height}
          onChangeText={setHeight}
        />

        <TextInput
          style={{
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 44,
            marginBottom: 16,
          }}
          placeholder={t("notesPlaceholder") || "Заметки (любимый бренд, цвет)"}
          placeholderTextColor="#888"
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={handleSave}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
            {t("saveMemberBtn") || "Сохранить параметры"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Members List */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: colors.text,
          marginBottom: 12,
        }}
      >
        {t("familyListTitle") || "Список членов семьи"} ({members.length})
      </Text>

      {members.map((member) => (
        <View
          key={member.id || member.name}
          style={{
            backgroundColor: colors.card,
            padding: 14,
            borderRadius: 10,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}
            >
              {member.name} {member.relation ? `(${member.relation})` : ""}
            </Text>
            {member.id && (
              <TouchableOpacity onPress={() => onDeleteMember(member.id!)}>
                <Text style={{ color: "#d32f2f", fontWeight: "bold" }}>
                  {t("deleteBtn") || "Удалить"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginTop: 8, gap: 4 }}>
            {member.clothingSize ? (
              <Text style={{ color: colors.subText }}>
                👕 Одежда: {member.clothingSize}
              </Text>
            ) : null}
            {member.shoeSize ? (
              <Text style={{ color: colors.subText }}>
                👟 Обувь: {member.shoeSize}
              </Text>
            ) : null}
            {member.height ? (
              <Text style={{ color: colors.subText }}>
                📏 Рост: {member.height}
              </Text>
            ) : null}
            {member.notes ? (
              <Text style={{ color: colors.subText }}>
                📝 Заметки: {member.notes}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
