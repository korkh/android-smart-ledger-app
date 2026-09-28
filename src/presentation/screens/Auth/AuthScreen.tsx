import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { loginUser, registerUser } from "../../../services/authService";
import { styles } from "./AuthScreen.styles";

export default function AuthScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Submit authentication form
  const handleAuth = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("fillAllFields") || "Пожалуйста, заполните все поля",
      );
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
        Alert.alert(
          t("successTitle") || "Успех",
          t("accountCreated") || "Аккаунт успешно создан!",
        );
      }
    } catch (error: any) {
      Alert.alert(t("authError") || "Ошибка авторизации", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {isLogin ? t("loginTitle") : t("registerTitle")}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        placeholder={t("emailPlaceholder")}
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
        placeholder={t("passwordPlaceholder")}
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? t("loginBtn") : t("registerBtn")}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsLogin(!isLogin)}
        style={styles.switchBtn}
      >
        <Text style={[styles.switchBtnText, { color: colors.subText }]}>
          {isLogin ? t("noAccount") : t("hasAccount")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
