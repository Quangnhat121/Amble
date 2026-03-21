import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { partnerRestaurantAPI } from "../../services/api";

const HEADER_GRAD: [string, string] = ["#FF8A3D", "#FFC24B"];

const STEP_LABELS = [
  "Thông tin cơ bản",
  "Địa điểm",
  "Giờ mở cửa",
  "Ảnh & mạng XH",
  "Hoàn tất",
];

const CUISINES = [
  "Việt Nam",
  "Nhật Bản",
  "Hàn Quốc",
  "Trung Hoa",
  "Âu - Mỹ",
  "Hải sản",
  "BBQ & Nướng",
  "Chay",
  "Buffet",
  "Cafe & Bistro",
  "Fastfood",
  "Lẩu",
];

const SUITABLE_FOR = ["Hẹn hò", "Gia đình", "Nhóm bạn", "Công việc", "Yên tĩnh", "Sinh nhật"];

const CITIES = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Nha Trang",
  "Hội An",
  "Vũng Tàu",
  "Huế",
];

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const SOCIAL_SUGGESTIONS = ["#rooftop", "#saigon", "#fusion", "#romantic", "#date", "#cityview"];
const MAX_IMAGES = 5;

const PRICE_OPTIONS = [
  "50000",
  "100000",
  "150000",
  "200000",
  "300000",
  "400000",
  "500000",
  "700000",
  "1000000",
];

const TIME_OPTIONS = [
  "08:00 SA",
  "09:00 SA",
  "10:00 SA",
  "11:00 SA",
  "12:00 CH",
  "01:00 CH",
  "02:00 CH",
  "03:00 CH",
  "04:00 CH",
  "05:00 CH",
  "06:00 CH",
  "07:00 CH",
  "08:00 CH",
  "09:00 CH",
  "10:00 CH",
  "11:00 CH",
];

