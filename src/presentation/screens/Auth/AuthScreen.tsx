import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
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
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("fillAllFields") || "Пожалуйста, заполните все поля",
      );
      return;
    }

    if (!isLogin && password.length < 6) {
      Alert.alert(
        t("errorTitle") || "Ошибка",
        t("passwordLengthError") ||
          "Пароль должен содержать не менее 6 символов",
      );
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(trimmedEmail, password);
      } else {
        await registerUser(trimmedEmail, password);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
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
          placeholder={t("emailPlaceholder") || "Email"}
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
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
          placeholder={t("passwordPlaceholder") || "Пароль"}
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
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
          onPress={() => {
            setIsLogin(!isLogin);
            setEmail(""); // Очищаем email при переключении
            setPassword("");
          }}
          style={styles.switchBtn}
        >
          <Text style={[styles.switchBtnText, { color: colors.subText }]}>
            {isLogin ? t("noAccount") : t("hasAccount")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
