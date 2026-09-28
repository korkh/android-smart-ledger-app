// React Native: Item details modal component
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../../context/ThemeContext";
import { InventoryItem } from "../../../../domain/InventoryItem";

interface ItemDetailModalProps {
  item: InventoryItem | null;
  visible: boolean;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const [fullImageVisible, setFullImageVisible] = useState(false);

  if (!item) return null;

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === "android") {
      ToastAndroid.show(
        (t("oemCopiedToastText") || "Код скопирован: ") + text,
        ToastAndroid.SHORT,
      );
    } else {
      Alert.alert(t("oemCopiedToast") || "Скопировано", text);
    }
  };

  const openStoreLink = async (url: string) => {
    let formattedUrl = url.trim();
    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const supported = await Linking.canOpenURL(formattedUrl);
      if (supported) {
        await Linking.openURL(formattedUrl);
      } else {
        Alert.alert("Error", `Cannot open URL: ${formattedUrl}`);
      }
    } catch (e) {
      Alert.alert("Error", "Error opening link");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.inputBg }]}
          >
            <Text style={[styles.closeBtnText, { color: colors.text }]}>
              ✕ {t("closeBtn") || "Закрыть"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Image */}
          {item.imageUrl ? (
            <TouchableOpacity onPress={() => setFullImageVisible(true)}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <Text style={[styles.zoomHint, { color: colors.subText }]}>
                {t("zoomHint") || "🔍 Нажмите для увеличения"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.image,
                styles.noImage,
                { backgroundColor: colors.inputBg },
              ]}
            >
              <Text style={{ color: colors.subText }}>
                {t("noImage") || "Нет фото"}
              </Text>
            </View>
          )}

          {/* Category Badge */}
          {item.categoryPath && (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: isDarkMode ? "#1e293b" : "#e7f5ff",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isDarkMode ? "#38bdf8" : "#007AFF",
                }}
              >
                {item.categoryPath}
              </Text>
            </View>
          )}

          {/* Details */}
          <Text style={[styles.title, { color: colors.text }]}>
            {item.title}
          </Text>

          {item.price ? (
            <Text style={styles.price}>
              {item.price} {item.currency || "NOK"}
            </Text>
          ) : null}

          {/* OEM Section with 1-Click Copy */}
          {item.oemNumber ? (
            <TouchableOpacity
              style={[
                styles.oemContainer,
                {
                  backgroundColor: isDarkMode ? "#1e293b" : "#e7f5ff",
                  borderColor: isDarkMode ? "#334155" : "#a5d8ff",
                },
              ]}
              onPress={() => copyToClipboard(item.oemNumber!)}
            >
              <Text
                style={[
                  styles.oemLabel,
                  { color: isDarkMode ? "#38bdf8" : "#1971c2" },
                ]}
              >
                {t("oemLabelClick") || "Код / OEM (нажмите чтобы скопировать):"}
              </Text>
              <Text
                style={[
                  styles.oemValue,
                  { color: isDarkMode ? "#7dd3fc" : "#1864ab" },
                ]}
              >
                📋 {item.oemNumber}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Store Info & Link Button */}
          {item.storeName ? (
            <Text style={[styles.metaText, { color: colors.subText }]}>
              {t("storeLabel") || "Магазин:"} {item.storeName}
            </Text>
          ) : null}

          {item.link ? (
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => openStoreLink(item.link!)}
            >
              <Text style={styles.linkBtnText}>
                {t("openInStoreBtn") || "🔗 Открыть в магазине"}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Notes */}
          {item.notes ? (
            <View
              style={[
                styles.notesCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.notesTitle, { color: colors.subText }]}>
                {t("notesAndSpecsTitle") || "Заметки / Спецификации:"}
              </Text>
              <Text style={[styles.notesText, { color: colors.text }]}>
                {item.notes}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Fullscreen Photo Modal */}
        <Modal
          visible={fullImageVisible}
          transparent={true}
          onRequestClose={() => setFullImageVisible(false)}
        >
          <View style={styles.fullImageContainer}>
            <TouchableOpacity
              style={styles.fullImageCloseBtn}
              onPress={() => setFullImageVisible(false)}
            >
              <Text style={styles.fullImageCloseText}>
                ✕ {t("closeBtn") || "Закрыть"}
              </Text>
            </TouchableOpacity>
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  closeBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  zoomHint: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2b8a3e",
    marginBottom: 16,
  },
  oemContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  oemLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  oemValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  metaText: {
    fontSize: 14,
    marginBottom: 12,
  },
  linkBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  linkBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  notesCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
  },
  fullImageContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  fullImageCloseText: {
    color: "#fff",
    fontWeight: "bold",
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
});
