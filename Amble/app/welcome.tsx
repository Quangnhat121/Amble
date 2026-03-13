import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // Fade + slide animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const headlineAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const dividerAnim = useRef(new Animated.Value(0)).current;
  const registerAnim = useRef(new Animated.Value(0)).current;

  // Blob float animations
  const blob1Y = useRef(new Animated.Value(0)).current;
  const blob2Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.stagger(80, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(headlineAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }),
      Animated.spring(taglineAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 9 }),
      Animated.spring(card1Anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 10 }),
      Animated.spring(card2Anim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 10 }),
      Animated.spring(dividerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 10 }),
      Animated.spring(registerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 10 }),
    ]).start();

    // Floating blobs
    const floatBlob = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -14, duration, useNativeDriver: true, easing: (t) => Math.sin(t * Math.PI) }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      ).start();

    floatBlob(blob1Y, 3200);
    floatBlob(blob2Y, 4100);
  }, []);

  const makeSlideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Background gradient ─────────────────────── */}
      <LinearGradient
        colors={['#FF8C42', '#FFB347', '#FFD166']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Decorative blobs */}
      <Animated.View
        style={[
          styles.blob1,
          { transform: [{ translateY: blob1Y }] },
        ]}
      />
      <Animated.View
        style={[
          styles.blob2,
          { transform: [{ translateY: blob2Y }] },
        ]}
      />

      {/* ── Top hero section ───────────────────────── */}
      <View style={styles.hero}>
        {/* Logo row */}
        <Animated.View style={[styles.logoRow, makeSlideUp(logoAnim)]}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>A</Text>
          </View>
          <Text style={styles.logoText}>Amble</Text>
        </Animated.View>

        {/* Headline */}
        <Animated.Text style={[styles.headline, makeSlideUp(headlineAnim)]}>
          Không chỉ ăn uống.{'\n'}Trải nghiệm của bạn.
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, makeSlideUp(taglineAnim)]}>
          🇻🇳 Vietnam's #1 dining app
        </Animated.Text>
      </View>

      {/* ── Bottom card sheet ──────────────────────── */}
      <View style={styles.sheet}>
        <Text style={styles.sheetPrompt}>Bạn muốn đăng nhập với tư cách gì?</Text>

        {/* Customer card */}
        <Animated.View style={makeSlideUp(card1Anim)}>
          <TouchableOpacity
            style={styles.cardCustomer}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <View style={styles.cardIconWrap}>
              <LinearGradient
                colors={['#FF8C42', '#FFD166']}
                style={styles.cardIconGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="person" size={20} color="#FF6B35" />
              </LinearGradient>
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Khách Hàng</Text>
              <Text style={styles.cardSubtitle}>Tìm kiếm & đặt bàn nhà hàng</Text>
            </View>

            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Partner card */}
        <Animated.View style={makeSlideUp(card2Anim)}>
          <TouchableOpacity
            style={styles.cardPartner}
            onPress={() => router.push('../(partner-auth)/partner-login')}
            activeOpacity={0.85}
          >
            <View style={styles.cardIconWrap}>
              <View style={styles.cardIconDark}>
                <Ionicons name="restaurant" size={20} color="#FF6B35" />
              </View>
            </View>

            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: '#1A1A1A' }]}>Đối Tác Nhà Hàng</Text>
              <Text style={styles.cardSubtitle}>Quản lý nhà hàng & đặt bàn</Text>
            </View>

            <Text style={[styles.cardArrow, { color: '#999' }]}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <Animated.View style={[styles.dividerRow, makeSlideUp(dividerAnim)]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* Free register button */}
        <Animated.View style={makeSlideUp(registerAnim)}>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerBtnText}>Đăng Ký miễn phí</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FF8C42',
  },

  // Decorative blobs
  blob1: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  blob2: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: height * 0.15,
    left: -width * 0.15,
  },

  // Hero
  hero: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 28,
    paddingBottom: 32,
    justifyContent: 'flex-start',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoMarkText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },

  headline: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 44,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.3,
  },

  // Bottom sheet
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetPrompt: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Cards
  cardCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF8C42',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFF8F4',
  },
  cardPartner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F7F7F7',
  },

  cardIconWrap: {
    marginRight: 14,
  },
  cardIconGrad: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconDark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconEmoji: {
    fontSize: 24,
  },

  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  cardArrow: {
    fontSize: 22,
    color: '#FF8C42',
    fontWeight: '300',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBEB',
  },
  dividerText: {
    fontSize: 12,
    color: '#AAA',
    marginHorizontal: 12,
  },

  // Register button
  registerBtn: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
});