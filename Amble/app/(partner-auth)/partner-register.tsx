import React, { useEffect, useMemo, useState } from "react";
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
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { partnerAuthAPI } from "../../services/api";
import { AppLanguage, useLanguageStore } from "../../store/languageStore";
import AmbleLogo from "../../components/AmbleLogo";

const PARTNER_GRAD: [string, string] = ["#FF6B35", "#FFD700"];
const DARK_GRAD: [string, string] = ["#1A1A1A", "#333333"];

const PRIMARY = "#FF6B35";
const BLUE = "#3B82F6";
const PURPLE = "#9333EA";
const GREEN = "#22C55E";
const TEXT = "#111827";
const TEXT_SEC = "#6B7280";
const TEXT_MUTED = "#9CA3AF";
const BG = "#FFFFFF";
const SURFACE = "#FFFFFF";
const SOFT_BG = "#FAFAFA";
const BORDER = "#E5E7EB";

type Copy = {
  steps: string[];
  headerSubtitles: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  statsGuests: string;
  statsRestaurants: string;
  statsRating: string;
  benefitsTitle: string;
  socialProofTitle: string;
  socialProofText: string;
  socialProofAuthor: string;
  viewPlans: string;
  planSectionTitle: string;
  planSectionSubtitle: string;
  planInfoText: string;
  back: string;
  continue: string;
  detailsTitle: string;
  detailsSubtitle: string;
  fieldRestaurantName: string;
  fieldRestaurantPlaceholder: string;
  fieldEmail: string;
  fieldEmailPlaceholder: string;
  fieldPhone: string;
  fieldPhonePlaceholder: string;
  termsTitle: string;
  termsScopeTitle: string;
  termsScopeText: string;
  termsResponsibilitiesTitle: string;
  termsResponsibilitiesText: string;
  termsPaymentTitle: string;
  termsPaymentText: string;
  termsAgreeText: string;
  proceedPayment: string;
  paymentTitle: string;
  paymentSubtitle: string;
  selectedPlan: string;
  perMonth: string;
  trialInfo: string;
  paymentNotice: string;
  processing: string;
  completeRegistration: string;
  pendingTitle: string;
  pendingSubtitle: string;
  pendingSteps: string[];
  pendingNote: string;
  setupNow: string;
  close: string;
  haveAccount: string;
  signIn: string;
  missingInfoTitle: string;
  missingInfoMessage: string;
  invalidEmailTitle: string;
  invalidEmailMessage: string;
  termsAlertTitle: string;
  termsAlertMessage: string;
  chooseMethodTitle: string;
  chooseMethodMessage: string;
  registerFailTitle: string;
  registerFailMessage: string;
};

const COPY_EN: Copy = {
  steps: ["Intro", "Plans", "Details", "Payment", "Done"],
  headerSubtitles: [
    "Growth platform for modern restaurants",
    "Pick the plan that fits your business",
    "Share partnership details to get started",
    "Complete the last step to submit",
  ],
  heroEyebrow: "Vietnam’s restaurant growth platform",
  heroTitle: "Amble Partner",
  heroSubtitle:
    "Operate smarter, grow reservations, and build your restaurant brand in one platform.",
  statsGuests: "Guests/day",
  statsRestaurants: "Restaurants",
  statsRating: "Rating",
  benefitsTitle: "Benefits of joining",
  socialProofTitle: "+200 restaurants trust us",
  socialProofText:
    "Revenue grew 40% after 3 months with Amble Partner. The operations dashboard is clear, easy to track, and more efficient.",
  socialProofAuthor: "– Nguyen Minh Tuan, The Rooftop Saigon",
  viewPlans: "View plans",
  planSectionTitle: "Choose a plan",
  planSectionSubtitle: "You can upgrade or change plans anytime.",
  planInfoText:
    "Prorated charges apply if you upgrade during the current cycle.",
  back: "Back",
  continue: "Continue",
  detailsTitle: "Details & terms",
  detailsSubtitle:
    "Provide partnership details and confirm the terms to proceed.",
  fieldRestaurantName: "Restaurant / business name",
  fieldRestaurantPlaceholder: "e.g. The Rooftop Saigon",
  fieldEmail: "Contact email",
  fieldEmailPlaceholder: "owner@restaurant.vn",
  fieldPhone: "Phone number",
  fieldPhonePlaceholder: "0901 234 567",
  termsTitle: "AMBLE PARTNER TERMS",
  termsScopeTitle: "1. Scope of service",
  termsScopeText:
    "Amble provides a platform connecting customers and restaurants, including reservations, table management, menu display, brand promotion, and related marketing tools.",
  termsResponsibilitiesTitle: "2. Partner responsibilities",
  termsResponsibilitiesText:
    "Partners commit to accurate information, maintain service quality, keep table status updated, and respond to customers promptly.",
  termsPaymentTitle: "3. Payments & refunds",
  termsPaymentText:
    "Subscriptions are billed monthly. Partners may cancel anytime, but the current paid cycle is non-refundable.",
  termsAgreeText:
    "I have read and agree to the Partnership Terms and Privacy Policy of Amble Partner.",
  proceedPayment: "Proceed to payment",
  paymentTitle: "Payment",
  paymentSubtitle: "Choose a payment method to complete your submission.",
  selectedPlan: "Selected plan",
  perMonth: "/month",
  trialInfo: "14-day free trial • Billing starts after the trial",
  paymentNotice:
    "Your payment information is protected with 256-bit SSL encryption. Amble does not store your card details.",
  processing: "Processing...",
  completeRegistration: "Complete registration",
  pendingTitle: "Registration pending approval",
  pendingSubtitle:
    "Your profile was submitted successfully. The Amble team will review it within 1–2 business days.",
  pendingSteps: [
    "Submitted",
    "Under review",
    "Confirmation email",
    "Get started",
  ],
  pendingNote:
    "A confirmation was sent to your email. Questions? partner@amble.vn or 1800 9999.",
  setupNow: "Set up your restaurant now",
  close: "Close",
  haveAccount: "Already have an account? ",
  signIn: "Sign in",
  missingInfoTitle: "Missing information",
  missingInfoMessage: "Please fill in all required fields.",
  invalidEmailTitle: "Invalid email",
  invalidEmailMessage: "Please enter a valid email address.",
  termsAlertTitle: "Terms not accepted",
  termsAlertMessage: "Please agree to the partnership terms to continue.",
  chooseMethodTitle: "Select a method",
  chooseMethodMessage: "Please choose a payment method.",
  registerFailTitle: "Registration failed",
  registerFailMessage: "Please try again later.",
};

