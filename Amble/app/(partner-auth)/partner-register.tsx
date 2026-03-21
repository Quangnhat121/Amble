import React, { useMemo, useState } from "react";
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
import { Colors } from "../../constants/theme";
import { usePartnerAuthStore } from "../../store/partnerAuthStore";
import { useI18n } from "../../hooks/use-i18n";

const PARTNER_GRAD: [string, string] = ["#FF6B35", "#FFD35A"];
const CARD_GRAD: [string, string] = ["#FF8A3D", "#FFC24B"];

type Step = "intro" | "plans" | "terms" | "payment" | "pending";
type PackageKey = "basic" | "pro" | "premium";

export default function PartnerRegisterScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { register, isLoading } = usePartnerAuthStore();
  const [step, setStep] = useState<Step>("intro");
  const [selectedPlan, setSelectedPlan] = useState<PackageKey>("pro");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [accepted, setAccepted] = useState(false);

  const [form, setForm] = useState({
    restaurantName: "",
    email: "",
    phone: "",
  });

  const planList = useMemo(
    () => [
      {
        key: "basic" as PackageKey,
        title: t("partner.register.plan.basic"),
        price: t("partner.register.plan.basicPrice"),
        priceSuffix: t("common.perMonth"),
        badge: "",
        features: [
          t("partner.register.plan.basic.feature1"),
          t("partner.register.plan.basic.feature2"),
          t("partner.register.plan.basic.feature3"),
        ],
      },
      {
        key: "pro" as PackageKey,
        title: t("partner.register.plan.pro"),
        price: t("partner.register.plan.proPrice"),
        priceSuffix: t("common.perMonth"),
        badge: t("partner.register.plan.popular"),
        features: [
          t("partner.register.plan.pro.feature1"),
          t("partner.register.plan.pro.feature2"),
          t("partner.register.plan.pro.feature3"),
          t("partner.register.plan.pro.feature4"),
          t("partner.register.plan.pro.feature5"),
          t("partner.register.plan.pro.feature6"),
        ],
      },
      {
        key: "premium" as PackageKey,
        title: t("partner.register.plan.premium"),
        price: t("partner.register.plan.premiumPrice"),
        priceSuffix: t("common.perMonth"),
        badge: t("partner.register.plan.best"),
        features: [
          t("partner.register.plan.premium.feature1"),
          t("partner.register.plan.premium.feature2"),
          t("partner.register.plan.premium.feature3"),
          t("partner.register.plan.premium.feature4"),
          t("partner.register.plan.premium.feature5"),
          t("partner.register.plan.premium.feature6"),
        ],
      },
    ],
    [t]
  );

  const benefits = useMemo(
    () => [
      {
        title: t("partner.register.benefit.revenue.title"),
        desc: t("partner.register.benefit.revenue.desc"),
        icon: "trending-up-outline",
      },
      {
        title: t("partner.register.benefit.smart.title"),
        desc: t("partner.register.benefit.smart.desc"),
        icon: "people-outline",
      },
      {
        title: t("partner.register.benefit.insights.title"),
        desc: t("partner.register.benefit.insights.desc"),
        icon: "bar-chart-outline",
      },
      {
        title: t("partner.register.benefit.voucher.title"),
        desc: t("partner.register.benefit.voucher.desc"),
        icon: "ticket-outline",
      },
      {
        title: t("partner.register.benefit.ads.title"),
        desc: t("partner.register.benefit.ads.desc"),
        icon: "megaphone-outline",
      },
      {
        title: t("partner.register.benefit.reviews.title"),
        desc: t("partner.register.benefit.reviews.desc"),
        icon: "star-outline",
      },
    ],
    [t]
  );

  const terms = useMemo(
    () => [
      {
        title: t("partner.register.terms.scope.title"),
        desc: t("partner.register.terms.scope.desc"),
      },
      {
        title: t("partner.register.terms.responsibility.title"),
        desc: t("partner.register.terms.responsibility.desc"),
      },
      {
        title: t("partner.register.terms.payment.title"),
        desc: t("partner.register.terms.payment.desc"),
      },
      {
        title: t("partner.register.terms.data.title"),
        desc: t("partner.register.terms.data.desc"),
      },
      {
        title: t("partner.register.terms.ip.title"),
        desc: t("partner.register.terms.ip.desc"),
      },
      {
        title: t("partner.register.terms.termination.title"),
        desc: t("partner.register.terms.termination.desc"),
      },
    ],
    [t]
  );

  const paymentMethods = useMemo(
    () => [
      "MoMo",
      "ZaloPay",
      "VNPay",
      "BIDV",
      "Vietcombank",
      "Techcombank",
      "ACB",
      t("partner.register.payment.credit"),
    ],
    [t]
  );

  const selectedPlanInfo = useMemo(
    () => planList.find((plan) => plan.key === selectedPlan),
    [planList, selectedPlan]
  );

  const handleNext = () => {
    if (step === "intro") setStep("plans");
    else if (step === "plans") setStep("terms");
    else if (step === "terms") setStep("payment");
  };

  const handleBack = () => {
    if (step === "plans") setStep("intro");
    else if (step === "terms") setStep("plans");
    else if (step === "payment") setStep("terms");
    else router.back();
  };

  const handleComplete = async () => {
    if (!form.restaurantName || !form.email || !form.phone) {
      Alert.alert(t("partner.register.validation.missingTitle"), t("partner.register.validation.missingMessage"));
      setStep("terms");
      return;
    }
    if (!selectedPayment) {
      Alert.alert(t("partner.register.validation.paymentTitle"), t("partner.register.validation.paymentMessage"));
      return;
    }
    try {
      await register({
        ownerName: form.restaurantName || t("partner.register.ownerFallback"),
        email: form.email,
        password: form.phone || "Amble@123",
        phone: form.phone,
        restaurantName: form.restaurantName,
        subscriptionPackage: selectedPlan,
      });
      router.replace("/restaurant-setup");
    } catch (err: any) {
      Alert.alert(t("auth.registerFailed"), err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {step !== "pending" ? (
          <View style={styles.topBar}>
            <StepDots step={step} />

            <TouchableOpacity style={styles.closeBtn} onPress={handleBack}>
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : null}

        {step === "intro" && (
          <View style={styles.pageContainer}>
            <LinearGradient colors={PARTNER_GRAD} style={styles.heroCard}>
              <Text style={styles.heroTitle}>{t("partner.register.heroTitle")}</Text>
              <Text style={styles.heroSubtitle}>{t("partner.register.heroSubtitle")}</Text>

              <View style={styles.statRow}>
                <StatPill value="50K+" label={t("partner.register.stat.users")} />
                <StatPill value="200+" label={t("partner.register.stat.restaurants")} />
                <StatPill value="4.9★" label={t("partner.register.stat.rating")} />
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>{t("partner.register.benefitsTitle")}</Text>
            <View style={styles.benefitGrid}>
              {benefits.map((benefit) => (
                <View key={benefit.title} style={styles.benefitCard}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name={benefit.icon as any} size={16} color="#FF6B35" />
                  </View>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </View>
              ))}
            </View>

            <View style={styles.testimonialCard}>
              <View style={styles.avatarRow}>
                {["NT", "LH", "AN"].map((initials) => (
                  <View key={initials} style={styles.avatarBubble}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                ))}
                <Text style={styles.testimonialMeta}>{t("partner.register.testimonial.meta")}</Text>
              </View>
              <Text style={styles.testimonialQuote}>{t("partner.register.testimonial.quote")}</Text>
              <Text style={styles.testimonialAuthor}>{t("partner.register.testimonial.author")}</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
              <LinearGradient colors={CARD_GRAD} style={styles.primaryBtnBg}>
                <Text style={styles.primaryBtnText}>{t("partner.register.cta.viewPlans")}</Text>
                <Ionicons name="chevron-forward" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === "plans" && (
          <View style={styles.pageContainer}>
            <Text style={styles.stepTitle}>{t("partner.register.plan.trialHint")}</Text>
            {planList.map((plan) => {
              const isActive = plan.key === selectedPlan;
              return (
                <TouchableOpacity
                  key={plan.key}
                  style={[styles.planCard, isActive && styles.planCardActive]}
                  onPress={() => setSelectedPlan(plan.key)}
                  activeOpacity={0.85}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planBadgeCircle}>
                      <Text style={styles.planBadgeLetter}>{plan.title[0]}</Text>
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={styles.planPrice}>
                        {plan.price}
                        <Text style={styles.planPriceSuffix}>{plan.priceSuffix}</Text>
                      </Text>
                    </View>
                    {plan.badge ? (
                      <View
                        style={[
                          styles.planTag,
                          plan.badge === t("partner.register.plan.popular")
                            ? styles.planTagPopular
                            : styles.planTagBest,
                        ]}
                      >
                        <Text style={styles.planTagText}>{plan.badge}</Text>
                      </View>
                    ) : null}
                    {isActive ? (
                      <View style={styles.planCheck}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    ) : null}
                  </View>

                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.planFeatureRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={isActive ? "#2D6AE3" : "#9CA3AF"}
                      />
                      <Text style={styles.planFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </TouchableOpacity>
              );
            })}

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={18} color="#2D6AE3" />
              <Text style={styles.infoText}>
                {t("partner.register.plan.upgradeNote")}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleBack}>
                <Text style={styles.secondaryBtnText}>{t("common.back")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
                <LinearGradient colors={CARD_GRAD} style={styles.primaryBtnBg}>
                  <Text style={styles.primaryBtnText}>{t("common.continue")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "terms" && (
          <View style={styles.pageContainer}>
            <Text style={styles.sectionTitle}>{t("partner.register.terms.title")}</Text>
            <Text style={styles.sectionHint}>{t("partner.register.terms.subtitle")}</Text>

            <InputField
              label={t("partner.register.form.restaurantName")}
              placeholder={t("partner.register.form.restaurantNamePlaceholder")}
              value={form.restaurantName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, restaurantName: value }))}
            />
            <InputField
              label={t("partner.register.form.email")}
              placeholder={t("partner.register.form.emailPlaceholder")}
              value={form.email}
              onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
            />
            <InputField
              label={t("partner.register.form.phone")}
              placeholder={t("partner.register.form.phonePlaceholder")}
              value={form.phone}
              onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
            />

            <View style={styles.termsCard}>
              <Text style={styles.termsTitle}>{t("partner.register.terms.cardTitle")}</Text>
              {terms.map((item) => (
                <View key={item.title} style={styles.termsItem}>
                  <Text style={styles.termsHeading}>{item.title}</Text>
                  <Text style={styles.termsDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.checkboxRow, accepted && styles.checkboxRowActive]}
              onPress={() => setAccepted((prev) => !prev)}
            >
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </View>
              <Text style={styles.checkboxText}>
                {t("partner.register.terms.acceptPrefix")} <Text style={styles.linkText}>{t("partner.register.terms.acceptTerms")}</Text> {t("common.and")}{" "}
                <Text style={styles.linkText}>{t("partner.register.terms.acceptPrivacy")}</Text> {t("partner.register.terms.acceptSuffix")}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleBack}>
                <Text style={styles.secondaryBtnText}>{t("common.back")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, !accepted && styles.primaryBtnDisabled]}
                onPress={handleNext}
                disabled={!accepted}
              >
                <LinearGradient colors={CARD_GRAD} style={styles.primaryBtnBg}>
                  <Text style={styles.primaryBtnText}>{t("partner.register.payment.title")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "payment" && (
          <View style={styles.pageContainer}>
            <Text style={styles.sectionTitle}>{t("partner.register.payment.title")}</Text>
            <Text style={styles.sectionHint}>{t("partner.register.payment.subtitle")}</Text>

            <View style={styles.paymentSummary}>
              <View>
                <Text style={styles.summaryTitle}>
                  {t("partner.register.payment.package", { plan: selectedPlanInfo?.title || "" })}
                </Text>
                <Text style={styles.summarySubtitle}>{t("partner.register.payment.trialLabel")}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.summaryPrice}>{selectedPlanInfo?.price}</Text>
                <Text style={styles.summaryTrial}>{t("partner.register.payment.trialValue")}</Text>
                <Text style={styles.summaryAfter}>{t("partner.register.payment.afterTrial")}</Text>
              </View>
            </View>

            <View style={styles.paymentGrid}>
              {paymentMethods.map((method) => {
                const isActive = selectedPayment === method;
                return (
                  <TouchableOpacity
                    key={method}
                    style={[styles.paymentItem, isActive && styles.paymentItemActive]}
                    onPress={() => setSelectedPayment(method)}
                  >
                    <Text style={[styles.paymentText, isActive && styles.paymentTextActive]}>
                      {method}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.secureRow}>
              <Ionicons name="shield-checkmark" size={16} color="#2FAF6C" />
              <Text style={styles.secureText}>
                {t("partner.register.payment.secureNote")}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleBack}>
                <Text style={styles.secondaryBtnText}>{t("common.back")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, !selectedPayment && styles.primaryBtnDisabled]}
                onPress={handleComplete}
                disabled={!selectedPayment || isLoading}
              >
                <LinearGradient colors={CARD_GRAD} style={styles.primaryBtnBg}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t("partner.register.cta.complete")}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "pending" && (
          <View style={styles.pageContainer}>
            <View style={styles.pendingIconWrap}>
              <View style={styles.pendingHalo}>
                <Ionicons name="time-outline" size={28} color="#FF6B35" />
              </View>
            </View>
            <Text style={styles.pendingTitle}>{t("partner.register.pending.title")}</Text>
            <Text style={styles.pendingSubtitle}>{t("partner.register.pending.subtitle")}</Text>

            <View style={styles.statusList}>
              <StatusRow
                title={t("partner.register.pending.step1.title")}
                desc={t("partner.register.pending.step1.desc")}
                status="done"
              />
              <StatusRow
                title={t("partner.register.pending.step2.title")}
                desc={t("partner.register.pending.step2.desc")}
                status="active"
              />
              <StatusRow
                title={t("partner.register.pending.step3.title")}
                desc={t("partner.register.pending.step3.desc")}
                status="pending"
              />
              <StatusRow
                title={t("partner.register.pending.step4.title")}
                desc={t("partner.register.pending.step4.desc")}
                status="pending"
                isLast
              />
            </View>

            <View style={styles.pendingHint}>
              <Text style={styles.pendingHintText}>
                {t("partner.register.pending.hintEmail")}
              </Text>
              <Text style={styles.pendingHintText}>
                {t("partner.register.pending.hintSupport")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace("/restaurant-setup")}
            >
              <LinearGradient colors={CARD_GRAD} style={styles.primaryBtnBg}>
                <Text style={styles.primaryBtnText}>{t("partner.register.cta.setupNow")}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()}>
              <Text style={styles.secondaryBtnText}>{t("common.close")}</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>{t("auth.haveAccount")} </Text>
              <Link href="/(partner-auth)/partner-login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>{t("auth.loginNow")}</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepDots({ step }: { step: Step }) {
  const activeIndex = step === "pending" ? 4 : ["intro", "plans", "terms", "payment"].indexOf(step);
  return (
    <View style={styles.stepper}>
      {[0, 1, 2, 3].map((index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                isActive && styles.stepCircleActive,
                isDone && styles.stepCircleDone,
              ]}
            >
              {isDone ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : (
                <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < 3 ? <View style={[styles.stepLine, isDone && styles.stepLineDone]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputBox}>
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

function StatusRow({
  title,
  desc,
  status,
  isLast,
}: {
  title: string;
  desc: string;
  status: "done" | "active" | "pending";
  isLast?: boolean;
}) {
  const icon =
    status === "done" ? "checkmark" : status === "active" ? "ellipse" : "ellipse-outline";
  const color =
    status === "done" ? "#22C55E" : status === "active" ? "#F97316" : "#E5E7EB";
  const bgColor = status === "pending" ? "#FFFFFF" : color;
  const iconColor = status === "pending" ? "#E5E7EB" : "#FFFFFF";
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusLeft}>
        <View
          style={[
            styles.statusDot,
            {
              borderColor: color,
              backgroundColor: bgColor,
            },
          ]}
        >
          <Ionicons name={icon as any} size={12} color={iconColor} />
        </View>
        {!isLast ? <View style={styles.statusLine} /> : null}
      </View>
      <View style={styles.statusContent}>
        <Text style={styles.statusTitle}>{title}</Text>
        <Text style={styles.statusDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingBottom: 40 },

  topBar: {
    paddingTop: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#FF8A3D",
  },
  stepCircleDone: {
    backgroundColor: "#22C55E",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepLine: {
    width: 28,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 6,
  },
  stepLineDone: {
    backgroundColor: "#22C55E",
  },

  pageContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  heroCard: {
    borderRadius: 20,
    padding: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
    fontSize: 12,
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  statPill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 10,
  },

  sectionTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  sectionHint: {
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 16,
    fontSize: 12,
  },

  benefitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  benefitCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 12,
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF1E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  benefitTitle: {
    fontWeight: "700",
    fontSize: 12,
    color: "#111827",
  },
  benefitDesc: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },

  testimonialCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  avatarBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FED7AA",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9A3412",
  },
  testimonialMeta: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: 6,
  },
  testimonialQuote: {
    fontSize: 12,
    color: "#92400E",
    marginTop: 8,
  },
  testimonialAuthor: {
    fontSize: 11,
    color: "#F97316",
    marginTop: 6,
    fontWeight: "600",
  },

  primaryBtn: {
    marginTop: 18,
    borderRadius: 20,
    overflow: "hidden",
  },
  primaryBtnBg: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },

  stepTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },

  planCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  planCardActive: {
    borderColor: "#2D6AE3",
    backgroundColor: "#EFF6FF",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  planBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  planBadgeLetter: {
    fontWeight: "700",
    fontSize: 16,
    color: "#6B7280",
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontWeight: "700",
    fontSize: 14,
  },
  planPrice: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 16,
  },
  planPriceSuffix: {
    color: "#6B7280",
    fontWeight: "400",
    fontSize: 12,
  },
  planTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planTagPopular: {
    backgroundColor: "#2563EB",
  },
  planTagBest: {
    backgroundColor: "#7C3AED",
  },
  planTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  planCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  planFeatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  planFeatureText: {
    color: "#374151",
    fontSize: 12,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#E0F2FE",
    borderRadius: 14,
    padding: 12,
  },
  infoText: {
    color: "#1D4ED8",
    fontSize: 11,
    flex: 1,
  },

  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 6,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  input: {
    fontSize: 13,
    color: "#111827",
  },

  termsCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#fff",
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  termsItem: {
    marginBottom: 10,
  },
  termsHeading: {
    fontWeight: "700",
    fontSize: 12,
  },
  termsDesc: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  checkboxRowActive: {
    borderColor: "#F97316",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  checkboxText: {
    flex: 1,
    fontSize: 11,
    color: "#4B5563",
  },
  linkText: {
    color: "#F97316",
    fontWeight: "600",
  },

  paymentSummary: {
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTitle: {
    fontWeight: "700",
    fontSize: 13,
  },
  summarySubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  summaryRight: {
    alignItems: "flex-end",
  },
  summaryPrice: {
    fontWeight: "700",
    color: "#2563EB",
  },
  summaryTrial: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "600",
  },
  summaryAfter: {
    color: "#6B7280",
    fontSize: 10,
  },

  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  paymentItem: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  paymentItemActive: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  paymentText: {
    fontWeight: "600",
    color: "#111827",
    fontSize: 12,
  },
  paymentTextActive: {
    color: "#2563EB",
  },

  secureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    backgroundColor: "#ECFDF3",
    borderRadius: 12,
    padding: 10,
  },
  secureText: {
    fontSize: 11,
    color: "#15803D",
    flex: 1,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    alignItems: "center",
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  secondaryBtnText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 12,
  },

  pendingIconWrap: {
    alignItems: "center",
    marginTop: 24,
  },
  pendingHalo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: "#FFE8D1",
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },
  pendingSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
  },
  statusList: {
    marginTop: 18,
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statusLeft: {
    alignItems: "center",
  },
  statusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLine: {
    width: 2,
    height: 36,
    backgroundColor: "#E5E7EB",
    marginTop: 2,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusDesc: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  pendingHint: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FFF7ED",
  },
  pendingHintText: {
    fontSize: 11,
    color: "#6B7280",
  },
  pendingBold: {
    color: "#111827",
    fontWeight: "700",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: Colors.textSecondary,
  },
  loginLink: {
    color: "#FF6B35",
    fontWeight: "700",
  },
});