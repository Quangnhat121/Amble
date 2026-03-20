import React, { useCallback, useEffect, useState } from "react";
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Alert, RefreshControl, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { bookingAPI } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "../../hooks/use-i18n";

const PRIMARY = "#FF6B35";

type Tab = "active" | "completed" | "cancelled";

const STATUS_DISPLAY_COLORS: Record<string, { color: string; bg: string }> = {
    draft:     { color: "#92400E", bg: "#FEF3C7" },
    confirmed: { color: "#065F46", bg: "#D1FAE5" },
    paid:      { color: "#1D4ED8", bg: "#DBEAFE" },
    completed: { color: "#374151", bg: "#F3F4F6" },
    cancelled: { color: "#991B1B", bg: "#FEE2E2" },
};

export default function BookingHistoryScreen() {
    const router   = useRouter();
    const { user } = useAuthStore();
    const { t, locale } = useI18n();

    const tabConfig: { id: Tab; label: string; statuses: string[] }[] = [
        { id: "active",    label: t("history.tab.active"),  statuses: ["confirmed", "paid", "draft"] },
        { id: "completed", label: t("history.tab.completed"),   statuses: ["completed"] },
        { id: "cancelled", label: t("history.tab.cancelled"),    statuses: ["cancelled"] },
    ];

    const statusDisplay: Record<string, { label: string; color: string; bg: string }> = {
        draft:     { label: t("history.status.draft"), color: STATUS_DISPLAY_COLORS.draft.color, bg: STATUS_DISPLAY_COLORS.draft.bg },
        confirmed: { label: t("history.status.confirmed"),  color: STATUS_DISPLAY_COLORS.confirmed.color, bg: STATUS_DISPLAY_COLORS.confirmed.bg },
        paid:      { label: t("history.status.paid"), color: STATUS_DISPLAY_COLORS.paid.color, bg: STATUS_DISPLAY_COLORS.paid.bg },
        completed: { label: t("history.status.completed"),   color: STATUS_DISPLAY_COLORS.completed.color, bg: STATUS_DISPLAY_COLORS.completed.bg },
        cancelled: { label: t("history.status.cancelled"),       color: STATUS_DISPLAY_COLORS.cancelled.color, bg: STATUS_DISPLAY_COLORS.cancelled.bg },
    };

    const [activeTab, setActiveTab]   = useState<Tab>("active");
    const [bookings, setBookings]     = useState<any[]>([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelling, setCancelling] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        if (!user?._id) return;
        try {
            const res = await bookingAPI.getUserBookings(user._id);
            setBookings(res.data.bookings || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?._id]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const onRefresh = () => { setRefreshing(true); fetchBookings(); };

    const handleCancel = (bookingId: string, bookingNumber: string) => {
        Alert.alert(
            t("history.cancelTitle"),
            t("history.cancelConfirm", { bookingNumber }),
            [
                { text: t("history.cancelNo"), style: "cancel" },
                {
                    text: t("history.cancelYes"),
                    style: "destructive",
                    onPress: async () => {
                        setCancelling(bookingId);
                        try {
                            await bookingAPI.cancel(bookingId, t("history.cancelReason"));
                            // Cập nhật local state
                            setBookings(prev =>
                                prev.map(b =>
                                    b._id === bookingId ? { ...b, status: "cancelled" } : b
                                )
                            );
                            Alert.alert(t("history.cancelSuccessTitle"), t("history.cancelSuccessMessage"));
                        } catch (err: any) {
                            Alert.alert(t("auth.error"), err.response?.data?.message || t("history.cancelError"));
                        } finally {
                            setCancelling(null);
                        }
                    },
                },
            ]
        );
    };

    const currentTab = tabConfig.find(t => t.id === activeTab)!;
    const filteredBookings = bookings.filter(b =>
        currentTab.statuses.includes(b.status)
    );

    const renderItem = ({ item }: { item: any }) => {
        const restaurant = item.restaurantId;
        const table      = item.tableId;
        const status     = statusDisplay[item.status] || statusDisplay.draft;
        const canCancel  = ["draft", "confirmed", "paid"].includes(item.status);

        return (
            <View style={c.card}>
                {/* Restaurant image */}
                <Image
                    source={{ uri: restaurant?.images?.[0] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400" }}
                    style={c.cardImg}
                />

                <View style={c.cardBody}>
                    {/* Header */}
                    <View style={c.cardHeaderRow}>
                        <Text style={c.restName} numberOfLines={1}>{restaurant?.name || t("history.restaurantFallback")}</Text>
                        <View style={[c.statusBadge, { backgroundColor: status.bg }]}>
                            <Text style={[c.statusTxt, { color: status.color }]}>{status.label}</Text>
                        </View>
                    </View>

                    {/* Details */}
                    <View style={c.detailRow}>
                        <Ionicons name="restaurant-outline" size={13} color="#9CA3AF" />
                        <Text style={c.detailTxt}>{table?.name || t("history.tableFallback")}</Text>
                    </View>
                    <View style={c.detailRow}>
                        <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                        <Text style={c.detailTxt}>{item.bookingDetails?.date}  •  {item.bookingDetails?.time}</Text>
                    </View>
                    <View style={c.detailRow}>
                        <Ionicons name="people-outline" size={13} color="#9CA3AF" />
                        <Text style={c.detailTxt}>{item.bookingDetails?.partySize} {t("common.peopleUnit")}</Text>
                    </View>

                    {/* Footer */}
                    <View style={c.cardFooter}>
                        <View>
                            <Text style={c.depositLabel}>{t("history.deposit")}</Text>
                            <Text style={c.depositValue}>
                                {item.pricing?.totalAmount?.toLocaleString(locale)}đ
                            </Text>
                        </View>
                        <Text style={c.bookingNum}>#{item.bookingNumber}</Text>
                    </View>

                    {/* Cancel button */}
                    {canCancel && (
                        <TouchableOpacity
                            style={c.cancelBtn}
                            onPress={() => handleCancel(item._id, item.bookingNumber)}
                            disabled={cancelling === item._id}
                            activeOpacity={0.7}
                        >
                            {cancelling === item._id
                                ? <ActivityIndicator size="small" color="#EF4444" />
                                : <Text style={c.cancelTxt}>{t("history.cancelYes")}</Text>
                            }
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={s.headerTitle}>{t("history.header")}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View style={s.tabBar}>
                {tabConfig.map(tab => {
                    const count = bookings.filter(b => tab.statuses.includes(b.status)).length;
                    const active = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[s.tab, active && s.tabActive]}
                            onPress={() => setActiveTab(tab.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[s.tabTxt, active && s.tabTxtActive]}>
                                {tab.label}{count > 0 ? ` (${count})` : ""}
                            </Text>
                            {active && <View style={s.tabIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={PRIMARY} />
                </View>
            ) : filteredBookings.length === 0 ? (
                <View style={s.center}>
                    <Text style={{ fontSize: 48 }}>📋</Text>
                    <Text style={s.emptyTxt}>{t("history.empty")}</Text>
                    <TouchableOpacity
                        style={s.exploreBtn}
                        onPress={() => router.push("/(tabs)/")}
                        activeOpacity={0.8}
                    >
                        <LinearGradient colors={["#FF6B35","#FFD700"]} style={s.exploreBtnInner} start={{x:0,y:0}} end={{x:1,y:0}}>
                            <Text style={s.exploreBtnTxt}>{t("history.explore")}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, gap: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingTop: 35, paddingBottom: 14,
        backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee",
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A" },
    tabBar: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee" },
    tab: { flex: 1, alignItems: "center", paddingVertical: 14, position: "relative" },
    tabActive: {},
    tabTxt: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
    tabTxtActive: { color: PRIMARY, fontWeight: "700" },
    tabIndicator: { position: "absolute", bottom: 0, left: "20%", right: "20%", height: 2, backgroundColor: PRIMARY, borderRadius: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyTxt: { fontSize: 16, color: "#9CA3AF", fontWeight: "600" },
    exploreBtn: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
    exploreBtnInner: { paddingHorizontal: 24, paddingVertical: 12 },
    exploreBtnTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

const c = StyleSheet.create({
    card: {
        backgroundColor: "#fff", borderRadius: 16,
        overflow: "hidden", shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
        shadowRadius: 8, elevation: 3,
    },
    cardImg: { width: "100%", height: 120 },
    cardBody: { padding: 14 },
    cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    restName: { fontSize: 16, fontWeight: "800", color: "#1A1A1A", flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    statusTxt: { fontSize: 11, fontWeight: "700" },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
    detailTxt: { fontSize: 13, color: "#6B7280" },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
    depositLabel: { fontSize: 11, color: "#9CA3AF" },
    depositValue: { fontSize: 16, fontWeight: "800", color: PRIMARY },
    bookingNum: { fontSize: 12, fontWeight: "700", color: "#9CA3AF" },
    cancelBtn: {
        marginTop: 10, paddingVertical: 10, borderRadius: 10,
        borderWidth: 1, borderColor: "#EF4444", alignItems: "center",
    },
    cancelTxt: { fontSize: 13, fontWeight: "700", color: "#EF4444" },
});