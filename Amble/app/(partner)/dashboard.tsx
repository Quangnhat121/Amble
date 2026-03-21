import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePartnerAuthStore } from '../../store/partnerAuthStore';
import { PartnerBottomNav } from '../../components/partner/PartnerBottomNav';
import { useI18n } from '../../hooks/use-i18n';

const { width } = Dimensions.get('window');

// ── Mock data (thay bằng API call thực tế) ────────────────────────────────────
const MOCK_BOOKINGS = [
  {
    id: 'bk-001', userName: 'Minh Châu', userPhone: '0901234567',
    tableNumber: 'VIEW-01', date: '2026-03-12', time: '19:00',
    guests: 2, status: 'pending', depositAmount: 200000,
    restaurantId: 'r1',
  },
  {
    id: 'bk-002', userName: 'Trần Văn Hùng', userPhone: '0912345678',
    tableNumber: 'VIP-02', date: '2026-03-12', time: '20:00',
    guests: 4, status: 'pending', depositAmount: 500000,
    restaurantId: 'r1',
  },
  {
    id: 'bk-003', userName: 'Lê Thị Mai', userPhone: '0923456789',
    tableNumber: 'TB-05', date: '2026-03-12', time: '18:30',
    guests: 3, status: 'confirmed', depositAmount: 150000,
    restaurantId: 'r1',
  },
];

const MOCK_STATS = {
  totalTables: 24,
  availableTables: 16,
  bookedTables: 8,
  revenue: 12500000,
  revenueGrowth: 23,
  weeklyData: [45, 65, 40, 80, 55, 90, 70],
};

