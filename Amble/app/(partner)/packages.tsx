import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { partnerAuthAPI } from "../../services/api";
import { partnerDashboardAPI } from "../../services/api";
import { usePartnerAuthStore } from "../../store/partnerAuthStore";
import { PartnerBottomNav } from "../../components/partner/PartnerBottomNav";

type PackageFeature = {
  text: string;
  included: boolean;
};

type ServicePackage = {
  key: "basic" | "pro" | "premium";
  label: string;
  badge: string;
  price: string;
  priceMonthly: number;
  currency: string;
  tone: string;
  border: string;
  accent: string;
  iconBg: string;
  features: PackageFeature[];
};

const FALLBACK_PACKAGES: ServicePackage[] = [
  {
    key: "basic",
    label: "Basic",
    badge: "",
    price: "299.000đ",
    priceMonthly: 299000,
    currency: "VND",
    tone: "#F9FAFB",
    border: "#E5E7EB",
    accent: "#6B7280",
    iconBg: "#F3F4F6",
    features: [
      { text: "Hiển thị trên danh sách nhà hàng", included: true },
      { text: "Quản lý tối đa 10 bàn", included: true },
      { text: "Nhận đặt bàn cơ bản", included: true },
      { text: "Hồ sơ nhà hàng", included: true },
      { text: "Ưu tiên hiển thị trang chủ", included: false },
      { text: "Voucher & khuyến mãi", included: false },
      { text: "Phân tích chi tiết", included: false },
    ],
  },
  {
    key: "pro",
    label: "Pro",
    badge: "Phổ biến",
    price: "799.000đ",
    priceMonthly: 799000,
    currency: "VND",
    tone: "#EFF6FF",
    border: "#93C5FD",
    accent: "#3B82F6",
    iconBg: "#DBEAFE",
    features: [
      { text: "Tất cả Basic", included: true },
      { text: "Quản lý không giới hạn bàn", included: true },
      { text: "Ưu tiên hiển thị trang chủ (mức trung)", included: true },
      { text: "AI gợi ý cho khách hàng", included: true },
      { text: "Tạo Voucher & khuyến mãi", included: true },
      { text: "Thống kê cơ bản", included: true },
      { text: "Hỗ trợ ưu tiên", included: true },
      { text: "Top đề xuất trang chủ", included: false },
    ],
  },
  {
    key: "premium",
    label: "Premium",
    badge: "Cao cấp",
    price: "1.499.000đ",
    priceMonthly: 1499000,
    currency: "VND",
    tone: "#FAF5FF",
    border: "#C4B5FD",
    accent: "#9333EA",
    iconBg: "#F3E8FF",
    features: [
      { text: "Tất cả Pro", included: true },
      { text: "Top đề xuất trang chủ Amble", included: true },
      { text: "Badge Premium hiển thị nổi bật", included: true },
      { text: "AI ưu tiên gợi ý cho khách", included: true },
      { text: "Phân tích chi tiết & báo cáo", included: true },
      { text: "Hỗ trợ 24/7 ưu tiên cao nhất", included: true },
      { text: "Tùy chỉnh trang nhà hàng", included: true },
      { text: "Chiến dịch marketing đặc biệt", included: true },
    ],
  },
];

const PACKAGE_ORDER: Array<ServicePackage["key"]> = ["basic", "pro", "premium"];

