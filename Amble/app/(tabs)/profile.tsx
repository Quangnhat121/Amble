import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { userAPI } from '../../services/api';

const PRIMARY = '#FF6B35';
const SECONDARY = '#FFD700';
const GRAD: [string, string] = ['#FF6B35', '#FFD700'];
const SURFACE = '#FFFFFF';
const BG = '#FAFAFA';
const TEXT = '#1A1A1A';
const TEXT_SEC = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#F3F4F6';


// ───────────────── MENU ITEM ─────────────────
const MenuItem = ({ icon, label, value, onPress, danger }: any) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
      <Ionicons
        name={icon}
        size={20}
        color={danger ? '#EF4444' : PRIMARY}
      />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={[styles.menuLabel, danger && { color: '#EF4444' }]}>
        {label}
      </Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
    </View>

    <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
  </TouchableOpacity>
);


export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore();

  const [editVisible, setEditVisible] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });


  // ───────────────── UPDATE PROFILE ─────────────────
  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      Alert.alert('Lỗi', 'Họ tên không được để trống');
      return;
    }

    setSaving(true);
    try {
      await updateUser(editForm);
      setEditVisible(false);
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật!');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setSaving(false);
    }
  };


  // ───────────────── CHANGE PASSWORD ─────────────────
  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setSaving(true);
    try {
      await userAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });

      setPwVisible(false);
      setPwForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setSaving(false);
    }
  };


  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất không?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* ───────── PROFILE HEADER ───────── */}
      <LinearGradient
        colors={GRAD}
        style={styles.profileHeader}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>

          <TouchableOpacity style={styles.cameraBtn}>
            <Ionicons name="camera-outline" size={16} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user?.fullName}</Text>

        {user?.email && (
          <Text style={styles.subText}>{user.email}</Text>
        )}

        {user?.phone && (
          <Text style={styles.subText}>{user.phone}</Text>
        )}

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditVisible(true)}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </LinearGradient>


      {/* ───────── ACCOUNT SECTION ───────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>

        <View style={styles.menuBox}>
          <MenuItem
            icon="person-outline"
            label="Thông tin cá nhân"
            value={user?.phone || 'Chưa cập nhật'}
            onPress={() => setEditVisible(true)}
          />

          <MenuItem
            icon="lock-closed-outline"
            label="Đổi mật khẩu"
            onPress={() => setPwVisible(true)}
          />

          <MenuItem
            icon="notifications-outline"
            label="Thông báo"
            value="Đã bật"
            onPress={() => {}}
          />
        </View>
      </View>


      {/* ───────── SUPPORT SECTION ───────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HỖ TRỢ</Text>

        <View style={styles.menuBox}>
          <MenuItem
            icon="help-circle-outline"
            label="Trung tâm trợ giúp"
          />

          <MenuItem
            icon="document-text-outline"
            label="Điều khoản sử dụng"
          />

          <MenuItem
            icon="shield-checkmark-outline"
            label="Chính sách bảo mật"
          />

          <MenuItem
            icon="star-outline"
            label="Đánh giá ứng dụng"
          />
        </View>
      </View>


      {/* ───────── LOGOUT ───────── */}
      <View style={styles.section}>
        <View style={styles.menuBox}>
          <MenuItem
            icon="log-out-outline"
            label="Đăng xuất"
            onPress={handleLogout}
            danger
          />
        </View>
      </View>


      {/* ───────── EDIT PROFILE MODAL ───────── */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>

            <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>

            <TextInput
              style={styles.input}
              placeholder="Họ tên"
              value={editForm.fullName}
              onChangeText={(v) =>
                setEditForm({ ...editForm, fullName: v })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={editForm.phone}
              onChangeText={(v) =>
                setEditForm({ ...editForm, phone: v })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Địa chỉ"
              value={editForm.location}
              onChangeText={(v) =>
                setEditForm({ ...editForm, location: v })
              }
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditVisible(false)}
              >
                <Text>Huỷ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff' }}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}



const styles = StyleSheet.create({

container: {
  flex: 1,
  backgroundColor: BG,
},

profileHeader: {
  alignItems: 'center',
  paddingTop: 60,
  paddingBottom: 30,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
},

avatarWrap: {
  position: 'relative',
},

avatar: {
  width: 90,
  height: 90,
  borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.3)',
  alignItems: 'center',
  justifyContent: 'center',
},

avatarText: {
  fontSize: 36,
  color: '#fff',
  fontWeight: 'bold',
},

cameraBtn: {
  position: 'absolute',
  bottom: -5,
  right: -5,
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
},

name: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#fff',
  marginTop: 10,
},

subText: {
  fontSize: 13,
  color: 'rgba(255,255,255,0.8)',
},

editBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginTop: 10,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.2)',
},

editBtnText: {
  color: '#fff',
  fontWeight: '600',
},

section: {
  marginTop: 20,
  paddingHorizontal: 20,
},

sectionTitle: {
  fontSize: 12,
  fontWeight: 'bold',
  color: TEXT_MUTED,
  marginBottom: 10,
},

menuBox: {
  backgroundColor: '#fff',
  borderRadius: 14,
  overflow: 'hidden',
},

menuItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 15,
  borderBottomWidth: 1,
  borderBottomColor: BORDER,
},

iconBox: {
  width: 36,
  height: 36,
  borderRadius: 10,
  backgroundColor: '#FFF3ED',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},

iconBoxDanger: {
  backgroundColor: '#FFE4E6',
},

menuLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: TEXT,
},

menuValue: {
  fontSize: 12,
  color: TEXT_SEC,
},

modalOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0,0,0,0.4)',
},

modalSheet: {
  backgroundColor: '#fff',
  padding: 24,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 20,
},

input: {
  borderWidth: 1,
  borderColor: BORDER,
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
},

modalActions: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 10,
},

cancelBtn: {
  flex: 1,
  padding: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: BORDER,
  alignItems: 'center',
},

saveBtn: {
  flex: 1,
  padding: 12,
  borderRadius: 12,
  backgroundColor: PRIMARY,
  alignItems: 'center',
},

});