const WEEK_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const PACKAGE_CONFIG = {
  basic:   { label: 'Basic',   color: '#6B7280', bg: '#F9FAFB' },
  pro:     { label: 'Pro',     color: '#3B82F6', bg: '#EFF6FF' },
  premium: { label: 'Premium', color: '#9333EA', bg: '#FAF5FF' },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function PartnerDashboard() {
  const router = useRouter();
  const { partner, restaurant, logout } = usePartnerAuthStore();
  const { t, locale } = useI18n();

  const [bookings, setBookings] = useState(MOCK_BOOKINGS);

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const todayBookings = bookings.filter((b) => b.date === todayStr);

  const pkg = PACKAGE_CONFIG[partner?.subscriptionPackage || 'basic'];

  // ── Animations ──────────────────────────────────────────────────────────────
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim  = useRef(new Animated.Value(0)).current;
  const chartAnim  = useRef(new Animated.Value(0)).current;
  const ordersAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(headerAnim,  { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(statsAnim,   { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }),
      Animated.spring(chartAnim,   { toValue: 1, useNativeDriver: true, tension: 50, friction: 10 }),
      Animated.spring(ordersAnim,  { toValue: 1, useNativeDriver: true, tension: 50, friction: 10 }),
      Animated.spring(actionsAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 10 }),
    ]).start();

    // Pulse for pending badge
    if (pendingBookings.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const slideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleConfirm = (id: string) => {
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'confirmed' } : b));
  };

  const handleReject = (id: string) => {
    Alert.alert(t('partner.dashboard.rejectTitle'), t('partner.dashboard.rejectMessage'), [
      { text: t('partner.dashboard.rejectCancel'), style: 'cancel' },
      {
        text: t('partner.dashboard.rejectConfirm'), style: 'destructive',
        onPress: () => setBookings((prev) =>
          prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b)
        ),
      },
    ]);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <Animated.View style={[styles.header, slideUp(headerAnim)]}>
          <View>
            <Text style={styles.headerSub}>{t('partner.dashboard.greeting')}</Text>
            <Text style={styles.headerName}>{partner?.ownerName || 'Partner'} 👋</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Notification bell */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/notifications')}
            >
              <Text style={styles.iconBtnEmoji}>🔔</Text>
              {pendingBookings.length > 0 && (
                <Animated.View style={[styles.notifBadge, { transform: [{ scale: pulseAnim }] }]}>
                  <Text style={styles.notifBadgeText}>{pendingBookings.length}</Text>
                </Animated.View>
              )}
            </TouchableOpacity>
            {/* Settings */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.iconBtnEmoji}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Restaurant name + package badge ──────────────── */}
        <Animated.View style={[styles.restaurantRow, slideUp(headerAnim)]}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            🍽️  {partner?.restaurantName || restaurant?.name || t('history.restaurantFallback')}
          </Text>
          <View style={[styles.pkgBadge, { backgroundColor: pkg.bg }]}>
            <Text style={[styles.pkgBadgeText, { color: pkg.color }]}>{pkg.label}</Text>
          </View>
        </Animated.View>

        {/* ── Stats grid ─────────────────────────────────────── */}
        <Animated.View style={[styles.statsGrid, slideUp(statsAnim)]}>
          <StatCard
            emoji="🪑" label={t("partner.dashboard.stat.available")}
            value={MOCK_STATS.availableTables} total={MOCK_STATS.totalTables}
            color="#22C55E" bg="#F0FDF4"
          />
          <StatCard
            emoji="🔴" label={t("partner.dashboard.stat.booked")}
            value={MOCK_STATS.bookedTables} total={MOCK_STATS.totalTables}
            color="#EF4444" bg="#FEF2F2"
          />
          <StatCard
            emoji="📅" label={t("partner.dashboard.stat.today")}
            value={todayBookings.length}
            color="#3B82F6" bg="#EFF6FF"
          />
          <StatCard
            emoji="⏳" label={t("partner.dashboard.stat.pending")}
            value={pendingBookings.length}
            color="#F59E0B" bg="#FFFBEB"
            alert={pendingBookings.length > 0}
          />
        </Animated.View>

        {/* ── Revenue chart card ─────────────────────────────── */}
        <Animated.View style={slideUp(chartAnim)}>
          <LinearGradient
            colors={['#1A1A1A', '#2D2D2D']}
            style={styles.revenueCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.revenueHeader}>
              <View>
                <Text style={styles.revenueLabel}>{t('partner.dashboard.revenue')}</Text>
                <Text style={styles.revenueAmount}>
                  {MOCK_STATS.revenue.toLocaleString(locale)}đ
                </Text>
                <View style={styles.revenueGrowthRow}>
                  <Text style={styles.revenueGrowthUp}>↑ {MOCK_STATS.revenueGrowth}%</Text>
                  <Text style={styles.revenueGrowthLabel}>{t('partner.dashboard.revenueCompare')}</Text>
                </View>
              </View>
            </View>

            {/* Bar chart */}
            <View style={styles.chartArea}>
              {MOCK_STATS.weeklyData.map((val, i) => {
                const isLast = i === MOCK_STATS.weeklyData.length - 1;
                const barH = (val / 100) * 80;
                return (
                  <View key={i} style={styles.chartBarCol}>
                    <View style={styles.chartBarWrap}>
                      {isLast ? (
                        <LinearGradient
                          colors={['#FF6B35', '#FFD700']}
                          style={[styles.chartBar, { height: barH }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                        />
                      ) : (
                        <View style={[styles.chartBar, styles.chartBarMuted, { height: barH }]} />
                      )}
                    </View>
                    <Text style={styles.chartLabel}>{WEEK_LABELS[i]}</Text>
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── Pending orders ─────────────────────────────────── */}
        {pendingBookings.length > 0 && (
          <Animated.View style={slideUp(ordersAnim)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('partner.dashboard.section.pending')}</Text>
              <TouchableOpacity onPress={() => router.push('/orders')}>
                <Text style={styles.sectionLink}>{t('partner.dashboard.section.viewAll')}</Text>
              </TouchableOpacity>
            </View>

            {pendingBookings.slice(0, 2).map((booking) => (
              <View key={booking.id} style={styles.pendingCard}>
                <View style={styles.pendingCardTop}>
                  <View>
                    <Text style={styles.pendingName}>{booking.userName}</Text>
                    <Text style={styles.pendingPhone}>{booking.userPhone}</Text>
                  </View>
                  <View style={styles.pendingRight}>
                    <Text style={styles.pendingTable}>{booking.tableNumber}</Text>
                    <Text style={styles.pendingTime}>{booking.date} • {booking.time}</Text>
                    <Text style={styles.pendingGuests}>{booking.guests} {t('partner.dashboard.pendingGuests')}</Text>
                  </View>
                </View>

                <View style={styles.pendingDeposit}>
                  <Text style={styles.pendingDepositText}>
                    {t('partner.dashboard.deposit', { amount: booking.depositAmount.toLocaleString(locale) })}
                  </Text>
                </View>

                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(booking.id)}
                  >
                    <Text style={styles.rejectBtnText}>{t('partner.dashboard.reject')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => handleConfirm(booking.id)}
                  >
                    <LinearGradient
                      colors={['#22C55E', '#16A34A']}
                      style={styles.confirmBtnGrad}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.confirmBtnText}>{t('partner.dashboard.confirm')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* ── Quick actions ──────────────────────────────────── */}
        <Animated.View style={slideUp(actionsAnim)}>
          <Text style={styles.sectionTitle}>{t('partner.dashboard.section.quick')}</Text>
          <View style={styles.quickGrid}>
            {[
              { emoji: '🪑', label: t('partner.dashboard.quick.tables'),    path: '/tables' },
              { emoji: '📋', label: t('partner.dashboard.quick.orders'),    path: '/orders' },
              { emoji: '🏪', label: t('partner.dashboard.quick.profile'), path: '/profile' },
              { emoji: '🎫', label: t('partner.dashboard.quick.voucher'),         path: '/vouchers' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.quickCard}
                onPress={() => router.push(item.path as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickEmoji}>{item.emoji}</Text>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Logout for testing */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            router.replace('/welcome');
          }}
        >
          <Text style={styles.logoutText}>{t('partner.dashboard.logout')}</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Bottom nav ─────────────────────────────────────── */}
      <PartnerBottomNav pendingCount={pendingBookings.length} />
    </SafeAreaView>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  emoji, label, value, total, color, bg, alert,
}: {
  emoji: string; label: string; value: number;
  total?: number; color: string; bg: string; alert?: boolean;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!alert) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.92, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [alert]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        { backgroundColor: bg, transform: [{ scale: alert ? pulseAnim : new Animated.Value(1) }] },
      ]}
    >
      <View style={styles.statRow}>
        <Text style={styles.statEmoji}>{emoji}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>
        {value}
        {total !== undefined && (
          <Text style={styles.statTotal}>/{total}</Text>
        )}
      </Text>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerSub: { fontSize: 12, color: '#9CA3AF' },
  headerName: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  iconBtnEmoji: { fontSize: 18 },
  notifBadge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#EF4444',
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },

  // Restaurant row
  restaurantRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 14, fontWeight: '700', color: '#374151', flex: 1, marginRight: 8,
  },
  pkgBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  pkgBadgeText: { fontSize: 11, fontWeight: '800' },

  // Stats grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 16,
  },
  statCard: {
    width: (width - 50) / 2,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statEmoji: { fontSize: 16 },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  statValue: { fontSize: 26, fontWeight: '900' },
  statTotal: { fontSize: 14, color: '#9CA3AF' },

  // Revenue chart
  revenueCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  revenueHeader: { marginBottom: 16 },
  revenueLabel: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  revenueAmount: { fontSize: 28, fontWeight: '900', color: '#fff' },
  revenueGrowthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  revenueGrowthUp: { fontSize: 12, color: '#22C55E', fontWeight: '700' },
  revenueGrowthLabel: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },

  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
  },
  chartBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBarWrap: { justifyContent: 'flex-end', height: 80, width: '100%', alignItems: 'center' },
  chartBar: { width: '65%', borderRadius: 4 },
  chartBarMuted: { backgroundColor: 'rgba(255,255,255,0.2)' },
  chartLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 6 },

  // Section
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginBottom: 10 },
  sectionLink: { fontSize: 12, color: '#FF6B35', fontWeight: '700' },

  // Pending cards
  pendingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    marginBottom: 10,
  },
  pendingCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pendingName: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  pendingPhone: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  pendingRight: { alignItems: 'flex-end' },
  pendingTable: { fontSize: 13, fontWeight: '700', color: '#FF6B35' },
  pendingTime: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  pendingGuests: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  pendingDeposit: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 8, padding: 6, marginBottom: 10,
  },
  pendingDepositText: { fontSize: 12, color: '#92400E', fontWeight: '600' },
  pendingActions: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    flex: 1, height: 40, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#FCA5A5',
    alignItems: 'center', justifyContent: 'center',
  },
  rejectBtnText: { fontSize: 13, color: '#EF4444', fontWeight: '700' },
  confirmBtn: { flex: 1, height: 40, borderRadius: 12, overflow: 'hidden' },
  confirmBtnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontSize: 13, color: '#fff', fontWeight: '800' },

  // Quick actions
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  quickCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 },

  // Logout
  logoutBtn: {
    alignItems: 'center', paddingVertical: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, marginBottom: 8,
  },
  logoutText: { fontSize: 14, color: '#9CA3AF', fontWeight: '600' },
});