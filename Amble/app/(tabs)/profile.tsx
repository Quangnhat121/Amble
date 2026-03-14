import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { userAPI, bookingAPI } from '../../services/api';

const PRIMARY  = '#FF6B35';
const GRAD: [string, string] = ['#FF6B35', '#FFD700'];
const BG       = '#FAFAFA';
const TEXT     = '#1A1A1A';
const TEXT_SEC = '#6B7280';
const MUTED    = '#9CA3AF';
const BORDER   = '#F3F4F6';

// ─── Stat Card (inside header gradient) ──────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={st.card}>
      <Text style={st.value}>{value}</Text>
      <Text style={st.label}>{label}</Text>
    </View>
  );
}
const st = StyleSheet.create({
  card:  { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)' },
  value: { fontSize: 22, fontWeight: '900', color: '#fff' },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
});

// ─── Menu Item (standalone card, like src) ───────────────────────────────────
function MenuItem({
  icon, label, sublabel, onPress, danger, badge,
}: {
  icon: string; label: string; sublabel?: string;
  onPress?: () => void; danger?: boolean; badge?: string;
}) {
  return (
    <TouchableOpacity
      style={[mi.wrap, danger && mi.wrapDanger]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[mi.iconBox, danger && mi.iconBoxDanger]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[mi.label, danger && { color: '#EF4444' }]}>{label}</Text>
        {sublabel ? <Text style={mi.sub}>{sublabel}</Text> : null}
      </View>
      {badge ? (
        <View style={mi.badgeWrap}>
          <Text style={mi.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={MUTED} />
    </TouchableOpacity>
  );
}
const mi = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  wrapDanger: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  iconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#FFF3ED',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  iconBoxDanger: { backgroundColor: '#FFE4E6' },
  label:     { fontSize: 15, fontWeight: '600', color: TEXT },
  sub:       { fontSize: 12, color: MUTED, marginTop: 2 },
  badgeWrap: { backgroundColor: PRIMARY, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginRight: 6 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
});

// ─── Input Field ──────────────────────────────────────────────────────────────
function Field({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={fo.label}>{label}</Text>
      <TextInput style={fo.input} placeholderTextColor={MUTED} {...props} />
    </View>
  );
}
const fo = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', color: TEXT_SEC, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: BORDER, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: TEXT, backgroundColor: '#F9FAFB',
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();

  const [editVisible,   setEditVisible]   = useState(false);
  const [pwVisible,     setPwVisible]     = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [bookingCount,  setBookingCount]  = useState(0);

  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    phone:    user?.phone    || '',
    location: user?.location || '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user?._id) return;
    bookingAPI.getUserBookings(user._id)
      .then((res: any) => {
        const done = (res.data?.bookings || []).filter(
          (b: any) => ['confirmed', 'paid', 'completed'].includes(b.status)
        ).length;
        setBookingCount(done);
      })
      .catch(() => {});
  }, [user?._id]);

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) { Alert.alert('Lỗi', 'Họ tên không được để trống'); return; }
    setSaving(true);
    try {
      await updateUser(editForm);
      setEditVisible(false);
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật!');
    } catch (e: any) { Alert.alert('Lỗi', e.message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) { Alert.alert('Lỗi', 'Vui lòng điền đầy đủ'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword)  { Alert.alert('Lỗi', 'Mật khẩu không khớp'); return; }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwVisible(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
    } catch (e: any) { Alert.alert('Lỗi', e.message); }
    finally { setSaving(false); }
  };

  const initials = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* ── HEADER ───────────────────────────────── */}
      <LinearGradient
        colors={GRAD}
        style={s.header}
        start={{ x: 0.1, y: 0 }} end={{ x: 1, y: 1 }}
      >
        {/* Avatar row: avatar left + info right — same as src */}
        <View style={s.avatarRow}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity style={s.cameraBtn}>
              <Ionicons name="camera-outline" size={14} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={s.name} numberOfLines={1}>{user?.fullName || 'Người dùng'}</Text>
              <TouchableOpacity onPress={() => setEditVisible(true)}>
                <Ionicons name="create-outline" size={16} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>
            </View>
            {user?.phone ? <Text style={s.sub}>{user.phone}</Text>  : null}
            {user?.email ? <Text style={s.sub2}>{user.email}</Text> : null}
          </View>
        </View>

        {/* Stats — 3 columns inside header */}
        <View style={s.statsRow}>
          <StatCard label="Đặt bàn"   value={bookingCount} />
          <View style={{ width: 8 }} />
          <StatCard label="Đánh giá"  value={0} />
          <View style={{ width: 8 }} />
          <StatCard label="Yêu thích" value={0} />
        </View>
      </LinearGradient>

      {/* ── MENU LIST ────────────────────────────── */}
      <View style={s.body}>

        {/* Đặt bàn */}
        <Text style={s.sectionTitle}>ĐẶT BÀN</Text>
        <MenuItem
          icon="📋"
          label="Lịch sử đặt bàn"
          onPress={() => router.push('/booking/history' as any)}
        />

        {/* Tài khoản */}
        <Text style={s.sectionTitle}>TÀI KHOẢN</Text>
        <View style={s.group}>
          <MenuItem
            icon="👤"
            label="Thông tin cá nhân"
            sublabel={user?.phone || 'Chưa cập nhật'}
            onPress={() => setEditVisible(true)}
          />
          <MenuItem
            icon="🔒"
            label="Đổi mật khẩu"
            onPress={() => setPwVisible(true)}
          />
          <MenuItem icon="🔔" label="Thông báo" sublabel="Đã bật" />
        </View>

        {/* Hỗ trợ */}
        <Text style={s.sectionTitle}>HỖ TRỢ</Text>
        <View style={s.group}>
          <MenuItem icon="❓" label="Trung tâm trợ giúp" />
          <MenuItem icon="📄" label="Điều khoản sử dụng" />
          <MenuItem icon="🛡️" label="Chính sách bảo mật" />
          <MenuItem icon="⭐" label="Đánh giá ứng dụng"  />
        </View>

        {/* Đăng xuất */}
        <View style={{ marginTop: 8, marginBottom: 40 }}>
          <MenuItem
            icon="🚪"
            label="Đăng xuất"
            onPress={() => setLogoutVisible(true)}
            danger
          />
        </View>

      </View>

      {/* ══ EDIT PROFILE MODAL ══════════════════════ */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={mo.overlay}
        >
          <View style={mo.sheet}>
            <View style={mo.handle} />
            <Text style={mo.title}>Chỉnh sửa hồ sơ</Text>
            <Field label="Họ tên" placeholder="Nhập họ tên"
              value={editForm.fullName}
              onChangeText={(v: string) => setEditForm({ ...editForm, fullName: v })}
            />
            <Field label="Số điện thoại" placeholder="Nhập số điện thoại"
              value={editForm.phone}
              onChangeText={(v: string) => setEditForm({ ...editForm, phone: v })}
              keyboardType="phone-pad"
            />
            <Field label="Địa chỉ" placeholder="Nhập địa chỉ"
              value={editForm.location}
              onChangeText={(v: string) => setEditForm({ ...editForm, location: v })}
            />
            <View style={mo.row}>
              <TouchableOpacity style={mo.cancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={mo.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={mo.saveBtn} onPress={handleSaveProfile} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={mo.saveText}>Lưu</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ CHANGE PASSWORD MODAL ═══════════════════ */}
      <Modal visible={pwVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={mo.overlay}
        >
          <View style={mo.sheet}>
            <View style={mo.handle} />
            <Text style={mo.title}>Đổi mật khẩu</Text>
            <Field label="Mật khẩu hiện tại" placeholder="Nhập mật khẩu hiện tại"
              value={pwForm.currentPassword}
              onChangeText={(v: string) => setPwForm({ ...pwForm, currentPassword: v })}
              secureTextEntry
            />
            <Field label="Mật khẩu mới" placeholder="Nhập mật khẩu mới"
              value={pwForm.newPassword}
              onChangeText={(v: string) => setPwForm({ ...pwForm, newPassword: v })}
              secureTextEntry
            />
            <Field label="Xác nhận mật khẩu mới" placeholder="Nhập lại mật khẩu mới"
              value={pwForm.confirmPassword}
              onChangeText={(v: string) => setPwForm({ ...pwForm, confirmPassword: v })}
              secureTextEntry
            />
            <View style={mo.row}>
              <TouchableOpacity style={mo.cancelBtn} onPress={() => setPwVisible(false)}>
                <Text style={mo.cancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={mo.saveBtn} onPress={handleChangePassword} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={mo.saveText}>Lưu</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ══ LOGOUT CONFIRM MODAL — same as src ═══════ */}
      <Modal visible={logoutVisible} animationType="fade" transparent>
        <View style={lo.overlay}>
          <View style={lo.card}>
            <Text style={{ fontSize: 52, textAlign: 'center' }}>👋</Text>
            <Text style={lo.title}>Đăng xuất?</Text>
            <Text style={lo.sub}>Bạn có chắc muốn đăng xuất không?</Text>
            <View style={lo.row}>
              <TouchableOpacity style={lo.stayBtn} onPress={() => setLogoutVisible(false)}>
                <Text style={lo.stayText}>Ở lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={lo.leaveBtn}
                onPress={() => { setLogoutVisible(false); logout(); }}
              >
                <Text style={lo.leaveText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  avatarRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  cameraBtn:  {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  name:  { fontSize: 20, fontWeight: '900', color: '#fff' },
  sub:   { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  sub2:  { fontSize: 12, color: 'rgba(255,255,255,0.7)',  marginTop: 2 },
  statsRow: { flexDirection: 'row' },
  body:         { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: MUTED, letterSpacing: 0.8, marginTop: 24, marginBottom: 10 },
  group: { gap: 8 },
});

const mo = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40,
  },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
  title:      { fontSize: 18, fontWeight: '900', color: TEXT, marginBottom: 20 },
  row:        { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn:  { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: TEXT_SEC },
  saveBtn:    { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: PRIMARY, alignItems: 'center' },
  saveText:   { fontSize: 14, fontWeight: '700', color: '#fff' },
});

const lo = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  card:      { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: '100%' },
  title:     { fontSize: 20, fontWeight: '900', color: TEXT, textAlign: 'center', marginTop: 12 },
  sub:       { fontSize: 14, color: TEXT_SEC, textAlign: 'center', marginTop: 6, marginBottom: 28 },
  row:       { flexDirection: 'row', gap: 12 },
  stayBtn:   { flex: 1, paddingVertical: 15, borderRadius: 16, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center' },
  stayText:  { fontSize: 14, fontWeight: '700', color: '#374151' },
  leaveBtn:  { flex: 1, paddingVertical: 15, borderRadius: 16, backgroundColor: '#EF4444', alignItems: 'center' },
  leaveText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});