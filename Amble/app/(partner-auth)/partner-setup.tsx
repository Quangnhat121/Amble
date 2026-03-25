import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { partnerDashboardAPI } from "../../services/api";
import { usePartnerAuthStore } from "../../store/partnerAuthStore";
import AmbleLogo from "../../components/AmbleLogo";

const HEADER_GRAD: [string, string] = ["#FF8A2A", "#FFC11A"];
const ORANGE = "#FF7A2F";
const TEXT_DARK = "#121212";
const TEXT_MUTED = "#6F6F7A";
const BORDER = "#E7E7EF";
const STEP_ACTIVE = "#FF8A2A";
const STEP_DONE = "#22C55E";
const STEP_IDLE = "#E6E6EE";
const MAX_IMAGES = 5;

const STEPS = [
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

const SUITABLE = [
  "Hẹn hò",
  "Gia đình",
  "Nhóm bạn",
  "Công việc",
  "Yên tĩnh",
  "Sinh nhật",
];

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

const HASHTAGS = [
  "#rooftop",
  "#saigon",
  "#fusion",
  "#romantic",
  "#date",
  "#cityview",
];

const createTimeDate = (hours: number, minutes: number) => {
  const time = new Date();
  time.setHours(hours, minutes, 0, 0);
  return time;
};

const formatTime = (time: Date) => {
  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DAY_OPTIONS: Array<{ key: DayKey; label: string }> = [
  { key: "mon", label: "T2" },
  { key: "tue", label: "T3" },
  { key: "wed", label: "T4" },
  { key: "thu", label: "T5" },
  { key: "fri", label: "T6" },
  { key: "sat", label: "T7" },
  { key: "sun", label: "CN" },
];

export default function PartnerSetupScreen() {
  const router = useRouter();
  const { email, phone } = useLocalSearchParams();
  const { login } = usePartnerAuthStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [cuisines, setCuisines] = useState<string[]>(["Việt Nam"]);
  const [description, setDescription] = useState("");
  const [suitable, setSuitable] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("100000");
  const [maxPrice, setMaxPrice] = useState("500000");

  const [city, setCity] = useState("Hồ Chí Minh");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [openDays, setOpenDays] = useState<DayKey[]>([
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ]);
  const [openTimeValue, setOpenTimeValue] = useState(() =>
    createTimeDate(10, 0),
  );
  const [closeTimeValue, setCloseTimeValue] = useState(() =>
    createTimeDate(22, 0),
  );
  const [openTime, setOpenTime] = useState(() =>
    formatTime(createTimeDate(10, 0)),
  );
  const [closeTime, setCloseTime] = useState(() =>
    formatTime(createTimeDate(22, 0)),
  );
  const [hasParking, setHasParking] = useState(false);

  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [website, setWebsite] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / STEPS.length) * 100),
    [stepIndex],
  );

  const toggleChip = <T extends string>(
    value: T,
    list: T[],
    setter: (items: T[]) => void,
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
      return;
    }
    setter([...list, value]);
  };

  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const validateStep = () => {
    if (stepIndex === 0) {
      if (!name.trim()) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập tên nhà hàng.");
        return false;
      }
    }

    if (stepIndex === 1) {
      if (!city.trim() || !address.trim() || !(contactPhone || phone)) {
        Alert.alert(
          "Thiếu thông tin",
          "Vui lòng nhập đủ địa chỉ và số điện thoại.",
        );
        return false;
      }
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleOpenTimeChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") setShowOpenPicker(false);
    if (!selected) return;
    setOpenTimeValue(selected);
    setOpenTime(formatTime(selected));
  };

  const handleCloseTimeChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") setShowClosePicker(false);
    if (!selected) return;
    setCloseTimeValue(selected);
    setCloseTime(formatTime(selected));
  };

  const handleFinish = async () => {
    if (!email || !phone) {
      Alert.alert(
        "Thiếu thông tin",
        "Không tìm thấy email hoặc mật khẩu đăng ký.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await login(String(email), String(phone));

      const introParts = [];
      if (suitable.length) introParts.push(`Phù hợp: ${suitable.join(", ")}`);
      if (minPrice && maxPrice)
        introParts.push(`Giá: ${minPrice} - ${maxPrice}đ`);

      await partnerDashboardAPI.updateRestaurantProfile({
        coverImage: images[0] || "",
        name,
        address,
        city,
        phone: contactPhone || String(phone),
        description,
        introduction: introParts.join(". "),
        cuisine: cuisines.join(", "),
        hasParking,
        openTime,
        closeTime,
        openDays,
        facebook,
        instagram,
        website,
      });

      router.replace("/(partner)/dashboard");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không thể hoàn tất thiết lập.";
      Alert.alert("Lỗi", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const askMediaPermission = async (type: "camera" | "library") => {
    if (type === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Cần quyền camera",
          "Vui lòng cấp quyền camera để chụp ảnh nhà hàng.",
        );
        return false;
      }
      return true;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Cần quyền thư viện",
        "Vui lòng cấp quyền thư viện để chọn ảnh nhà hàng.",
      );
      return false;
    }
    return true;
  };

  const pickFromLibrary = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(
        "Đã đạt giới hạn",
        `Bạn chỉ có thể thêm tối đa ${MAX_IMAGES} ảnh.`,
      );
      return;
    }

    const granted = await askMediaPermission("library");
    if (!granted) return;

    const remain = MAX_IMAGES - images.length;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remain,
      quality: 0.85,
    });

    if (result.canceled) return;

    const uris = result.assets.map((asset) => asset.uri).filter(Boolean);
    setImages((prev) => [...prev, ...uris].slice(0, MAX_IMAGES));
  };

  const takePhoto = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(
        "Đã đạt giới hạn",
        `Bạn chỉ có thể thêm tối đa ${MAX_IMAGES} ảnh.`,
      );
      return;
    }

    const granted = await askMediaPermission("camera");
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets.length) return;

    const nextUri = result.assets[0].uri;
    setImages((prev) => [...prev, nextUri].slice(0, MAX_IMAGES));
  };

  const openImageMenu = () => {
    Alert.alert("Thêm ảnh nhà hàng", "Chọn nguồn ảnh", [
      { text: "Chụp ảnh", onPress: takePhoto },
      { text: "Chọn từ thư viện", onPress: pickFromLibrary },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((item) => item !== uri));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <LinearGradient colors={HEADER_GRAD} style={styles.header}>
        <View style={styles.brandRow}>
          <AmbleLogo size="lg" textColor="#FFFFFF" />
        </View>
        <Text style={styles.headerTitle}>Thiết lập nhà hàng</Text>
        <Text style={styles.headerStep}>
          Bước {stepIndex + 1}/5 — {STEPS[stepIndex]}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.stepDotsRow}>
          {STEPS.map((_, index) => {
            const isDone = index < stepIndex;
            const isActive = index === stepIndex;
            return (
              <View key={index} style={styles.stepDotWrap}>
                <View
                  style={[
                    styles.stepDot,
                    isActive && styles.stepDotActive,
                    isDone && styles.stepDotDone,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </LinearGradient>

      {stepIndex === 0 && (
        <View style={styles.section}>
          <Label text="Tên nhà hàng *" />
          <Input
            placeholder="VD: The Rooftop Saigon"
            value={name}
            onChangeText={setName}
          />

          <Label text="Loại ẩm thực *" />
          <View style={styles.chipGrid}>
            {CUISINES.map((item) => (
              <Chip
                key={item}
                label={item}
                active={cuisines.includes(item)}
                onPress={() => toggleChip(item, cuisines, setCuisines)}
              />
            ))}
          </View>

          <Label text="Mô tả nhà hàng" />
          <Input
            placeholder="Mô tả không gian, phong cách, điểm nổi bật..."
            value={description}
            onChangeText={setDescription}
            multiline
            height={90}
          />

          <Label text="Phù hợp cho (chọn nhiều)" />
          <View style={styles.chipGridSmall}>
            {SUITABLE.map((item) => (
              <Chip
                key={item}
                label={item}
                active={suitable.includes(item)}
                onPress={() => toggleChip(item, suitable, setSuitable)}
              />
            ))}
          </View>

          <View style={styles.priceRow}>
            <View style={styles.priceCol}>
              <Label text="Giá thấp nhất (đ)" />
              <Input
                placeholder="100000"
                value={minPrice}
                onChangeText={setMinPrice}
              />
            </View>
            <View style={styles.priceCol}>
              <Label text="Giá cao nhất (đ)" />
              <Input
                placeholder="500000"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>
          </View>

          <View style={styles.footerRowSingle}>
            <FooterButton
              label="Tiếp theo"
              onPress={goNext}
              disabled={!name.trim()}
            />
          </View>
        </View>
      )}

      {stepIndex === 1 && (
        <View style={styles.section}>
          <Label text="Thành phố *" />
          <View style={styles.cityGrid}>
            {CITIES.map((item) => (
              <Chip
                key={item}
                label={item}
                active={city === item}
                onPress={() => setCity(item)}
                icon="location-outline"
              />
            ))}
          </View>

          <Label text="Địa chỉ đầy đủ *" />
          <Input
            placeholder="123 Nguyễn Huệ, Phường Bến Nghé, Quận 1"
            value={address}
            onChangeText={setAddress}
          />

          <Label text="Số điện thoại *" />
          <Input
            placeholder="028 1234 5678"
            value={contactPhone}
            onChangeText={setContactPhone}
            icon="call-outline"
          />

          <View style={styles.mapPlaceholder}>
            <Ionicons name="location" size={22} color="#3B82F6" />
            <Text style={styles.mapText}>
              Google Maps sẽ hiển thị sau khi xác nhận địa chỉ
            </Text>
          </View>

          <View style={styles.footerRow}>
            <GhostButton label="Quay lại" onPress={goBack} />
            <FooterButton label="Tiếp theo" onPress={goNext} />
          </View>
        </View>
      )}

      {stepIndex === 2 && (
        <View style={styles.section}>
          <Label text="Ngày mở cửa *" />
          <View style={styles.dayRow}>
            {DAY_OPTIONS.map((day) => (
              <Chip
                key={day.key}
                label={day.label}
                active={openDays.includes(day.key)}
                onPress={() => toggleChip(day.key, openDays, setOpenDays)}
                square
              />
            ))}
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Label text="Giờ mở cửa" />
              <Input
                placeholder="10:00"
                value={openTime}
                onChangeText={setOpenTime}
                icon="time-outline"
                onPress={() => setShowOpenPicker((prev) => !prev)}
              />
              {showOpenPicker ? (
                <DateTimePicker
                  value={openTimeValue}
                  mode="time"
                  is24Hour
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleOpenTimeChange}
                />
              ) : null}
            </View>
            <View style={styles.timeCol}>
              <Label text="Giờ đóng cửa" />
              <Input
                placeholder="22:00"
                value={closeTime}
                onChangeText={setCloseTime}
                icon="time-outline"
                onPress={() => setShowClosePicker((prev) => !prev)}
              />
              {showClosePicker ? (
                <DateTimePicker
                  value={closeTimeValue}
                  mode="time"
                  is24Hour
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleCloseTimeChange}
                />
              ) : null}
            </View>
          </View>

          <View style={styles.parkingRow}>
            <Text style={styles.parkingLabel}>Có bãi đỗ xe</Text>
            <TouchableOpacity
              style={[
                styles.parkingToggleTrack,
                hasParking
                  ? styles.parkingToggleTrackOn
                  : styles.parkingToggleTrackOff,
              ]}
              onPress={() => setHasParking((prev) => !prev)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.parkingToggleThumb,
                  hasParking
                    ? styles.parkingToggleThumbOn
                    : styles.parkingToggleThumbOff,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Tóm tắt giờ hoạt động</Text>
            <Text style={styles.summaryText}>
              {openTime} – {closeTime} •{" "}
              {openDays
                .map((d) => DAY_OPTIONS.find((item) => item.key === d)?.label)
                .join(", ")}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <GhostButton label="Quay lại" onPress={goBack} />
            <FooterButton label="Tiếp theo" onPress={goNext} />
          </View>
        </View>
      )}

      {stepIndex === 3 && (
        <View style={styles.section}>
          <Label text={`Ảnh nhà hàng (${images.length}/${MAX_IMAGES})`} />
          <View style={styles.imageRow}>
            {images.map((uri) => (
              <View style={styles.imageCard} key={uri}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <TouchableOpacity
                  style={styles.imageOverlay}
                  onPress={() => removeImage(uri)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < MAX_IMAGES ? (
              <TouchableOpacity
                style={styles.addImageCard}
                onPress={openImageMenu}
                activeOpacity={0.88}
              >
                <Ionicons name="camera" size={20} color="#8B8B98" />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
                <Text style={styles.addImageSub}>Camera / Thư viện</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imageLimitTag}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text style={styles.imageLimitText}>Đủ {MAX_IMAGES} ảnh</Text>
              </View>
            )}
          </View>

          <Text style={styles.helperText}>
            Ảnh chất lượng cao giúp thu hút thêm 3x khách hàng
          </Text>
          <Text style={styles.helperTextMuted}>
            Mẹo: ảnh sáng rõ, khung ngang 4:3 sẽ hiển thị đẹp hơn trên hồ sơ nhà
            hàng.
          </Text>

          <Label text="Mạng xã hội (không bắt buộc)" />
          <Input
            placeholder="instagram.com/yourrestaurant"
            value={instagram}
            onChangeText={setInstagram}
            icon="logo-instagram"
          />
          <Input
            placeholder="facebook.com/yourrestaurant"
            value={facebook}
            onChangeText={setFacebook}
            icon="logo-facebook"
          />
          <Input
            placeholder="yourrestaurant.com"
            value={website}
            onChangeText={setWebsite}
            icon="globe-outline"
          />

          <View style={styles.hashBox}>
            <Text style={styles.hashTitle}>Gợi ý: Thêm hashtag</Text>
            <View style={styles.hashRow}>
              {HASHTAGS.map((tag) => (
                <Text key={tag} style={styles.hashTag}>
                  {tag}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.footerRow}>
            <GhostButton label="Quay lại" onPress={goBack} />
            <FooterButton label="Xem lại" onPress={goNext} />
          </View>
        </View>
      )}

      {stepIndex === 4 && (
        <View style={styles.section}>
          <View style={styles.finishIcon}>
            <Text style={styles.finishEmoji}>🎉</Text>
          </View>
          <Text style={styles.finishTitle}>Gần xong rồi!</Text>
          <Text style={styles.finishSub}>
            Xem lại thông tin trước khi hoàn tất thiết lập nhà hàng của bạn
          </Text>

          <View style={styles.reviewCard}>
            {images[0] ? (
              <Image source={{ uri: images[0] }} style={styles.reviewImage} />
            ) : (
              <View style={styles.reviewImageEmpty}>
                <Ionicons name="image-outline" size={30} color="#9CA3AF" />
                <Text style={styles.reviewImageEmptyText}>Chưa có ảnh bìa</Text>
              </View>
            )}
            <View style={styles.reviewBody}>
              <Text style={styles.reviewRow}>Tên: {name || "-"}</Text>
              <Text style={styles.reviewRow}>
                Ẩm thực: {cuisines.join(", ") || "-"}
              </Text>
              <Text style={styles.reviewRow}>Địa chỉ: {address || "-"}</Text>
              <Text style={styles.reviewRow}>
                Giờ mở: {openTime} – {closeTime}
              </Text>
              <Text style={styles.reviewRow}>
                Ảnh: {images.length} ảnh đã thêm
              </Text>
            </View>
          </View>

          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={styles.successText}>
              Sau khi hoàn tất, bạn có thể thêm bàn, quản lý đặt chỗ và tùy
              chỉnh nhà hàng từ dashboard.
            </Text>
          </View>

          <View style={styles.footerRowSingle}>
            <FooterButton
              label={
                isSubmitting ? "Đang xử lý..." : "Bắt đầu quản lý nhà hàng"
              }
              onPress={handleFinish}
              disabled={isSubmitting}
            />
          </View>
          <GhostButton
            label="Chỉnh sửa thông tin"
            onPress={() => setStepIndex(0)}
          />
        </View>
      )}
    </ScrollView>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Input({
  placeholder,
  value,
  onChangeText,
  multiline,
  height,
  icon,
  onPress,
  editable,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  height?: number;
  icon?: any;
  onPress?: () => void;
  editable?: boolean;
}) {
  const isEditable = editable ?? !onPress;
  const content = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color="#A1A1AA"
          style={styles.inputIcon}
        />
      ) : null}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        editable={isEditable}
        pointerEvents={isEditable ? "auto" : "none"}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.inputWrap, height ? { height } : null]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.inputWrap, height ? { height } : null]}>
      {content}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  icon,
  square,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: any;
  square?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        square && styles.chipSquare,
        active && styles.chipActive,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? ORANGE : "#9CA3AF"}
          style={styles.chipIcon}
        />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FooterButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={["#FF7A2F", "#FF9C2F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryBtnGrad}
      >
        <Text style={styles.primaryBtnText}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.ghostBtn}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Ionicons name="chevron-back" size={14} color="#6B7280" />
      <Text style={styles.ghostBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F8" },
  scroll: { paddingBottom: 32 },

  header: {
    paddingTop: 40,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 6 },
  headerStep: { color: "rgba(255,255,255,0.85)", marginTop: 4, fontSize: 12 },

  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
  },

  stepDotsRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 12,
  },
  stepDotWrap: { alignItems: "center" },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: STEP_IDLE,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  stepDotDone: {
    backgroundColor: STEP_DONE,
    borderColor: STEP_DONE,
  },

  section: { paddingHorizontal: 18, paddingTop: 16, gap: 10 },

  label: { fontSize: 13, fontWeight: "700", color: TEXT_DARK, marginTop: 6 },

  inputWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: TEXT_DARK },
  inputMultiline: { textAlignVertical: "top" },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chipGridSmall: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipSquare: { borderRadius: 12, minWidth: 48, justifyContent: "center" },
  chipActive: {
    borderColor: ORANGE,
    backgroundColor: "#FFF2E8",
  },
  chipIcon: { marginRight: 2 },
  chipText: { fontSize: 12, color: TEXT_MUTED, fontWeight: "600" },
  chipTextActive: { color: ORANGE },

  priceRow: { flexDirection: "row", gap: 12 },
  priceCol: { flex: 1 },

  cityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  mapPlaceholder: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#B7D5FF",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F7FF",
    marginTop: 8,
    gap: 6,
    paddingHorizontal: 16,
  },
  mapText: { color: "#3B82F6", fontSize: 12, textAlign: "center" },

  footerRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  footerRowSingle: { marginTop: 12 },

  dayRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  timeRow: { flexDirection: "row", gap: 12 },
  timeCol: { flex: 1 },

  parkingRow: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  parkingLabel: { fontSize: 14, color: "#374151", fontWeight: "800" },
  parkingToggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 999,
    paddingHorizontal: 3,
    justifyContent: "center",
  },
  parkingToggleTrackOn: {
    backgroundColor: "#ff8b25",
  },
  parkingToggleTrackOff: {
    backgroundColor: "#D1D5DB",
  },
  parkingToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  parkingToggleThumbOn: {
    alignSelf: "flex-end",
  },
  parkingToggleThumbOff: {
    alignSelf: "flex-start",
  },

  summaryBox: {
    backgroundColor: "#FFF6EF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFE2CC",
    marginTop: 8,
  },
  summaryTitle: { fontWeight: "700", color: ORANGE, marginBottom: 6 },
  summaryText: { color: TEXT_DARK, fontSize: 12 },

  imageRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  imageCard: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  imageThumb: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#D1D5DB",
  },
  imageOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  addImageCard: {
    width: 88,
    height: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8D8E3",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  addImageText: { fontSize: 11, color: "#8B8B98", marginTop: 6 },
  addImageSub: { fontSize: 9.5, color: "#B0B3BE", marginTop: 2 },
  imageLimitTag: {
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ECFDF3",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  imageLimitText: { color: "#166534", fontSize: 11.5, fontWeight: "700" },
  helperText: { fontSize: 12, color: TEXT_MUTED },
  helperTextMuted: { fontSize: 11.5, color: "#9CA3AF" },

  hashBox: {
    marginTop: 6,
    backgroundColor: "#F8F8FB",
    borderRadius: 16,
    padding: 12,
  },
  hashTitle: { fontWeight: "700", color: TEXT_DARK, marginBottom: 6 },
  hashRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hashTag: {
    backgroundColor: "#FFEDE1",
    color: ORANGE,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "600",
  },

  finishIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF4E9",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  finishEmoji: { fontSize: 28 },
  finishTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  finishSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 14,
  },

  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  reviewImage: {
    height: 120,
    backgroundColor: "#D1D5DB",
  },
  reviewImageEmpty: {
    height: 120,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  reviewImageEmptyText: { color: "#9CA3AF", fontSize: 12, fontWeight: "600" },
  reviewBody: { padding: 12, gap: 4 },
  reviewRow: { fontSize: 12, color: TEXT_DARK },

  successBox: {
    marginTop: 12,
    backgroundColor: "#ECFDF3",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  successText: { flex: 1, fontSize: 12, color: "#166534" },

  primaryBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 54,
    shadowColor: ORANGE,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnGrad: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  ghostBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#F9FAFB",
  },
  ghostBtnText: { color: TEXT_MUTED, fontWeight: "600" },
});