const COPY_VI: Copy = {
  steps: ["Giới thiệu", "Gói đăng ký", "Thông tin", "Thanh toán", "Hoàn tất"],
  headerSubtitles: [
    "Nền tảng tăng trưởng dành cho nhà hàng hiện đại",
    "Chọn gói phù hợp với quy mô kinh doanh của bạn",
    "Điền thông tin hợp tác để bắt đầu",
    "Hoàn tất bước cuối để gửi hồ sơ",
  ],
  heroEyebrow: "Nền tảng tăng trưởng nhà hàng hàng đầu Việt Nam",
  heroTitle: "Amble Partner",
  heroSubtitle:
    "Quản lý vận hành, tăng đơn đặt bàn và phát triển thương hiệu nhà hàng của bạn trong một nền tảng duy nhất.",
  statsGuests: "Khách/ngày",
  statsRestaurants: "Nhà hàng",
  statsRating: "Đánh giá",
  benefitsTitle: "Lợi ích khi tham gia",
  socialProofTitle: "+200 nhà hàng đang tin dùng",
  socialProofText:
    "“Doanh thu tăng 40% sau 3 tháng dùng Amble Partner. Hệ thống quản lý rất tiện, dễ theo dõi và hiệu quả hơn hẳn.”",
  socialProofAuthor: "– Nguyễn Minh Tuấn, The Rooftop Saigon",
  viewPlans: "Xem các gói đăng ký",
  planSectionTitle: "Chọn gói đăng ký",
  planSectionSubtitle: "Bạn có thể nâng cấp hoặc đổi gói bất cứ lúc nào.",
  planInfoText:
    "Phí chênh lệch sẽ được tính theo tỷ lệ ngày còn lại nếu bạn nâng cấp gói trong chu kỳ hiện tại.",
  back: "Quay lại",
  continue: "Tiếp tục",
  detailsTitle: "Thông tin & điều khoản",
  detailsSubtitle:
    "Vui lòng cung cấp thông tin hợp tác và xác nhận điều khoản.",
  fieldRestaurantName: "Tên nhà hàng / doanh nghiệp",
  fieldRestaurantPlaceholder: "VD: The Rooftop Saigon",
  fieldEmail: "Email liên hệ",
  fieldEmailPlaceholder: "owner@restaurant.vn",
  fieldPhone: "Số điện thoại",
  fieldPhonePlaceholder: "0901 234 567",
  termsTitle: "ĐIỀU KHOẢN HỢP TÁC AMBLE PARTNER",
  termsScopeTitle: "1. Phạm vi dịch vụ",
  termsScopeText:
    "Amble cung cấp nền tảng kết nối khách hàng và nhà hàng, bao gồm đặt bàn, quản lý bàn, hiển thị thực đơn, quảng bá thương hiệu và các công cụ marketing liên quan.",
  termsResponsibilitiesTitle: "2. Trách nhiệm đối tác",
  termsResponsibilitiesText:
    "Đối tác cam kết cung cấp thông tin chính xác, duy trì chất lượng dịch vụ, cập nhật trạng thái bàn và phản hồi khách hàng kịp thời.",
  termsPaymentTitle: "3. Thanh toán & hoàn tiền",
  termsPaymentText:
    "Phí thuê bao được tính theo chu kỳ tháng. Đối tác có thể hủy bất cứ lúc nào, tuy nhiên hệ thống không hoàn tiền cho chu kỳ đã thanh toán.",
  termsAgreeText:
    "Tôi đã đọc và đồng ý với Điều khoản hợp tác và Chính sách bảo mật của Amble Partner.",
  proceedPayment: "Thanh toán",
  paymentTitle: "Thanh toán",
  paymentSubtitle: "Chọn phương thức thanh toán để hoàn tất hồ sơ.",
  selectedPlan: "Gói đã chọn",
  perMonth: "/tháng",
  trialInfo: "14 ngày miễn phí • Bắt đầu thanh toán sau thời gian dùng thử",
  paymentNotice:
    "Thông tin thanh toán của bạn được mã hóa SSL 256-bit. Amble không lưu thông tin thẻ của bạn.",
  processing: "Đang xử lý...",
  completeRegistration: "Hoàn tất đăng ký",
  pendingTitle: "Đơn đăng ký đang chờ duyệt",
  pendingSubtitle:
    "Hồ sơ của bạn đã được gửi thành công. Đội ngũ Amble sẽ xét duyệt trong vòng 1–2 ngày làm việc.",
  pendingSteps: [
    "Đã gửi hồ sơ",
    "Xét duyệt hồ sơ",
    "Nhận email xác nhận",
    "Bắt đầu sử dụng",
  ],
  pendingNote:
    "Xác nhận đã được gửi đến email của bạn. Có thắc mắc, vui lòng liên hệ partner@amble.vn hoặc 1800 9999.",
  setupNow: "Thiết lập nhà hàng ngay",
  close: "Đóng",
  haveAccount: "Đã có tài khoản? ",
  signIn: "Đăng nhập",
  missingInfoTitle: "Thiếu thông tin",
  missingInfoMessage: "Vui lòng nhập đủ thông tin bắt buộc.",
  invalidEmailTitle: "Email không hợp lệ",
  invalidEmailMessage: "Vui lòng nhập email đúng định dạng.",
  termsAlertTitle: "Chưa đồng ý điều khoản",
  termsAlertMessage: "Vui lòng đồng ý điều khoản hợp tác để tiếp tục.",
  chooseMethodTitle: "Chọn phương thức",
  chooseMethodMessage: "Vui lòng chọn phương thức thanh toán.",
  registerFailTitle: "Đăng ký thất bại",
  registerFailMessage: "Vui lòng thử lại sau.",
};

