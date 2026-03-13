import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';

const TABS = [
  { name: 'dashboard', label: 'Dashboard', emoji: '🏠', path: '/(partner)/dashboard' },
  { name: 'tables',    label: 'Bàn',       emoji: '🪑', path: '/(partner)/tables' },
  { name: 'orders',    label: 'Đơn',       emoji: '📋', path: '/(partner)/orders' },
  { name: 'notifications', label: 'Thông báo', emoji: '🔔', path: '/(partner)/notifications' },
  { name: 'profile',   label: 'Hồ sơ',    emoji: '🏪', path: '/(partner)/profile' },
];

interface PartnerBottomNavProps {
  pendingCount?: number;
}

export function PartnerBottomNav({ pendingCount = 0 }: PartnerBottomNavProps) {
  const router = useRouter();
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = currentScreen === tab.name;
        const showBadge = tab.name === 'orders' && pendingCount > 0;

        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => router.push(tab.path as any)}
            activeOpacity={0.75}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: '#1A1A1A',
  },
  iconWrap: {
    position: 'relative',
    marginBottom: 2,
  },
  tabEmoji: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});