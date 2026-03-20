import React, { useState } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, SafeAreaView, ActivityIndicator, TextInput, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { bookingAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "../../hooks/use-i18n";

const PRIMARY = "#FF6B35";

type PaymentId = "momo" | "zalopay" | "bank" | "credit";

const VOUCHERS = [
    { code: "AMBLE10",  discount: 10,    minBill: 50000,  isPercent: true  },
    { code: "GENZ2025", discount: 20000, minBill: 100000, isPercent: false },
    { code: "VIP50",    discount: 50000, minBill: 200000, isPercent: false },
];


export default function ConfirmBookingScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { t, locale } = useI18n();
    const paymentMethods: { id: PaymentId; name: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { id: "momo", name: t("payment.momo"), icon: "wallet-outline" },
        { id: "zalopay", name: t("payment.zalopay"), icon: "phone-portrait-outline" },
        { id: "bank", name: t("payment.bank"), icon: "business-outline" },
        { id: "credit", name: t("payment.credit"), icon: "card-outline" },
    ];
    const tableTypeLabels: Record<string, string> = {
        vip: `✨ ${t("table.type.vip")}`,
        view: `🌆 ${t("table.type.view")}`,
        regular: `🪑 ${t("table.type.standard")}`,
        standard: `🪑 ${t("table.type.standard")}`,
    };
    const {
        restaurantId, restaurantName, tableId, tableName,
        tableType, tableImage, deposit, date, time, partySize,
    } = useLocalSearchParams<{
        restaurantId: string; restaurantName: string;
        tableId: string; tableName: string; tableType?: string;
        tableImage?: string; deposit: string; date?: string;
        time?: string; partySize?: string;
    }>();

    const depositAmt = parseInt(deposit || "0");

    const [loading, setLoading]                 = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentId>("momo");
    const [showPayments, setShowPayments]       = useState(false);
    const [voucherInput, setVoucherInput]       = useState("");
    const [appliedVoucher, setAppliedVoucher]   = useState<typeof VOUCHERS[0] | null>(null);
    const [voucherError, setVoucherError]       = useState("");
    const [note, setNote]                       = useState("");

    const discount = appliedVoucher
        ? appliedVoucher.isPercent
            ? depositAmt * appliedVoucher.discount / 100
            : appliedVoucher.discount
        : 0;
    const total = Math.max(0, depositAmt - discount);

    const applyVoucher = () => {
        const found = VOUCHERS.find(v => v.code.toUpperCase() === voucherInput.toUpperCase());
        if (found) {
                if (depositAmt >= found.minBill) { setAppliedVoucher(found); setVoucherError(""); }
                else setVoucherError(t("confirm.voucherMin", { min: (found.minBill/1000).toFixed(0) }));
            } else setVoucherError(t("confirm.voucherInvalid"));
    };

    const bookingData = { date: date || "", time: time || "19:00", partySize: partySize || "2" };
    const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" }); }
        catch { return d; }
    };

    const handleConfirm = async () => {
        if (!user?._id) { Alert.alert(t("auth.error"), t("confirm.loginRequired")); return; }
        setLoading(true);
        try {
            const res = await bookingAPI.create({
                userId: user._id,
                restaurantId: restaurantId as string,
                tableId: tableId as string,
                date: bookingData.date,
                time: bookingData.time,
                partySize: parseInt(bookingData.partySize),
                purpose: "casual",
                specialRequests: note,
                paymentMethod: selectedPayment,
                voucherCode: appliedVoucher?.code,
                voucherDiscount: discount,
            });
            const booking = res.data.booking;
            router.push({
                pathname: "/booking/success" as any,
                params: {
                    restaurantName, restaurantImage: tableImage, tableName,
                    date: bookingData.date, time: bookingData.time,
                    partySize: bookingData.partySize,
                    deposit: total.toString(),
                    bookingId: booking.bookingNumber || booking._id,
                },
            });
        } catch (err: any) {
            Alert.alert(t("auth.error"), err.response?.data?.message || t("confirm.bookingFailed"));
        } finally { setLoading(false); }
    };

    const selectedPM = paymentMethods.find(p => p.id === selectedPayment);

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>{t("confirm.title")}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                {/* Nhà hàng */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("confirm.section.restaurant")}</Text>
                    <View style={s.card}>
                        <Image source={{ uri: tableImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400" }} style={s.restaurantImage} />
                        <View style={s.restaurantInfo}>
                            <Text style={s.restaurantName}>{restaurantName}</Text>
                            <Text style={s.restaurantAddress}>{t("confirm.cityFallback")}</Text>
                        </View>
                    </View>
                </View>

                {/* Bàn */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("confirm.section.table")}</Text>
                    <View style={s.card}>
                        <Image source={{ uri: tableImage || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400" }} style={s.tableImage} />
                        <View style={s.tableInfo}>
                            <Text style={s.tableName}>{tableName}</Text>
                            <Text style={s.tableFeatures}>{tableTypeLabels[tableType || ""] || "🪑"}</Text>
                        </View>
                    </View>
                </View>

                {/* Chi tiết */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("confirm.section.details")}</Text>
                    <View style={s.detailsCard}>
                        <View style={s.detailRow}>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                            <Text style={s.detailLabel}>{t("confirm.label.date")}</Text>
                            <Text style={s.detailValue}>{formatDate(bookingData.date)}</Text>
                        </View>
                        <View style={s.divider} />
                        <View style={s.detailRow}>
                            <Ionicons name="time-outline" size={20} color="#666" />
                            <Text style={s.detailLabel}>{t("confirm.label.time")}</Text>
                            <Text style={s.detailValue}>{bookingData.time}</Text>
                        </View>
                        <View style={s.divider} />
                        <View style={s.detailRow}>
                            <Ionicons name="people-outline" size={20} color="#666" />
                            <Text style={s.detailLabel}>{t("confirm.label.people")}</Text>
                            <Text style={s.detailValue}>{bookingData.partySize} {t("common.peopleUnit")}</Text>
                        </View>
                    </View>
                </View>

                {/* Ghi chú */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("confirm.section.note")}</Text>
                    <TextInput
                        style={s.noteInput} placeholder={t("confirm.label.notePlaceholder")}
                        placeholderTextColor="#9CA3AF" value={note} onChangeText={setNote}
                        multiline numberOfLines={3} textAlignVertical="top"
                    />
                </View>

                {/* Voucher */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("confirm.section.voucher")}</Text>
                    <View style={s.voucherRow}>
                        <TextInput
                            style={s.voucherInput} placeholder="AMBLE10, GENZ2025..."
                            placeholderTextColor="#9CA3AF" value={voucherInput}
                            onChangeText={v => { setVoucherInput(v); setVoucherError(""); }}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity style={s.applyWrap} onPress={applyVoucher} activeOpacity={0.85}>
                            <LinearGradient colors={["#FF6B35","#FFD700"]} style={s.applyBtn} start={{x:0,y:0}} end={{x:1,y:0}}>
                                <Text style={s.applyBtnTxt}>{t("confirm.apply")}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    {!!voucherError && <Text style={s.voucherErr}>{voucherError}</Text>}
                    {appliedVoucher && (
                        <View style={s.appliedRow}>
                            <Text style={s.appliedTxt}>{t("confirm.voucherApplied", { code: appliedVoucher.code })}</Text>
                            <TouchableOpacity onPress={() => { setAppliedVoucher(null); setVoucherInput(""); }}>
                                <Text style={{ fontSize: 11, color: "#EF4444" }}>{t("confirm.remove")}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={s.quickRow}>
                        {VOUCHERS.map(v => (
                            <TouchableOpacity key={v.code} style={s.quickChip}
                                onPress={() => { setVoucherInput(v.code); setVoucherError(""); }}>
                                <Text style={s.quickChipTxt}>{v.code}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Phương thức thanh toán */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("confirm.section.payment")}</Text>
                    <TouchableOpacity style={s.pmSelector} onPress={() => setShowPayments(v => !v)} activeOpacity={0.8}>
                        <Ionicons name={selectedPM?.icon} size={22} color="#1A1A1A" />
                        <Text style={s.pmSelectorName}>{selectedPM?.name}</Text>
                        <Ionicons name={showPayments ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                    {showPayments && (
                        <View style={s.pmList}>
                            {paymentMethods.map((pm, i) => (
                                <TouchableOpacity key={pm.id}
                                    style={[s.pmOption, selectedPayment === pm.id && s.pmOptionActive, i < paymentMethods.length - 1 && s.pmOptionBorder]}
                                    onPress={() => { setSelectedPayment(pm.id); setShowPayments(false); }}>
                                    <Ionicons name={pm.icon} size={20} color="#1A1A1A" />
                                    <Text style={s.pmOptionName}>{pm.name}</Text>
                                    {selectedPayment === pm.id && <View style={s.pmCheck}><Text style={{ color: "#fff", fontSize: 11 }}>✓</Text></View>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Tổng tiền */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>{t("confirm.section.total")}</Text>
                    <View style={s.priceCard}>
                        <View style={s.priceRow}>
                            <Text style={s.priceLabel}>{t("confirm.deposit")}</Text>
                            <Text style={s.priceValue}>{depositAmt.toLocaleString(locale)}đ</Text>
                        </View>
                        {discount > 0 && (
                            <View style={s.priceRow}>
                                <Text style={[s.priceLabel, { color: "#22C55E" }]}>{t("confirm.voucherDiscount")}</Text>
                                <Text style={[s.priceValue, { color: "#22C55E" }]}>-{discount.toLocaleString(locale)}đ</Text>
                            </View>
                        )}
                        <View style={[s.priceRow, s.totalRow]}>
                            <Text style={s.totalLabel}>{t("confirm.totalPay")}</Text>
                            <Text style={s.totalValue}>{total.toLocaleString(locale)}đ</Text>
                        </View>
                    </View>
                </View>

                <View style={s.infoBox}>
                    <Ionicons name="information-circle-outline" size={14} color={PRIMARY} style={{ marginTop: 1 }} />
                    <Text style={s.infoTxt}>Tiền cọc sẽ được trừ vào hóa đơn khi đến nhà hàng. Hủy trước 2 giờ: hoàn tiền cọc.</Text>
                    <Text style={s.infoTxt}>{t("confirm.info")}</Text>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={s.bottomBar}>
                <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} disabled={loading} activeOpacity={0.8}>
                    <LinearGradient colors={loading ? ["#E5E7EB","#E5E7EB"] : ["#FF6B35","#FFD700"]} style={s.confirmBtnInner} start={{x:0,y:0}} end={{x:1,y:0}}>
                        {loading
                            ? <><ActivityIndicator color="#999" /><Text style={[s.confirmBtnText, { color: "#999" }]}>{t("confirm.processing")}</Text></>
                            : <><Ionicons name="checkmark-circle-outline" size={22} color="#fff" /><Text style={s.confirmBtnText}>{t("confirm.confirmPay")}</Text></>
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FAFAFA" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, paddingTop: 35, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.95)", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    scroll: { flex: 1 },
    section: { paddingHorizontal: 16, marginTop: 20 },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: "#666", marginBottom: 10 },
    card: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", overflow: "hidden" },
    restaurantImage: { width: 80, height: 80 },
    restaurantInfo: { flex: 1, padding: 12, justifyContent: "center" },
    restaurantName: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    restaurantAddress: { fontSize: 13, color: "#666" },
    tableImage: { width: 100, height: 100 },
    tableInfo: { flex: 1, padding: 12 },
    tableName: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    tableFeatures: { fontSize: 12, color: "#666" },
    detailsCard: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", padding: 16 },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
    detailLabel: { flex: 1, fontSize: 14, color: "#666" },
    detailValue: { fontSize: 14, fontWeight: "600", color: "#000" },
    divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 4 },
    noteInput: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", padding: 14, fontSize: 14, color: "#1A1A1A", minHeight: 80 },
    voucherRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    voucherInput: { flex: 1, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: "#1A1A1A" },
    applyWrap: { borderRadius: 12, overflow: "hidden" },
    applyBtn: { paddingHorizontal: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
    applyBtnTxt: { fontSize: 13, fontWeight: "700", color: "#fff" },
    voucherErr: { fontSize: 12, color: "#EF4444", marginBottom: 6 },
    appliedRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ECFDF5", borderColor: "#86EFAC", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },
    appliedTxt: { fontSize: 12, color: "#22C55E", fontWeight: "700" },
    quickRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 2 },
    quickChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#FF6B35", borderStyle: "dashed" },
    quickChipTxt: { fontSize: 11, color: "#FF6B35", fontWeight: "700" },
    pmSelector: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", paddingHorizontal: 16, paddingVertical: 14 },
    pmSelectorName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1A1A1A" },
    pmList: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginTop: 6, overflow: "hidden" },
    pmOption: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff" },
    pmOptionActive: { backgroundColor: "#FFF3ED" },
    pmOptionBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    pmOptionName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#374151" },
    pmCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FF6B35", alignItems: "center", justifyContent: "center" },
    priceCard: { backgroundColor: "#FAFAFA", borderRadius: 12, borderWidth: 1, borderColor: "#eee", padding: 16 },
    priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
    priceLabel: { fontSize: 14, color: "#6B7280" },
    priceValue: { fontSize: 14, fontWeight: "700", color: "#1A1A1A" },
    totalRow: { borderTopWidth: 1, borderTopColor: "#E5E7EB", marginTop: 8, paddingTop: 12 },
    totalLabel: { fontSize: 16, fontWeight: "800", color: "#1A1A1A" },
    totalValue: { fontSize: 20, fontWeight: "900", color: "#FF6B35" },
    infoBox: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginHorizontal: 16, marginTop: 16, backgroundColor: "#FFF3ED", borderRadius: 12, padding: 12 },
    infoTxt: { flex: 1, fontSize: 12, color: "#FF6B35", lineHeight: 18 },
    bottomBar: { padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
    confirmBtn: { borderRadius: 12, overflow: "hidden" },
    confirmBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
    confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});