const COPY: Record<AppLanguage, Copy> = {
  vi: COPY_VI,
  en: COPY_EN,
  zh: COPY_EN,
  ko: COPY_EN,
  ja: COPY_EN,
  other: COPY_EN,
};

const BENEFITS_VI = [
  {
    title: "Tăng doanh thu",
    desc: "Tiếp cận hàng nghìn khách hàng GenZ và khách du lịch quốc tế mỗi ngày",
    icon: "trending-up-outline",
  },
  {
    title: "Quản lý thông minh",
    desc: "Dashboard toàn diện: bàn, đơn đặt, voucher và đánh giá trong một nơi",
    icon: "people-outline",
  },
  {
    title: "Phân tích dữ liệu",
    desc: "Hiểu khách hàng qua thống kê chi tiết, đưa ra quyết định kinh doanh tốt hơn",
    icon: "bar-chart-outline",
  },
  {
    title: "Voucher & khuyến mãi",
    desc: "Tạo và quản lý chương trình khuyến mãi thu hút khách mới, giữ chân khách cũ",
    icon: "pricetag-outline",
  },
  {
    title: "Gói quảng cáo",
    desc: "Xuất hiện nổi bật trên trang chủ, đề xuất AI và top kết quả tìm kiếm",
    icon: "megaphone-outline",
  },
  {
    title: "Đánh giá đa nguồn",
    desc: "Tổng hợp đánh giá từ Amble, Google, TikTok để tăng uy tín thương hiệu",
    icon: "star-outline",
  },
];

const BENEFITS_EN = [
  {
    title: "Grow revenue",
    desc: "Reach thousands of Gen Z diners and international travelers every day",
    icon: "trending-up-outline",
  },
  {
    title: "Smart operations",
    desc: "All-in-one dashboard: tables, bookings, vouchers, and reviews",
    icon: "people-outline",
  },
  {
    title: "Data insights",
    desc: "Understand guests with detailed analytics to make better decisions",
    icon: "bar-chart-outline",
  },
  {
    title: "Vouchers & promos",
    desc: "Create promotions to attract new guests and retain loyal ones",
    icon: "pricetag-outline",
  },
  {
    title: "Ad packages",
    desc: "Get featured on home, AI recommendations, and top search results",
    icon: "megaphone-outline",
  },
  {
    title: "Unified reviews",
    desc: "Aggregate Amble, Google, and TikTok reviews to build credibility",
    icon: "star-outline",
  },
];

type PackageFeature = {
  text: string;
  included: boolean;
};

type PackageItem = {
  key: "basic" | "pro" | "premium";
  label: string;
  price: string;
  badge: string;
  tone: string;
  border: string;
  accent: string;
  iconBg: string;
  features: PackageFeature[];
};

