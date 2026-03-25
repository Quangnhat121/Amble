import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
} from "../../constants/theme";
import { usePartnerAuthStore } from "../../store/partnerAuthStore";
import AmbleLogo from "../../components/AmbleLogo";

const PARTNER_PRIMARY = "#FF6B35";
const PARTNER_GRAD: [string, string] = ["#FF6B35", "#FFD700"];
const LOGIN_GRAD: [string, string] = ["#171A21", "#2A2F3A"];

export default function PartnerLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = usePartnerAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/dashboard");
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={PARTNER_GRAD}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.headerBackBtn}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <AmbleLogo size="lg" textColor="#FFFFFF" />
          </View>

          <Text style={styles.headerTitle}>Đăng Nhập Đối Tác</Text>
          <Text style={styles.headerSubtitle}>Quản lý nhà hàng của bạn</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={Colors.textMuted}
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="partner@rooftop.vn"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#636161"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#636161"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={LOGIN_GRAD}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Đăng Nhập Đối Tác</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerCta}
            activeOpacity={0.86}
            onPress={() => router.push("/(partner-auth)/partner-register")}
          >
            <Ionicons
              name="business-outline"
              size={18}
              color={PARTNER_PRIMARY}
            />
            <Text style={styles.registerCtaText}>
              Chủ nhà hàng mới? Đăng ký ngay
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={PARTNER_PRIMARY}
            />
          </TouchableOpacity>

          <Text style={styles.joinHint}>
            Tham gia hệ thống Amble Partner ngay hôm nay!
          </Text>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push("/(auth)/login")}
          >
            <View style={styles.backRow}>
              <Ionicons name="arrow-back" size={16} color={Colors.textMuted} />
              <Text style={styles.backText}>Quay lại đăng nhập khách hàng</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F7" },
  scroll: { flexGrow: 1 },

  header: {
    paddingTop: 64,
    paddingBottom: 34,
    paddingHorizontal: 24,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },

  headerBackBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  headerTitle: {
    paddingTop: 7,
    marginTop: -7,
    fontSize: 30,
    lineHeight: 28,
    fontWeight: "900",
    color: "#fff",
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "500",
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 28,
    paddingBottom: 22,
    gap: 16,
    backgroundColor: "#fff",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 64,
    backgroundColor: "#eeeeee",
  },

  inputIcon: { marginRight: Spacing.sm },

  input: { flex: 1, ...Typography.body, color: Colors.text },

  eyeBtn: { padding: 4 },

  loginBtn: {
    marginTop: 20,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#eeeeee",
  },

  btnDisabled: { opacity: 0.7 },

  btnGradient: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },

  loginBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },

  dividerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginHorizontal: Spacing.sm,
    fontSize: 13,
  },

  registerCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E8906E",
    backgroundColor: "#FFF9F4",
    minHeight: 64,
    marginBottom: 20,
  },

  registerCtaText: {
    fontSize: 16,
    fontWeight: "700",
    color: PARTNER_PRIMARY,
  },

  joinHint: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    marginTop: -12,
  },

  backBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  backText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
});