export default function RestaurantSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSelect, setActiveSelect] = useState<
    null | "priceMin" | "priceMax" | "openTime" | "closeTime"
  >(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    cuisines: [] as string[],
    suitableFor: [] as string[],
    priceMin: "100000",
    priceMax: "500000",
    city: "",
    address: "",
    phone: "",
    openTime: "10:00 SA",
    closeTime: "10:00 CH",
    openDays: ["T2", "T3", "T4", "T5", "T6", "T7"] as string[],
    hasParking: true,
    instagram: "",
    facebook: "",
    website: "",
    images: [] as string[],
  });

  const progress = useMemo(() => step / 5, [step]);

  const toggleListValue = (key: "cuisines" | "suitableFor" | "openDays", value: string) => {
    setForm((prev) => {
      const list = prev[key];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 5));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    if (!form.name || !form.city || !form.address || !form.phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng hoàn tất các trường bắt buộc trước khi lưu.");
      setStep(1);
      return;
    }
    try {
      setIsSaving(true);
      await partnerRestaurantAPI.setupRestaurant({
        name: form.name,
        description: form.description,
        cuisines: form.cuisines,
        suitableFor: form.suitableFor,
        priceMin: Number(form.priceMin || 0),
        priceMax: Number(form.priceMax || 0),
        city: form.city,
        address: form.address,
        phone: form.phone,
        openTime: form.openTime,
        closeTime: form.closeTime,
        openDays: form.openDays,
        hasParking: form.hasParking,
        instagram: form.instagram,
        facebook: form.facebook,
        website: form.website,
        images: form.images,
      });
      router.replace("/dashboard");
    } catch (error: any) {
      Alert.alert("Lưu thất bại", error.message || "Không thể lưu thông tin nhà hàng.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    if (form.images.length >= MAX_IMAGES) {
      Alert.alert("Đã đủ ảnh", `Bạn chỉ có thể tải tối đa ${MAX_IMAGES} ảnh.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Thiếu quyền", "Vui lòng cho phép truy cập thư viện ảnh để tiếp tục.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setForm((prev) => ({ ...prev, images: [...prev.images, uri] }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={HEADER_GRAD} style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandLetter}>A</Text>
            </View>
            <Text style={styles.brandText}>Amble</Text>
          </View>

          <Text style={styles.headerTitle}>Thiết lập nhà hàng</Text>
          <Text style={styles.headerSubtitle}>
            Bước {step}/5 — {STEP_LABELS[step - 1]}
          </Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.stepDots}>
            {[1, 2, 3, 4, 5].map((dot) => {
              const isDone = dot < step;
              const isActive = dot === step;
              return (
                <View key={dot} style={styles.dotWrap}>
                  <View
                    style={[
                      styles.dot,
                      isDone && styles.dotDone,
                      isActive && styles.dotActive,
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={12} color="#FF8A3D" />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        {step === 1 && (
          <View style={styles.content}>
            <Input label="Tên nhà hàng *" placeholder="VD: The Rooftop Saigon" value={form.name}
              onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))} />

            <Text style={styles.sectionTitle}>Loại ẩm thực *</Text>
            <View style={styles.chipGrid}>
              {CUISINES.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={form.cuisines.includes(item)}
                  onPress={() => toggleListValue("cuisines", item)}
                />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Mô tả nhà hàng</Text>
            <View style={styles.textArea}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Mô tả không gian, phong cách, điểm nổi bật..."
                value={form.description}
                onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
                multiline
              />
            </View>

            <Text style={styles.sectionTitle}>Phù hợp cho (chọn nhiều)</Text>
            <View style={styles.chipGrid}>
              {SUITABLE_FOR.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={form.suitableFor.includes(item)}
                  onPress={() => toggleListValue("suitableFor", item)}
                />
              ))}
            </View>

            <View style={styles.rowSplit}>
              <SelectField
                label="Giá thấp nhất (đ)"
                value={form.priceMin}
                placeholder="Chọn giá"
                onPress={() => setActiveSelect("priceMin")}
              />
              <SelectField
                label="Giá cao nhất (đ)"
                value={form.priceMax}
                placeholder="Chọn giá"
                onPress={() => setActiveSelect("priceMax")}
              />
            </View>

            <PrimaryButton label="Tiếp theo" onPress={handleNext} disabled={!form.name} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Thành phố *</Text>
            <View style={styles.chipGrid}>
              {CITIES.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={form.city === item}
                  onPress={() => setForm((prev) => ({ ...prev, city: item }))}
                  icon="location-outline"
                />
              ))}
            </View>

            <Input
              label="Địa chỉ đầy đủ *"
              placeholder="123 Nguyễn Huệ, Phường Bến Nghé, Quận 1"
              value={form.address}
              onChangeText={(value) => setForm((prev) => ({ ...prev, address: value }))}
            />
            <Input
              label="Số điện thoại *"
              placeholder="028 1234 5678"
              value={form.phone}
              onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              icon="call-outline"
            />

            <View style={styles.mapBox}>
              <Ionicons name="location" size={24} color="#3B82F6" />
              <Text style={styles.mapText}>Google Maps sẽ hiển thị sau khi xác nhận địa chỉ</Text>
            </View>

            <View style={styles.actionsRow}>
              <SecondaryButton label="Quay lại" onPress={handleBack} />
              <PrimaryButton label="Tiếp theo" onPress={handleNext} disabled={!form.city} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Ngày mở cửa *</Text>
            <View style={styles.dayRow}>
              {DAYS.map((item) => (
                <DayChip
                  key={item}
                  label={item}
                  selected={form.openDays.includes(item)}
                  onPress={() => toggleListValue("openDays", item)}
                />
              ))}
            </View>

            <View style={styles.rowSplit}>
              <SelectField
                label="Giờ mở cửa"
                value={form.openTime}
                placeholder="Chọn giờ"
                icon="time-outline"
                onPress={() => setActiveSelect("openTime")}
              />
              <SelectField
                label="Giờ đóng cửa"
                value={form.closeTime}
                placeholder="Chọn giờ"
                icon="time-outline"
                onPress={() => setActiveSelect("closeTime")}
              />
            </View>

            <View style={styles.toggleCard}>
              <View>
                <Text style={styles.toggleTitle}>Có bãi đỗ xe</Text>
                <Text style={styles.toggleSubtitle}>Bật nếu nhà hàng có khu vực đỗ xe</Text>
              </View>
              <Switch
                value={form.hasParking}
                onValueChange={(value) => setForm((prev) => ({ ...prev, hasParking: value }))}
                trackColor={{ true: "#FF8A3D", false: "#E5E7EB" }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Tóm tắt giờ hoạt động</Text>
              <Text style={styles.summaryText}>
                {form.openTime} - {form.closeTime}: {form.openDays.join(", ")}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <SecondaryButton label="Quay lại" onPress={handleBack} />
              <PrimaryButton label="Tiếp theo" onPress={handleNext} />
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>
              Ảnh nhà hàng ({form.images.length}/{MAX_IMAGES})
            </Text>
            <View style={styles.imageRow}>
              {form.images.map((uri, index) => (
                <View key={uri} style={styles.imageThumb}>
                  <Image source={{ uri }} style={styles.imageThumbImg} />
                  <TouchableOpacity
                    style={styles.imageRemove}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {form.images.length < MAX_IMAGES ? (
                <TouchableOpacity style={styles.imageAdd} onPress={handlePickImage}>
                  <Ionicons name="camera" size={16} color="#9CA3AF" />
                  <Text style={styles.imageAddText}>Thêm ảnh</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={styles.helperText}>Ảnh chất lượng cao giúp thu hút thêm 3x khách hàng</Text>

            <Text style={styles.sectionTitle}>Mạng xã hội (không bắt buộc)</Text>
            <Input
              label="Instagram"
              placeholder="instagram.com/yourrestaurant"
              value={form.instagram}
              onChangeText={(value) => setForm((prev) => ({ ...prev, instagram: value }))}
              icon="logo-instagram"
            />
            <Input
              label="Facebook"
              placeholder="facebook.com/yourrestaurant"
              value={form.facebook}
              onChangeText={(value) => setForm((prev) => ({ ...prev, facebook: value }))}
              icon="logo-facebook"
            />
            <Input
              label="Website"
              placeholder="yourrestaurant.com"
              value={form.website}
              onChangeText={(value) => setForm((prev) => ({ ...prev, website: value }))}
              icon="globe-outline"
            />

            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionTitle}>Gợi ý: Thêm hashtag</Text>
              <View style={styles.suggestionRow}>
                {SOCIAL_SUGGESTIONS.map((item) => (
                  <View key={item} style={styles.suggestionChip}>
                    <Text style={styles.suggestionText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actionsRow}>
              <SecondaryButton label="Quay lại" onPress={handleBack} />
              <PrimaryButton label="Xem lại" onPress={handleNext} />
            </View>
          </View>
        )}

        {step === 5 && (
          <View style={styles.content}>
            <View style={styles.finishIcon}>
              <Ionicons name="sparkles" size={24} color="#FF8A3D" />
            </View>
            <Text style={styles.finishTitle}>Gần xong rồi!</Text>
            <Text style={styles.finishSubtitle}>
              Xem lại thông tin trước khi hoàn tất thiết lập nhà hàng của bạn
            </Text>

            <View style={styles.previewCard}>
              {form.images[0] ? (
                <Image source={{ uri: form.images[0] }} style={styles.previewImage} />
              ) : (
                <View style={styles.previewImage} />
              )}
              <View style={styles.previewContent}>
                <InfoRow label="Tên" value={form.name || "-"} />
                <InfoRow label="Ẩm thực" value={form.cuisines.join(", ") || "-"} />
                <InfoRow label="Địa chỉ" value={`${form.address || "-"}, ${form.city || ""}`} />
                <InfoRow label="Giờ mở" value={`${form.openTime} - ${form.closeTime}`} />
                <InfoRow label="Ảnh" value={`${form.images.length} ảnh đã thêm`} />
              </View>
            </View>

            <View style={styles.noticeBox}>
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
              <Text style={styles.noticeText}>
                Sau khi hoàn tất, bạn có thể thêm bàn, quản lý đặt chỗ và tùy chỉnh nhà hàng từ dashboard.
              </Text>
            </View>

            <PrimaryButton
              label={isSaving ? "Đang lưu..." : "Bắt đầu quản lý nhà hàng"}
              onPress={handleFinish}
              disabled={isSaving}
              showSpinner={isSaving}
            />
            <TouchableOpacity style={styles.editLink} onPress={() => setStep(1)}>
              <Text style={styles.editLinkText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <SelectModal
        visible={activeSelect !== null}
        title={
          activeSelect === "priceMin"
            ? "Chọn giá thấp nhất"
            : activeSelect === "priceMax"
              ? "Chọn giá cao nhất"
              : activeSelect === "openTime"
                ? "Chọn giờ mở cửa"
                : "Chọn giờ đóng cửa"
        }
        options={
          activeSelect === "openTime" || activeSelect === "closeTime"
            ? TIME_OPTIONS
            : PRICE_OPTIONS
        }
        selectedValue={
          activeSelect === "priceMin"
            ? form.priceMin
            : activeSelect === "priceMax"
              ? form.priceMax
              : activeSelect === "openTime"
                ? form.openTime
                : form.closeTime
        }
        onSelect={(value) => {
          if (activeSelect === "priceMin") {
            setForm((prev) => ({ ...prev, priceMin: value }));
          } else if (activeSelect === "priceMax") {
            setForm((prev) => ({ ...prev, priceMax: value }));
          } else if (activeSelect === "openTime") {
            setForm((prev) => ({ ...prev, openTime: value }));
          } else if (activeSelect === "closeTime") {
            setForm((prev) => ({ ...prev, closeTime: value }));
          }
          setActiveSelect(null);
        }}
        onClose={() => setActiveSelect(null)}
      />
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon ? (
        <Ionicons
          name={icon as any}
          size={14}
          color={selected ? "#FF8A3D" : "#9CA3AF"}
          style={styles.chipIcon}
        />
      ) : null}
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DayChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.dayChip, selected && styles.dayChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.dayChipText, selected && styles.dayChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  icon?: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? <Ionicons name={icon as any} size={16} color="#9CA3AF" /> : null}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  onPress,
  icon,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  icon?: string;
}) {
  const displayValue = value?.trim() ? value : placeholder;
  const isPlaceholder = !value?.trim();
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.inputWrap} onPress={onPress} activeOpacity={0.8}>
        {icon ? <Ionicons name={icon as any} size={16} color="#9CA3AF" /> : null}
        <Text style={[styles.selectText, isPlaceholder && styles.selectTextPlaceholder]}>
          {displayValue}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}

function SelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const isActive = option === selectedValue;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.modalOption, isActive && styles.modalOptionActive]}
                  onPress={() => onSelect(option)}
                >
                  <Text style={[styles.modalOptionText, isActive && styles.modalOptionTextActive]}>
                    {option}
                  </Text>
                  {isActive ? <Ionicons name="checkmark" size={16} color="#FF8A3D" /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
  showSpinner,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  showSpinner?: boolean;
}) {
  const buttonColors: [string, string] = disabled ? ["#E5E7EB", "#E5E7EB"] : HEADER_GRAD;
  const textColor = disabled ? "#9CA3AF" : "#fff";
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient colors={buttonColors} style={styles.primaryButtonBg}>
        {showSpinner ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={[styles.primaryButtonText, { color: textColor }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={textColor} />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.secondaryButton} onPress={onPress}>
      <Ionicons name="chevron-back" size={16} color="#6B7280" />
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingBottom: 32 },

  header: {
    paddingTop: 36,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandLetter: {
    color: "#fff",
    fontWeight: "700",
  },
  brandText: {
    color: "#fff",
    fontWeight: "700",
  },
  headerTitle: {
    marginTop: 10,
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontSize: 12,
  },
  progressTrack: {
    marginTop: 12,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  stepDots: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 18,
  },
  dotWrap: {
    alignItems: "center",
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  dotDone: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  chipActive: {
    borderColor: "#FF8A3D",
    backgroundColor: "#FFF7ED",
  },
  chipIcon: { marginRight: 6 },
  chipText: {
    fontSize: 12,
    color: "#6B7280",
  },
  chipTextActive: {
    color: "#FF8A3D",
    fontWeight: "600",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#fff",
  },
  textAreaInput: {
    minHeight: 80,
    fontSize: 12,
    color: "#111827",
  },
  rowSplit: {
    flexDirection: "row",
    gap: 12,
  },

  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
  },
  selectText: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
  },
  selectTextPlaceholder: {
    color: "#9CA3AF",
  },

  mapBox: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    paddingVertical: 28,
    alignItems: "center",
    gap: 8,
  },
  mapText: {
    fontSize: 11,
    color: "#3B82F6",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonBg: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#F9FAFB",
  },
  secondaryButtonText: {
    fontWeight: "600",
    color: "#6B7280",
  },

  dayRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  dayChipActive: {
    backgroundColor: "#FF8A3D",
    borderColor: "#FF8A3D",
  },
  dayChipText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  dayChipTextActive: {
    color: "#fff",
  },

  toggleCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#FFF7ED",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleTitle: {
    fontWeight: "700",
    color: "#111827",
  },
  toggleSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  summaryBox: {
    marginTop: 14,
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 12,
  },
  summaryTitle: {
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },
  summaryText: {
    color: "#6B7280",
    fontSize: 11,
  },

  imageRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  imageThumb: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  imageThumbImg: {
    width: "100%",
    height: "100%",
  },
  imageRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -6,
    left: -6,
  },
  imageAdd: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  imageAddText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  helperText: {
    color: "#F59E0B",
    fontSize: 11,
    marginTop: 8,
  },
  suggestionBox: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 12,
  },
  suggestionTitle: {
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 8,
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#FFF1E7",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  suggestionText: {
    color: "#F97316",
    fontSize: 11,
  },

  finishIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF1E7",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 8,
  },
  finishTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },
  finishSubtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 12,
    marginTop: 6,
  },
  previewCard: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  previewImage: {
    height: 120,
    backgroundColor: "#E5E7EB",
    width: "100%",
  },
  previewContent: {
    padding: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: 70,
    color: "#6B7280",
    fontSize: 12,
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  noticeBox: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#ECFDF3",
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: "#15803D",
  },
  editLink: {
    alignItems: "center",
    marginTop: 10,
  },
  editLinkText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 16,
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  modalList: {
    paddingHorizontal: 16,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOptionActive: {
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  modalOptionText: {
    fontSize: 13,
    color: "#111827",
  },
  modalOptionTextActive: {
    color: "#F97316",
    fontWeight: "700",
  },
});