const FALLBACK_PACKAGES: PackageItem[] = [
  {
    key: "basic",
    label: "Basic",
    price: "299.000đ",
    badge: "",
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
    price: "799.000đ",
    badge: "Phổ biến",
    tone: "#EFF6FF",
    border: "#93C5FD",
    accent: BLUE,
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
    price: "1.499.000đ",
    badge: "Cao cấp",
    tone: "#FAF5FF",
    border: "#C4B5FD",
    accent: PURPLE,
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

const PAYMENT_METHODS_VI = [
  {
    id: "MoMo",
    label: "MoMo",
    color: "#A50064",
    bg: "#FFF0F7",
    icon: "wallet-outline",
  },
  {
    id: "ZaloPay",
    label: "ZaloPay",
    color: "#0068FF",
    bg: "#F0F5FF",
    icon: "card-outline",
  },
  {
    id: "VNPay",
    label: "VNPay",
    color: "#E10019",
    bg: "#FFF0F0",
    icon: "card-outline",
  },
  {
    id: "BIDV",
    label: "BIDV",
    color: "#005BAA",
    bg: "#F0F4FF",
    icon: "business-outline",
  },
  {
    id: "Vietcombank",
    label: "Vietcombank",
    color: "#007B40",
    bg: "#F0FFF5",
    icon: "business-outline",
  },
  {
    id: "Techcombank",
    label: "Techcombank",
    color: "#CC0000",
    bg: "#FFF5F5",
    icon: "business-outline",
  },
  {
    id: "ACB",
    label: "ACB",
    color: "#F59E0B",
    bg: "#FFFBF0",
    icon: "business-outline",
  },
  {
    id: "Thẻ tín dụng",
    label: "Thẻ tín dụng",
    color: "#1A1A1A",
    bg: "#F5F5F5",
    icon: "card-outline",
  },
];

const PAYMENT_METHODS_EN = [
  {
    id: "MoMo",
    label: "MoMo",
    color: "#A50064",
    bg: "#FFF0F7",
    icon: "wallet-outline",
  },
  {
    id: "ZaloPay",
    label: "ZaloPay",
    color: "#0068FF",
    bg: "#F0F5FF",
    icon: "card-outline",
  },
  {
    id: "VNPay",
    label: "VNPay",
    color: "#E10019",
    bg: "#FFF0F0",
    icon: "card-outline",
  },
  {
    id: "BIDV",
    label: "BIDV",
    color: "#005BAA",
    bg: "#F0F4FF",
    icon: "business-outline",
  },
  {
    id: "Vietcombank",
    label: "Vietcombank",
    color: "#007B40",
    bg: "#F0FFF5",
    icon: "business-outline",
  },
  {
    id: "Techcombank",
    label: "Techcombank",
    color: "#CC0000",
    bg: "#FFF5F5",
    icon: "business-outline",
  },
  {
    id: "ACB",
    label: "ACB",
    color: "#F59E0B",
    bg: "#FFFBF0",
    icon: "business-outline",
  },
  {
    id: "Credit card",
    label: "Credit card",
    color: "#1A1A1A",
    bg: "#F5F5F5",
    icon: "card-outline",
  },
];

type PackageKey = "basic" | "pro" | "premium";
type PaymentMethodItem = (typeof PAYMENT_METHODS_VI)[number];

export default function PartnerRegisterScreen() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const copyLanguage: AppLanguage = language ?? "vi";
  const copy = useMemo(() => COPY[copyLanguage], [copyLanguage]);
  const benefits = useMemo(
    () => (copyLanguage === "vi" ? BENEFITS_VI : BENEFITS_EN),
    [copyLanguage],
  );
  const [packages, setPackages] = useState<PackageItem[]>(FALLBACK_PACKAGES);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const paymentMethods = useMemo(
    () => (copyLanguage === "vi" ? PAYMENT_METHODS_VI : PAYMENT_METHODS_EN),
    [copyLanguage],
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>("pro");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    phone: "",
    restaurantName: "",
    restaurantAddress: "",
    restaurantCity: "",
    cuisine: "",
    password: "",
    confirmPassword: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const selectedPackageData = useMemo(
    () => packages.find((item) => item.key === selectedPackage),
    [packages, selectedPackage],
  );

  useEffect(() => {
    let mounted = true;

    const loadPackages = async () => {
      try {
        const res = await partnerAuthAPI.getPackages();
        const packageData = res.data?.packages || [];

        if (mounted && packageData.length > 0) {
          setPackages(packageData);
        }
      } catch (error) {
        if (mounted) {
          setPackages(FALLBACK_PACKAGES);
        }
      } finally {
        if (mounted) {
          setIsLoadingPackages(false);
        }
      }
    };

    loadPackages();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (packages.length === 0) return;

    const matched = packages.some((item) => item.key === selectedPackage);
    if (!matched) {
      setSelectedPackage(packages[0].key);
    }
  }, [packages, selectedPackage]);

  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const validateAccount = () => {
    if (
      !form.restaurantName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      Alert.alert(copy.missingInfoTitle, copy.missingInfoMessage);
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      Alert.alert(copy.invalidEmailTitle, copy.invalidEmailMessage);
      return false;
    }

    return true;
  };

  const goNext = async () => {
    if (stepIndex === 2) {
      if (!validateAccount()) return;

      if (!acceptedTerms) {
        Alert.alert(copy.termsAlertTitle, copy.termsAlertMessage);
        return;
      }
    }

    if (stepIndex === 3) {
      if (!selectedPayment) {
        Alert.alert(copy.chooseMethodTitle, copy.chooseMethodMessage);
        return;
      }
      await submitRegistration();
      return;
    }

    setStepIndex((prev) => Math.min(prev + 1, copy.steps.length - 1));
  };

  const submitRegistration = async () => {
    try {
      setIsSubmitting(true);

      await partnerAuthAPI.register({
        ownerName: form.ownerName.trim() || form.restaurantName.trim(),
        email: form.email,
        password: form.password || form.phone,
        phone: form.phone,
        restaurantName: form.restaurantName,
        restaurantAddress: form.restaurantAddress,
        restaurantCity: form.restaurantCity,
        cuisine: form.cuisine,
        subscriptionPackage: selectedPackage,
      });

      setStepIndex(4);
    } catch (err: any) {
      Alert.alert(
        copy.registerFailTitle,
        err?.response?.data?.message ||
          err?.message ||
          copy.registerFailMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitle = copy.steps[stepIndex];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {stepIndex < 4 && (
          <LinearGradient colors={PARTNER_GRAD} style={styles.headerGradient}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity onPress={goBack} style={styles.headerIconBtn}>
                <Ionicons name="arrow-back" size={18} color="#fff" />
              </TouchableOpacity>

              <View style={styles.brandRow}>
                <AmbleLogo size="lg" textColor="#FFFFFF" />
              </View>

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerIconBtn}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.headerTitle}>{stepTitle}</Text>
            <Text style={styles.headerSubTitle}>
              {copy.headerSubtitles[stepIndex] || ""}
            </Text>

            <View style={styles.stepperWrap}>
              {copy.steps.map((_, index) => {
                const isActive = index === stepIndex;
                const isDone = index < stepIndex;
                return (
                  <View key={index} style={styles.stepperItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isActive && styles.stepDotActive,
                        isDone && styles.stepDotDone,
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      ) : (
                        <Text
                          style={[
                            styles.stepDotText,
                            isActive && styles.stepDotTextActive,
                          ]}
                        >
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    {index < copy.steps.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          index < stepIndex && styles.stepLineDone,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        )}

        {stepIndex === 0 && (
          <View style={styles.sectionWrap}>
            <LinearGradient colors={PARTNER_GRAD} style={styles.heroCard}>
              <View style={styles.heroBubbleBig} />
              <View style={styles.heroBubbleMid} />
              <View style={styles.heroBubbleSmall} />

              <Text style={styles.heroEyebrow}>{copy.heroEyebrow}</Text>
              <Text style={styles.heroTitle}>{copy.heroTitle}</Text>
              <Text style={styles.heroSubtitle}>{copy.heroSubtitle}</Text>

              <View style={styles.heroStatsRow}>
                <StatBadge value="50K+" label={copy.statsGuests} />
                <StatBadge value="200+" label={copy.statsRestaurants} />
                <StatBadge value="4.9" label={copy.statsRating} />
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>{copy.benefitsTitle}</Text>

            <View style={styles.benefitGrid}>
              {benefits.map((item, index) => (
                <BenefitCard key={index} {...item} />
              ))}
            </View>

            <View style={styles.socialProofCard}>
              <View style={styles.socialProofTop}>
                <Ionicons name="checkmark-circle" size={18} color={GREEN} />
                <Text style={styles.socialProofTitle}>
                  {copy.socialProofTitle}
                </Text>
              </View>
              <Text style={styles.socialProofText}>{copy.socialProofText}</Text>
              <Text style={styles.socialProofAuthor}>
                {copy.socialProofAuthor}
              </Text>
            </View>

            <PrimaryButton label={copy.viewPlans} onPress={goNext} showArrow />
          </View>
        )}

        {stepIndex === 1 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{copy.planSectionTitle}</Text>
            <Text style={styles.sectionSubtitle}>
              {copy.planSectionSubtitle}
            </Text>

            {isLoadingPackages ? (
              <View style={styles.packageLoadingWrap}>
                <ActivityIndicator color={PRIMARY} />
                <Text style={styles.packageLoadingText}>
                  Đang tải gói dịch vụ...
                </Text>
              </View>
            ) : (
              packages.map((item) => (
                <PackageCard
                  key={item.key}
                  item={item}
                  selected={item.key === selectedPackage}
                  onSelect={() => setSelectedPackage(item.key as PackageKey)}
                />
              ))
            )}

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={BLUE}
              />
              <Text style={styles.infoText}>{copy.planInfoText}</Text>
            </View>

            <View style={styles.rowButtons}>
              <SecondaryButton
                label={copy.back}
                onPress={goBack}
                containerStyle={styles.rowButtonItem}
              />
              <PrimaryButton
                label={copy.continue}
                onPress={goNext}
                showArrow
                containerStyle={styles.rowButtonItem}
              />
            </View>
          </View>
        )}

        {stepIndex === 2 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{copy.detailsTitle}</Text>
            <Text style={styles.sectionSubtitle}>{copy.detailsSubtitle}</Text>

            <Field
              label={copy.fieldRestaurantName}
              placeholder={copy.fieldRestaurantPlaceholder}
              value={form.restaurantName}
              onChangeText={(v) => update("restaurantName", v)}
            />

            <Field
              label={copy.fieldEmail}
              placeholder={copy.fieldEmailPlaceholder}
              value={form.email}
              onChangeText={(v) => update("email", v)}
            />

            <Field
              label={copy.fieldPhone}
              placeholder={copy.fieldPhonePlaceholder}
              value={form.phone}
              onChangeText={(v) => update("phone", v)}
            />

            <View style={styles.termsCard}>
              <Text style={styles.termsTitle}>{copy.termsTitle}</Text>

              <View style={styles.termsBlock}>
                <Text style={styles.termsItemTitle}>
                  {copy.termsScopeTitle}
                </Text>
                <Text style={styles.termsText}>{copy.termsScopeText}</Text>
              </View>

              <View style={styles.termsBlock}>
                <Text style={styles.termsItemTitle}>
                  {copy.termsResponsibilitiesTitle}
                </Text>
                <Text style={styles.termsText}>
                  {copy.termsResponsibilitiesText}
                </Text>
              </View>

              <View style={styles.termsBlock}>
                <Text style={styles.termsItemTitle}>
                  {copy.termsPaymentTitle}
                </Text>
                <Text style={styles.termsText}>{copy.termsPaymentText}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.checkboxCard,
                acceptedTerms && styles.checkboxCardActive,
              ]}
              onPress={() => setAcceptedTerms((prev) => !prev)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              >
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>

              <Text style={styles.checkboxText}>{copy.termsAgreeText}</Text>
            </TouchableOpacity>

            <View style={styles.rowButtons}>
              <SecondaryButton
                label={copy.back}
                onPress={goBack}
                containerStyle={styles.rowButtonItem}
              />
              <PrimaryButton
                label={copy.proceedPayment}
                onPress={goNext}
                showArrow
                containerStyle={styles.rowButtonItem}
              />
            </View>
          </View>
        )}

        {stepIndex === 3 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{copy.paymentTitle}</Text>
            <Text style={styles.sectionSubtitle}>{copy.paymentSubtitle}</Text>

            <LinearGradient
              colors={["#F5F0FF", "#FBF8FF"]}
              style={styles.packageSummary}
            >
              <View style={styles.packageSummaryTop}>
                <View>
                  <Text style={styles.packageSummaryLabel}>
                    {copy.selectedPlan}
                  </Text>
                  <Text style={styles.packageSummaryTitle}>
                    {selectedPackageData?.label}
                  </Text>
                </View>

                <View style={styles.packageSummaryPriceWrap}>
                  <Text style={styles.packageSummaryPrice}>
                    {selectedPackageData?.price}
                  </Text>
                  <Text style={styles.packageSummaryPer}>{copy.perMonth}</Text>
                </View>
              </View>

              <Text style={styles.packageTrial}>{copy.trialInfo}</Text>
            </LinearGradient>

            <View style={styles.paymentGrid}>
              {paymentMethods.map((method) => (
                <PaymentOption
                  key={method.id}
                  method={method}
                  active={selectedPayment === method.id}
                  onPress={() => setSelectedPayment(method.id)}
                />
              ))}
            </View>

            <View style={styles.noticeBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={GREEN}
              />
              <Text style={styles.noticeText}>{copy.paymentNotice}</Text>
            </View>

            <View style={styles.rowButtons}>
              <SecondaryButton
                label={copy.back}
                onPress={goBack}
                containerStyle={styles.rowButtonItem}
              />
              <PrimaryButton
                label={
                  isSubmitting ? copy.processing : copy.completeRegistration
                }
                onPress={goNext}
                loading={isSubmitting}
                showArrow
                containerStyle={styles.rowButtonItem}
              />
            </View>
          </View>
        )}

        {stepIndex === 4 && (
          <View style={styles.sectionWrap}>
            <View style={styles.pendingHero}>
              <LinearGradient colors={PARTNER_GRAD} style={styles.pendingIcon}>
                <Ionicons name="time-outline" size={30} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.pendingTitle}>{copy.pendingTitle}</Text>
            <Text style={styles.pendingSubtitle}>{copy.pendingSubtitle}</Text>

            <View style={styles.pendingStepsCard}>
              <PendingItem label={copy.pendingSteps[0]} active />
              <PendingItem label={copy.pendingSteps[1]} active={false} />
              <PendingItem label={copy.pendingSteps[2]} active={false} />
              <PendingItem label={copy.pendingSteps[3]} active={false} isLast />
            </View>

            <View style={styles.pendingNote}>
              <Ionicons name="mail-outline" size={18} color={PRIMARY} />
              <Text style={styles.pendingNoteText}>{copy.pendingNote}</Text>
            </View>

            <PrimaryButton
              label={copy.setupNow}
              onPress={() =>
                router.replace({
                  pathname: "/(partner-auth)/partner-setup" as never,
                  params: { email: form.email, phone: form.phone },
                })
              }
              showArrow
            />

            <SecondaryButton label={copy.close} onPress={() => router.back()} />
          </View>
        )}

        {stepIndex < 4 && (
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{copy.haveAccount}</Text>
            <Link href="/(partner-auth)/partner-login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>{copy.signIn}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={TEXT_MUTED}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBadge}>
      <Text style={styles.statBadgeValue}>{value}</Text>
      <Text style={styles.statBadgeLabel}>{label}</Text>
    </View>
  );
}

function BenefitCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: any;
}) {
  return (
    <View style={styles.benefitCard}>
      <View style={styles.benefitIconWrap}>
        <Ionicons name={icon} size={18} color={PRIMARY} />
      </View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDesc}>{desc}</Text>
    </View>
  );
}

function PackageCard({
  item,
  selected,
  onSelect,
}: {
  item: PackageItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.packageCard,
        {
          backgroundColor: item.tone,
          borderColor: selected ? item.accent : item.border,
          shadowColor: selected ? item.accent : "#000",
        },
        selected && styles.packageCardSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.92}
    >
      {!!item.badge && (
        <View style={[styles.floatingBadge, { backgroundColor: item.accent }]}>
          <Text style={styles.floatingBadgeText}>{item.badge}</Text>
        </View>
      )}

      <View style={[styles.packageIcon, { backgroundColor: item.iconBg }]}>
        <Text style={[styles.packageIconText, { color: item.accent }]}>
          {item.label[0]}
        </Text>
      </View>

      <View style={styles.packageMain}>
        <View style={styles.packageTop}>
          <Text style={styles.packageName}>{item.label}</Text>
          <View style={styles.packagePriceRow}>
            <Text style={[styles.packagePrice, { color: item.accent }]}>
              {item.price}
            </Text>
            <Text style={styles.packagePer}>/tháng</Text>
          </View>
        </View>

        <View style={styles.featureList}>
          {item.features.map((feature, index: number) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons
                name={
                  feature.included ? "checkmark-circle" : "close-circle-outline"
                }
                size={16}
                color={feature.included ? item.accent : TEXT_MUTED}
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
      </View>

      {selected && (
        <View style={[styles.selectedTick, { backgroundColor: item.accent }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

function PaymentOption({
  method,
  active,
  onPress,
}: {
  method: PaymentMethodItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        {
          backgroundColor: method.bg,
          borderColor: active ? method.color : BORDER,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.paymentCardTop}>
        <View style={[styles.paymentIcon, { backgroundColor: "#FFFFFFCC" }]}>
          <Ionicons name={method.icon as any} size={16} color={method.color} />
        </View>

        {active && (
          <View
            style={[styles.paymentCheck, { backgroundColor: method.color }]}
          >
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
      </View>

      <Text style={[styles.paymentText, { color: method.color }]}>
        {method.label}
      </Text>
    </TouchableOpacity>
  );
}

function PendingItem({
  label,
  active,
  isLast,
}: {
  label: string;
  active: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={styles.pendingItemRow}>
      <View style={styles.pendingLeft}>
        <View
          style={[
            styles.pendingDot,
            active ? styles.pendingDotActive : styles.pendingDotIdle,
          ]}
        >
          {active && <Ionicons name="checkmark" size={13} color="#fff" />}
        </View>
        {!isLast && <View style={styles.pendingConnector} />}
      </View>

      <Text
        style={[styles.pendingItemText, !active && styles.pendingItemTextMuted]}
      >
        {label}
      </Text>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  loading,
  showArrow,
  containerStyle,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  showArrow?: boolean;
  containerStyle?: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, containerStyle]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.9}
    >
      <LinearGradient colors={PARTNER_GRAD} style={styles.primaryBtnGrad}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.primaryBtnContent}>
            <Text style={styles.primaryBtnText}>{label}</Text>
            {showArrow && (
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  label,
  onPress,
  containerStyle,
}: {
  label: string;
  onPress: () => void;
  containerStyle?: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.secondaryBtn, containerStyle]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 42,
  },

  headerGradient: {
    paddingTop: 58,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  headerSubTitle: {
    color: "rgba(255,255,255,0.82)",
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },

  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  stepperItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  stepDotActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },

  stepDotDone: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  stepDotText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },

  stepDotTextActive: {
    color: PRIMARY,
  },

  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 6,
  },

  stepLineDone: {
    backgroundColor: "#fff",
  },

  sectionWrap: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  heroCard: {
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
    marginBottom: 22,
  },

  heroBubbleBig: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -40,
    top: -35,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  heroBubbleMid: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    right: 18,
    bottom: -16,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  heroBubbleSmall: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    left: -10,
    bottom: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  heroEyebrow: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "700",
  },

  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.92)",
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },

  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  statBadge: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  statBadgeValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  statBadgeLabel: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 11,
    marginTop: 3,
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
  },

  sectionSubtitle: {
    color: TEXT_SEC,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },

  benefitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  benefitCard: {
    width: "48.2%",
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F1F1F4",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  benefitIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF3ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  benefitTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },

  benefitDesc: {
    color: TEXT_SEC,
    fontSize: 11.5,
    lineHeight: 17,
  },

  socialProofCard: {
    marginTop: 8,
    backgroundColor: "#FFF8F2",
    borderWidth: 1,
    borderColor: "#FFE6D3",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },

  socialProofTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  socialProofTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT,
  },

  socialProofText: {
    color: TEXT_SEC,
    lineHeight: 20,
    fontSize: 13,
  },

  socialProofAuthor: {
    marginTop: 8,
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 12.5,
  },

  packageCard: {
    position: "relative",
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
  },

  packageCardSelected: {
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  floatingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  floatingBadgeText: {
    color: "#fff",
    fontSize: 10.5,
    fontWeight: "800",
  },

  packageIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 4,
  },

  packageIconText: {
    fontSize: 18,
    fontWeight: "900",
  },

  packageMain: {
    flex: 1,
  },

  packageTop: {
    marginBottom: 10,
  },

  packageName: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT,
  },

  packagePriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },

  packagePrice: {
    fontSize: 17,
    fontWeight: "900",
  },

  packagePer: {
    fontSize: 12,
    color: TEXT_SEC,
  },

  featureList: {
    gap: 8,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  featureText: {
    flex: 1,
    color: TEXT_SEC,
    fontSize: 13,
    lineHeight: 18,
  },

  featureTextDisabled: {
    color: TEXT_MUTED,
  },

  packageLoadingWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    backgroundColor: "#FFFBF8",
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14,
  },

  packageLoadingText: {
    color: TEXT_SEC,
    fontSize: 13,
    fontWeight: "600",
  },

  selectedTick: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  infoBox: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    backgroundColor: "#EEF6FF",
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    marginBottom: 18,
  },

  infoText: {
    flex: 1,
    color: "#46658B",
    fontSize: 12.5,
    lineHeight: 18,
  },

  rowButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  rowButtonItem: {
    flex: 1,
    marginBottom: 0,
  },

  inputGroup: {
    marginBottom: 14,
  },

  label: {
    color: TEXT_SEC,
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 7,
  },

  inputWrapper: {
    backgroundColor: SURFACE,
    borderWidth: 1.2,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
  },

  input: {
    color: TEXT,
    fontSize: 14,
  },

  termsCard: {
    backgroundColor: "#FFFDFB",
    borderWidth: 1,
    borderColor: "#F1E6DC",
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
  },

  termsTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },

  termsBlock: {
    marginBottom: 10,
  },

  termsItemTitle: {
    color: TEXT,
    fontSize: 12.5,
    fontWeight: "800",
    marginBottom: 4,
  },

  termsText: {
    color: TEXT_SEC,
    fontSize: 12.5,
    lineHeight: 19,
  },

  checkboxCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
    marginBottom: 18,
    backgroundColor: "#FAFAFA",
    borderWidth: 1.2,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 14,
  },

  checkboxCardActive: {
    backgroundColor: "#FFF7EF",
    borderColor: "#F7C8A2",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },

  checkboxChecked: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  checkboxText: {
    flex: 1,
    color: TEXT_SEC,
    fontSize: 12.5,
    lineHeight: 19,
  },

  packageSummary: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDD0FF",
    marginBottom: 16,
  },

  packageSummaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  packageSummaryLabel: {
    color: TEXT_SEC,
    fontSize: 12,
    marginBottom: 4,
  },

  packageSummaryTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  packageSummaryPriceWrap: {
    alignItems: "flex-end",
  },

  packageSummaryPrice: {
    color: PURPLE,
    fontSize: 18,
    fontWeight: "900",
  },

  packageSummaryPer: {
    color: TEXT_SEC,
    fontSize: 12,
    marginTop: 2,
  },

  packageTrial: {
    color: GREEN,
    marginTop: 10,
    fontSize: 12.5,
    fontWeight: "700",
  },

  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  paymentCard: {
    width: "48.2%",
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  paymentCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  paymentIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentText: {
    fontSize: 13,
    fontWeight: "800",
  },

  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EEF9F1",
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 18,
  },

  noticeText: {
    flex: 1,
    color: "#19764A",
    fontSize: 12.5,
    lineHeight: 18,
  },

  pendingHero: {
    alignItems: "center",
    marginTop: 10,
  },

  pendingIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
  },

  pendingTitle: {
    marginTop: 18,
    color: TEXT,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  pendingSubtitle: {
    marginTop: 8,
    color: TEXT_SEC,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  pendingStepsCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: "#F0F0F4",
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },

  pendingItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  pendingLeft: {
    alignItems: "center",
    marginRight: 12,
  },

  pendingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  pendingDotActive: {
    backgroundColor: PRIMARY,
  },

  pendingDotIdle: {
    backgroundColor: "#E5E7EB",
  },

  pendingConnector: {
    width: 2,
    height: 22,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },

  pendingItemText: {
    color: TEXT,
    fontSize: 13.5,
    fontWeight: "700",
    paddingTop: 2,
    paddingBottom: 26,
  },

  pendingItemTextMuted: {
    color: TEXT_SEC,
    fontWeight: "600",
  },

  pendingNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFF7EF",
    borderWidth: 1,
    borderColor: "#F8DFC5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  pendingNoteText: {
    flex: 1,
    color: "#80543A",
    fontSize: 12.5,
    lineHeight: 18,
  },

  primaryBtn: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: PRIMARY,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  primaryBtnGrad: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  primaryBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  secondaryBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SURFACE,
  },

  secondaryBtnText: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 14,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },

  loginText: {
    color: TEXT_SEC,
    fontSize: 14,
  },

  loginLink: {
    color: PRIMARY,
    fontWeight: "800",
    fontSize: 14,
  },
});