export default function PartnerPackagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { partner, loadPartner } = usePartnerAuthStore();

  const [packages, setPackages] = useState<ServicePackage[]>(FALLBACK_PACKAGES);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<ServicePackage["key"] | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const loadPackages = async () => {
      try {
        const res = await partnerAuthAPI.getPackages();
        if (
          mounted &&
          Array.isArray(res.data?.packages) &&
          res.data.packages.length > 0
        ) {
          setPackages(res.data.packages);
        }
      } catch {
        if (mounted) {
          setPackages(FALLBACK_PACKAGES);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadPackages();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      return PACKAGE_ORDER.indexOf(a.key) - PACKAGE_ORDER.indexOf(b.key);
    });
  }, [packages]);

  const handleUpgrade = async (nextPackage: ServicePackage["key"]) => {
    if (updatingKey) return;

    if ((partner?.subscriptionPackage || "basic") === nextPackage) {
      return;
    }

    try {
      setUpdatingKey(nextPackage);
      await partnerDashboardAPI.updateSubscriptionPackage(nextPackage);
      await loadPartner();
      Alert.alert("Thành công", "Gói dịch vụ đã được cập nhật.");
    } catch (error: any) {
      Alert.alert(
        "Không thể cập nhật",
        error?.response?.data?.message || "Vui lòng thử lại sau.",
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 8 + insets.top },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gói dịch vụ</Text>
          <View style={styles.placeholder} />
        </View>

        <LinearGradient
          colors={["#1A1A1A", "#2D2D2D"]}
          style={styles.currentPlanCard}
        >
          <View style={styles.currentPlanTop}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#FCD34D"
            />
            <Text style={styles.currentPlanLabel}>Gói hiện tại</Text>
          </View>
          <Text style={styles.currentPlanName}>
            {(partner?.subscriptionPackage || "basic").toUpperCase()}
          </Text>
          <Text style={styles.currentPlanSub}>
            So sánh quyền lợi các gói để lên kế hoạch nâng cấp.
          </Text>
        </LinearGradient>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#FF6B35" />
            <Text style={styles.loadingText}>Đang tải gói dịch vụ...</Text>
          </View>
        ) : (
          sortedPackages.map((item) => {
            const isCurrent =
              (partner?.subscriptionPackage || "basic") === item.key;

            return (
              <View
                key={item.key}
                style={[
                  styles.packageCard,
                  {
                    backgroundColor: item.tone,
                    borderColor: isCurrent ? item.accent : item.border,
                  },
                  isCurrent && styles.packageCardCurrent,
                ]}
              >
                <View style={styles.packageTop}>
                  <View style={styles.packageNameWrap}>
                    <View
                      style={[
                        styles.packageIconWrap,
                        { backgroundColor: item.iconBg },
                      ]}
                    >
                      <Text
                        style={[styles.packageIconText, { color: item.accent }]}
                      >
                        {item.label[0]}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.packageName}>{item.label}</Text>
                      <Text
                        style={[styles.packagePrice, { color: item.accent }]}
                      >
                        {item.price}/tháng
                      </Text>
                    </View>
                  </View>

                  {isCurrent ? (
                    <View
                      style={[
                        styles.currentBadge,
                        { backgroundColor: item.accent },
                      ]}
                    >
                      <Ionicons name="checkmark" size={12} color="#fff" />
                      <Text style={styles.currentBadgeText}>Đang dùng</Text>
                    </View>
                  ) : (
                    !!item.badge && (
                      <View
                        style={[
                          styles.normalBadge,
                          { backgroundColor: item.accent },
                        ]}
                      >
                        <Text style={styles.normalBadgeText}>{item.badge}</Text>
                      </View>
                    )
                  )}
                </View>

                <View style={styles.featuresWrap}>
                  {item.features.map((feature, index) => (
                    <View
                      key={`${item.key}-${index}`}
                      style={styles.featureRow}
                    >
                      <Ionicons
                        name={
                          feature.included
                            ? "checkmark-circle"
                            : "close-circle-outline"
                        }
                        size={16}
                        color={feature.included ? item.accent : "#9CA3AF"}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          !feature.included && styles.featureTextDisabled,
                        ]}
                      >
                        {feature.text}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    isCurrent && styles.actionBtnCurrent,
                    !isCurrent && { backgroundColor: item.accent },
                  ]}
                  disabled={isCurrent || updatingKey !== null}
                  onPress={() => handleUpgrade(item.key)}
                  activeOpacity={0.85}
                >
                  {updatingKey === item.key ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.actionBtnText,
                        isCurrent && styles.actionBtnTextCurrent,
                      ]}
                    >
                      {isCurrent ? "Đang sử dụng" : "Nâng cấp lên gói này"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <PartnerBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1F1F4",
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#1A1A1A" },
  placeholder: { width: 38 },
  currentPlanCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  currentPlanTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  currentPlanLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
  },
  currentPlanName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  currentPlanSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12.5,
    lineHeight: 18,
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F1F4",
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  packageCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  packageCardCurrent: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  packageTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  packageNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  packageIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  packageIconText: {
    fontSize: 18,
    fontWeight: "900",
  },
  packageName: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 2,
  },
  packagePrice: {
    fontSize: 13,
    fontWeight: "700",
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currentBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  normalBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  normalBadgeText: {
    color: "#fff",
    fontSize: 10.5,
    fontWeight: "700",
  },
  featuresWrap: {
    gap: 7,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    flex: 1,
    color: "#374151",
    fontSize: 12.5,
    lineHeight: 18,
  },
  featureTextDisabled: {
    color: "#9CA3AF",
  },
  actionBtn: {
    marginTop: 12,
    borderRadius: 12,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  actionBtnCurrent: {
    backgroundColor: "#E5E7EB",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  actionBtnTextCurrent: {
    color: "#6B7280",
  },
});
