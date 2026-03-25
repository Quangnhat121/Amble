import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { partnerDashboardAPI } from "../../services/api";
import { PartnerBottomNav } from "../../components/partner/PartnerBottomNav";

type DiscountType = "amount" | "percent";
type VoucherFilter = "all" | "active" | "expired";

interface PartnerVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minBill: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  remainingUses: number | null;
  startAt: string;
  endAt: string;
  isActive: boolean;
  isExpired: boolean;
}

interface VoucherForm {
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minBill: string;
  maxDiscount: string;
  usageLimit: string;
}

const DEFAULT_FORM: VoucherForm = {
  code: "",
  title: "",
  description: "",
  discountType: "amount",
  discountValue: "",
  minBill: "0",
  maxDiscount: "0",
  usageLimit: "0",
};

export default function PartnerVouchersScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [vouchers, setVouchers] = useState<PartnerVoucher[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<VoucherFilter>("all");
  const [form, setForm] = useState<VoucherForm>(DEFAULT_FORM);
  const [editForm, setEditForm] = useState<VoucherForm>(DEFAULT_FORM);
  const [startAt, setStartAt] = useState<Date>(new Date());
  const [endAt, setEndAt] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );
  const [editStartAt, setEditStartAt] = useState<Date>(new Date());
  const [editEndAt, setEditEndAt] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );
  const [startAtInput, setStartAtInput] = useState("");
  const [endAtInput, setEndAtInput] = useState("");
  const [editStartAtInput, setEditStartAtInput] = useState("");
  const [editEndAtInput, setEditEndAtInput] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showEditStartPicker, setShowEditStartPicker] = useState(false);
  const [showEditEndPicker, setShowEditEndPicker] = useState(false);

  const loadData = async () => {
    try {
      const [voucherRes, overviewRes] = await Promise.all([
        partnerDashboardAPI.getVouchers(),
        partnerDashboardAPI.getOverview(),
      ]);

      setVouchers(voucherRes.data?.vouchers || []);
      setPendingCount(overviewRes.data?.overview?.pendingOrders || 0);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không tải được danh sách voucher";
      Alert.alert("Lỗi", message);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const total = vouchers.length;
    const active = vouchers.filter((v) => v.isActive && !v.isExpired).length;
    const expired = vouchers.filter((v) => v.isExpired).length;
    return { total, active, expired };
  }, [vouchers]);

  const filteredVouchers = useMemo(() => {
    if (selectedFilter === "active") {
      return vouchers.filter((v) => v.isActive && !v.isExpired);
    }
    if (selectedFilter === "expired") {
      return vouchers.filter((v) => v.isExpired);
    }
    return vouchers;
  }, [vouchers, selectedFilter]);

  const editingVoucher = useMemo(
    () => vouchers.find((item) => item.id === editingVoucherId) || null,
    [vouchers, editingVoucherId],
  );

  function formatInputDateTime(value: Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    const hh = String(value.getHours()).padStart(2, "0");
    const mm = String(value.getMinutes()).padStart(2, "0");
    return `${hh}:${mm} ${d}/${m}/${y}`;
  }

  function parseInputDateTime(value: string) {
    const text = String(value || "").trim();
    const match = text.match(/^(\d{2}):(\d{2})\s+(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const day = Number(match[3]);
    const month = Number(match[4]);
    const year = Number(match[5]);
    const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  const updateForm = (key: keyof VoucherForm, value: string | DiscountType) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEditForm = (
    key: keyof VoucherForm,
    value: string | DiscountType,
  ) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    const now = new Date();
    const nextEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    setStartAt(now);
    setEndAt(nextEnd);
    setStartAtInput(formatInputDateTime(now));
    setEndAtInput(formatInputDateTime(nextEnd));
  };

  const startEditVoucher = (voucher: PartnerVoucher) => {
    const editStart = new Date(voucher.startAt);
    const editEnd = new Date(voucher.endAt);

    setEditingVoucherId(voucher.id);
    setEditForm({
      code: voucher.code,
      title: voucher.title,
      description: voucher.description || "",
      discountType: voucher.discountType,
      discountValue: String(voucher.discountValue || ""),
      minBill: String(voucher.minBill || 0),
      maxDiscount: String(voucher.maxDiscount || 0),
      usageLimit: String(voucher.usageLimit || 0),
    });
    setEditStartAt(editStart);
    setEditEndAt(editEnd);
    setEditStartAtInput(formatInputDateTime(editStart));
    setEditEndAtInput(formatInputDateTime(editEnd));
    setIsEditVisible(true);
  };

  const closeEditToast = () => {
    setIsEditVisible(false);
    setEditingVoucherId(null);
    setShowEditStartPicker(false);
    setShowEditEndPicker(false);
    setEditForm(DEFAULT_FORM);
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;
    setStartAtInput(formatInputDateTime(startAt));
    setEndAtInput(formatInputDateTime(endAt));
  }, []);

  const handleSubmitVoucher = async () => {
    const code = form.code.trim().toUpperCase();
    const title = form.title.trim();
    const description = form.description.trim();
    const discountValue = Number(form.discountValue);
    const minBill = Number(form.minBill || 0);
    const maxDiscount = Number(form.maxDiscount || 0);
    const usageLimit = Number(form.usageLimit || 0);

    if (!code || code.length < 4) {
      Alert.alert("Thiếu thông tin", "Mã voucher tối thiểu 4 ký tự.");
      return;
    }

    if (!title) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên voucher.");
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      Alert.alert("Thiếu thông tin", "Giá trị giảm giá phải lớn hơn 0.");
      return;
    }

    if (form.discountType === "percent" && discountValue > 100) {
      Alert.alert("Không hợp lệ", "Voucher theo % không được vượt quá 100.");
      return;
    }

    let effectiveStart = startAt;
    let effectiveEnd = endAt;

    if (Platform.OS === "android") {
      const parsedStart = parseInputDateTime(startAtInput);
      const parsedEnd = parseInputDateTime(endAtInput);
      if (!parsedStart || !parsedEnd) {
        Alert.alert(
          "Không hợp lệ",
          "Android vui lòng nhập thời gian theo định dạng HH:mm DD/MM/YYYY",
        );
        return;
      }
      effectiveStart = parsedStart;
      effectiveEnd = parsedEnd;
    }

    if (effectiveEnd <= effectiveStart) {
      Alert.alert(
        "Không hợp lệ",
        "Thời gian hết hạn phải sau thời gian bắt đầu.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code,
        title,
        description,
        discountType: form.discountType,
        discountValue,
        minBill: Number.isFinite(minBill) ? minBill : 0,
        maxDiscount:
          form.discountType === "percent" && Number.isFinite(maxDiscount)
            ? maxDiscount
            : 0,
        usageLimit: Number.isFinite(usageLimit) ? usageLimit : 0,
        startAt: effectiveStart.toISOString(),
        endAt: effectiveEnd.toISOString(),
      };

      await partnerDashboardAPI.createVoucher(payload);

      resetForm();
      await loadData();
      Alert.alert("Thành công", "Voucher đã được tạo cho khách hàng.");
    } catch (error: any) {
      setIsSubmitting(false);
      const message = error?.response?.data?.message || "Không thể lưu voucher";
      Alert.alert("Lỗi", message);
    }
  };

  const handleUpdateVoucher = async () => {
    if (!editingVoucherId) return;

    const code = editForm.code.trim().toUpperCase();
    const title = editForm.title.trim();
    const description = editForm.description.trim();
    const discountValue = Number(editForm.discountValue);
    const minBill = Number(editForm.minBill || 0);
    const maxDiscount = Number(editForm.maxDiscount || 0);
    const usageLimit = Number(editForm.usageLimit || 0);

    if (!code || code.length < 4) {
      Alert.alert("Thiếu thông tin", "Mã voucher tối thiểu 4 ký tự.");
      return;
    }

    if (!title) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tên voucher.");
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      Alert.alert("Thiếu thông tin", "Giá trị giảm giá phải lớn hơn 0.");
      return;
    }

    if (editForm.discountType === "percent" && discountValue > 100) {
      Alert.alert("Không hợp lệ", "Voucher theo % không được vượt quá 100.");
      return;
    }

    let effectiveStart = editStartAt;
    let effectiveEnd = editEndAt;

    if (Platform.OS === "android") {
      const parsedStart = parseInputDateTime(editStartAtInput);
      const parsedEnd = parseInputDateTime(editEndAtInput);
      if (!parsedStart || !parsedEnd) {
        Alert.alert(
          "Không hợp lệ",
          "Android vui lòng nhập thời gian theo định dạng HH:mm DD/MM/YYYY",
        );
        return;
      }
      effectiveStart = parsedStart;
      effectiveEnd = parsedEnd;
    }

    if (effectiveEnd <= effectiveStart) {
      Alert.alert(
        "Không hợp lệ",
        "Thời gian hết hạn phải sau thời gian bắt đầu.",
      );
      return;
    }

    try {
      setIsEditSubmitting(true);
      await partnerDashboardAPI.updateVoucher(editingVoucherId, {
        code,
        title,
        description,
        discountType: editForm.discountType,
        discountValue,
        minBill: Number.isFinite(minBill) ? minBill : 0,
        maxDiscount:
          editForm.discountType === "percent" && Number.isFinite(maxDiscount)
            ? maxDiscount
            : 0,
        usageLimit: Number.isFinite(usageLimit) ? usageLimit : 0,
        startAt: effectiveStart.toISOString(),
        endAt: effectiveEnd.toISOString(),
      });
      await loadData();
      Alert.alert("Thành công", "Voucher đã được cập nhật.");
      closeEditToast();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể cập nhật voucher";
      Alert.alert("Lỗi", message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDeleteVoucher = (voucher: PartnerVoucher) => {
    Alert.alert(
      "Xóa voucher",
      `Bạn chắc chắn muốn xóa voucher ${voucher.code}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(voucher.id);
              await partnerDashboardAPI.deleteVoucher(voucher.id);
              if (editingVoucherId === voucher.id) {
                closeEditToast();
              }
              await loadData();
              Alert.alert("Thành công", "Đã xóa voucher.");
            } catch (error: any) {
              const message =
                error?.response?.data?.message || "Không thể xóa voucher";
              Alert.alert("Lỗi", message);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  const handleToggleVoucher = async (voucher: PartnerVoucher) => {
    if (statusUpdatingId) return;

    try {
      setStatusUpdatingId(voucher.id);
      await partnerDashboardAPI.updateVoucherStatus(
        voucher.id,
        !voucher.isActive,
      );
      await loadData();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không thể cập nhật trạng thái voucher";
      Alert.alert("Lỗi", message);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleDateString("vi-VN");
    } catch {
      return value;
    }
  };

  const formatDateTime = (value: Date) => {
    try {
      return value.toLocaleString("vi-VN", {
        hour12: false,
      });
    } catch {
      return value.toISOString();
    }
  };

  const onChangeStart = (_: any, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
    }
    if (!selected) return;
    setStartAt(selected);
    if (selected >= endAt) {
      setEndAt(new Date(selected.getTime() + 60 * 60 * 1000));
    }
  };

  const onChangeEnd = (_: any, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
    }
    if (!selected) return;
    setEndAt(selected);
  };

  const onChangeEditStart = (_: any, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowEditStartPicker(false);
    }
    if (!selected) return;
    setEditStartAt(selected);
    if (selected >= editEndAt) {
      setEditEndAt(new Date(selected.getTime() + 60 * 60 * 1000));
    }
  };

  const onChangeEditEnd = (_: any, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowEditEndPicker(false);
    }
    if (!selected) return;
    setEditEndAt(selected);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>Voucher khách hàng</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/dashboard")}
        >
          <Text style={styles.backBtnText}>Về Dashboard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterSelectWrap}>
          <TouchableOpacity
            style={[
              styles.filterSelectBtn,
              selectedFilter === "all" && styles.filterSelectBtnActiveAll,
            ]}
            onPress={() => setSelectedFilter("all")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterSelectText,
                selectedFilter === "all" && styles.filterSelectTextActiveAll,
              ]}
            >
              Tổng ({stats.total})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterSelectBtn,
              selectedFilter === "active" && styles.filterSelectBtnActiveGreen,
            ]}
            onPress={() => setSelectedFilter("active")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterSelectText,
                selectedFilter === "active" &&
                  styles.filterSelectTextActiveGreen,
              ]}
            >
              Đang chạy ({stats.active})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterSelectBtn,
              selectedFilter === "expired" && styles.filterSelectBtnActiveRed,
            ]}
            onPress={() => setSelectedFilter("expired")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterSelectText,
                selectedFilter === "expired" &&
                  styles.filterSelectTextActiveRed,
              ]}
            >
              Hết hạn ({stats.expired})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Tạo voucher mới</Text>

          <Text style={styles.fieldLabel}>Mã voucher</Text>
          <TextInput
            value={form.code}
            onChangeText={(v) => updateForm("code", v.toUpperCase())}
            placeholder="VD: DINNER50"
            style={styles.input}
            autoCapitalize="characters"
          />

          <Text style={styles.fieldLabel}>Tên voucher</Text>
          <TextInput
            value={form.title}
            onChangeText={(v) => updateForm("title", v)}
            placeholder="Ví dụ: Giảm 50K cuối tuần"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Mô tả</Text>
          <TextInput
            value={form.description}
            onChangeText={(v) => updateForm("description", v)}
            placeholder="Áp dụng cho bàn từ 2 khách"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                form.discountType === "amount" && styles.typeBtnActive,
              ]}
              onPress={() => updateForm("discountType", "amount")}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  form.discountType === "amount" && styles.typeBtnTextActive,
                ]}
              >
                Giảm theo tiền
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                form.discountType === "percent" && styles.typeBtnActive,
              ]}
              onPress={() => updateForm("discountType", "percent")}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  form.discountType === "percent" && styles.typeBtnTextActive,
                ]}
              >
                Giảm theo %
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Giá trị giảm</Text>
          <TextInput
            value={form.discountValue}
            onChangeText={(v) => updateForm("discountValue", v)}
            placeholder={form.discountType === "percent" ? "10" : "50000"}
            style={styles.input}
            keyboardType="numeric"
          />

          <View style={styles.row2Col}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Hóa đơn tối thiểu</Text>
              <TextInput
                value={form.minBill}
                onChangeText={(v) => updateForm("minBill", v)}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Giới hạn lượt dùng</Text>
              <TextInput
                value={form.usageLimit}
                onChangeText={(v) => updateForm("usageLimit", v)}
                style={styles.input}
                keyboardType="numeric"
                placeholder="0 = không giới hạn"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Hết hạn</Text>
          {Platform.OS === "android" ? (
            <TextInput
              value={endAtInput}
              onChangeText={setEndAtInput}
              style={styles.input}
              placeholder="HH:mm DD/MM/YYYY"
              autoCapitalize="none"
            />
          ) : (
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.dateText}>{formatDateTime(endAt)}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.fieldLabel}>Bắt đầu hiệu lực</Text>
          {Platform.OS === "android" ? (
            <TextInput
              value={startAtInput}
              onChangeText={setStartAtInput}
              style={styles.input}
              placeholder="HH:mm DD/MM/YYYY"
              autoCapitalize="none"
            />
          ) : (
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.dateText}>{formatDateTime(startAt)}</Text>
            </TouchableOpacity>
          )}

          {Platform.OS === "ios" && showStartPicker && (
            <DateTimePicker
              value={startAt}
              mode="datetime"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeStart}
            />
          )}

          {Platform.OS === "ios" && showEndPicker && (
            <DateTimePicker
              value={endAt}
              mode="datetime"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeEnd}
            />
          )}

          {form.discountType === "percent" && (
            <>
              <Text style={styles.fieldLabel}>Giảm tối đa</Text>
              <TextInput
                value={form.maxDiscount}
                onChangeText={(v) => updateForm("maxDiscount", v)}
                style={styles.input}
                keyboardType="numeric"
                placeholder="0 = không giới hạn"
              />
            </>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmitVoucher}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.submitText}>
              {isSubmitting ? "Đang tạo..." : "Tạo voucher"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Voucher đã tạo</Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={styles.reloadText}>Làm mới</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#FF6B35" size="small" />
            <Text style={styles.loadingText}>Đang tải voucher...</Text>
          </View>
        ) : filteredVouchers.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              Không có voucher theo bộ lọc đã chọn.
            </Text>
          </View>
        ) : (
          filteredVouchers.map((voucher) => (
            <View key={voucher.id} style={styles.voucherCard}>
              <View style={styles.voucherTop}>
                <Text style={styles.voucherCode}>{voucher.code}</Text>
                <View
                  style={[
                    styles.statusChip,
                    voucher.isActive && !voucher.isExpired
                      ? styles.statusChipActive
                      : styles.statusChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      voucher.isActive && !voucher.isExpired
                        ? styles.statusTextActive
                        : styles.statusTextInactive,
                    ]}
                  >
                    {voucher.isActive && !voucher.isExpired
                      ? "Đang hoạt động"
                      : "Không hoạt động"}
                  </Text>
                </View>
              </View>
              <Text style={styles.voucherTitle}>{voucher.title}</Text>
              {!!voucher.description && (
                <Text style={styles.voucherDesc}>{voucher.description}</Text>
              )}

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Giảm: {voucher.discountValue}
                  {voucher.discountType === "percent" ? "%" : "đ"}
                </Text>
                <Text style={styles.metaText}>
                  Đã dùng: {voucher.usedCount}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Hiệu lực: {formatDate(voucher.startAt)}
                </Text>
                <Text style={styles.metaText}>
                  HSD: {formatDate(voucher.endAt)}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  Đơn từ: {voucher.minBill.toLocaleString("vi-VN")}đ
                </Text>
                <Text style={styles.metaText}>
                  Còn lại:{" "}
                  {voucher.remainingUses === null ? "∞" : voucher.remainingUses}
                </Text>
              </View>

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => startEditVoucher(voucher)}
                  disabled={
                    deletingId === voucher.id || statusUpdatingId !== null
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.editBtnText}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteVoucher(voucher)}
                  disabled={
                    deletingId === voucher.id || statusUpdatingId !== null
                  }
                  activeOpacity={0.85}
                >
                  {deletingId === voucher.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.deleteBtnText}>Xóa</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={isEditVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditToast}
      >
        <View style={styles.toastOverlay}>
          <TouchableOpacity
            style={styles.toastBackdrop}
            activeOpacity={1}
            onPress={closeEditToast}
          />

          <View style={styles.toastCard}>
            <View style={styles.toastHeader}>
              <Text style={styles.toastTitle}>Chỉnh sửa voucher</Text>
              <TouchableOpacity onPress={closeEditToast}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.toastBody}
              contentContainerStyle={styles.toastBodyContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.fieldLabel}>Mã voucher</Text>
              <TextInput
                value={editForm.code}
                onChangeText={(v) => updateEditForm("code", v.toUpperCase())}
                placeholder="VD: DINNER50"
                style={styles.input}
                autoCapitalize="characters"
              />

              <Text style={styles.fieldLabel}>Tên voucher</Text>
              <TextInput
                value={editForm.title}
                onChangeText={(v) => updateEditForm("title", v)}
                placeholder="Ví dụ: Giảm 50K cuối tuần"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Mô tả</Text>
              <TextInput
                value={editForm.description}
                onChangeText={(v) => updateEditForm("description", v)}
                placeholder="Áp dụng cho bàn từ 2 khách"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    editForm.discountType === "amount" && styles.typeBtnActive,
                  ]}
                  onPress={() => updateEditForm("discountType", "amount")}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      editForm.discountType === "amount" &&
                        styles.typeBtnTextActive,
                    ]}
                  >
                    Giảm theo tiền
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    editForm.discountType === "percent" && styles.typeBtnActive,
                  ]}
                  onPress={() => updateEditForm("discountType", "percent")}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      editForm.discountType === "percent" &&
                        styles.typeBtnTextActive,
                    ]}
                  >
                    Giảm theo %
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Giá trị giảm</Text>
              <TextInput
                value={editForm.discountValue}
                onChangeText={(v) => updateEditForm("discountValue", v)}
                placeholder={
                  editForm.discountType === "percent" ? "10" : "50000"
                }
                style={styles.input}
                keyboardType="numeric"
              />

              <View style={styles.row2Col}>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>Hóa đơn tối thiểu</Text>
                  <TextInput
                    value={editForm.minBill}
                    onChangeText={(v) => updateEditForm("minBill", v)}
                    style={styles.input}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>Giới hạn lượt dùng</Text>
                  <TextInput
                    value={editForm.usageLimit}
                    onChangeText={(v) => updateEditForm("usageLimit", v)}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0 = không giới hạn"
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Hết hạn</Text>
              {Platform.OS === "android" ? (
                <TextInput
                  value={editEndAtInput}
                  onChangeText={setEditEndAtInput}
                  style={styles.input}
                  placeholder="HH:mm DD/MM/YYYY"
                  autoCapitalize="none"
                />
              ) : (
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEditEndPicker(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.dateText}>
                    {formatDateTime(editEndAt)}
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.fieldLabel}>Bắt đầu hiệu lực</Text>
              {Platform.OS === "android" ? (
                <TextInput
                  value={editStartAtInput}
                  onChangeText={setEditStartAtInput}
                  style={styles.input}
                  placeholder="HH:mm DD/MM/YYYY"
                  autoCapitalize="none"
                />
              ) : (
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEditStartPicker(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={styles.dateText}>
                    {formatDateTime(editStartAt)}
                  </Text>
                </TouchableOpacity>
              )}

              {Platform.OS === "ios" && showEditStartPicker && (
                <DateTimePicker
                  value={editStartAt}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onChangeEditStart}
                />
              )}

              {Platform.OS === "ios" && showEditEndPicker && (
                <DateTimePicker
                  value={editEndAt}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={onChangeEditEnd}
                />
              )}

              {editForm.discountType === "percent" && (
                <>
                  <Text style={styles.fieldLabel}>Giảm tối đa</Text>
                  <TextInput
                    value={editForm.maxDiscount}
                    onChangeText={(v) => updateEditForm("maxDiscount", v)}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0 = không giới hạn"
                  />
                </>
              )}

              {editingVoucher && (
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    editingVoucher.isActive
                      ? styles.toggleBtnOff
                      : styles.toggleBtnOn,
                  ]}
                  onPress={() => handleToggleVoucher(editingVoucher)}
                  disabled={statusUpdatingId === editingVoucher.id}
                  activeOpacity={0.85}
                >
                  {statusUpdatingId === editingVoucher.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.toggleBtnText}>
                      {editingVoucher.isActive ? "Tắt voucher" : "Bật voucher"}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.saveEditBtn}
                onPress={handleUpdateVoucher}
                disabled={isEditSubmitting}
                activeOpacity={0.85}
              >
                {isEditSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveEditText}>Lưu chỉnh sửa</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <PartnerBottomNav pendingCount={pendingCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#1A1A1A" },
  backBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  filterSelectWrap: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  filterSelectBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filterSelectBtnActiveAll: {
    backgroundColor: "#111827",
  },
  filterSelectBtnActiveGreen: {
    backgroundColor: "#E7F8EE",
    borderWidth: 1,
    borderColor: "#7DDF9E",
  },
  filterSelectBtnActiveRed: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#F04444",
  },
  filterSelectText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
  },
  filterSelectTextActiveAll: {
    color: "#FFFFFF",
  },
  filterSelectTextActiveGreen: {
    color: "#1F9F4D",
  },
  filterSelectTextActiveRed: {
    color: "#DC2626",
  },

  formCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  fieldLabel: {
    marginTop: 8,
    marginBottom: 6,
    color: "#374151",
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  textArea: { minHeight: 72 },
  typeRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  typeBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  typeBtnActive: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF3ED",
  },
  typeBtnText: { color: "#6B7280", fontWeight: "700", fontSize: 13 },
  typeBtnTextActive: { color: "#FF6B35" },
  row2Col: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  submitBtn: {
    marginTop: 14,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  toastOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.3)",
  },
  toastBackdrop: {
    flex: 1,
  },
  toastCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: "88%",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  toastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  toastTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  toastBody: {
    flexGrow: 0,
  },
  toastBodyContent: {
    paddingBottom: 8,
  },
  saveEditBtn: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  saveEditText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  listHeader: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reloadText: { color: "#2563EB", fontWeight: "700" },
  loadingWrap: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingVertical: 8,
  },
  loadingText: { color: "#6B7280", fontSize: 12, fontWeight: "600" },
  emptyWrap: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
  },
  emptyText: { color: "#6B7280" },

  voucherCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 14,
    gap: 6,
  },
  voucherTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voucherCode: { fontSize: 17, fontWeight: "900", color: "#111827" },
  voucherTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },
  voucherDesc: { color: "#6B7280", fontSize: 12 },
  statusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusChipActive: {
    backgroundColor: "#E7F8EE",
    borderColor: "#7DDF9E",
  },
  statusChipInactive: {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
  },
  statusText: { fontSize: 10, fontWeight: "700" },
  statusTextActive: { color: "#1F9F4D" },
  statusTextInactive: { color: "#6B7280" },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  toggleBtn: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnOn: {
    backgroundColor: "#16A34A",
  },
  toggleBtnOff: {
    backgroundColor: "#ff8b25",
  },
  toggleBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  cardActionsRow: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  editBtnText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },
  deleteBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b25",
  },
  deleteBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
