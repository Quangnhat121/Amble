import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, Image, ScrollView, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuthStore } from '../../store/authStore';
import { restaurantAPI } from '../../services/api';
import { useI18n } from '../../hooks/use-i18n';

// ─── Design tokens ────────────────────────────────────────
const PRIMARY = '#FF6B35';
const GRAD: [string, string] = ['#FF6B35', '#FFD700'];
const BG = '#FAFAFA';
const SURFACE = '#FFFFFF';
const TEXT = '#1A1A1A';
const TEXT_SEC = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#F3F4F6';

const PRICE_COLOR: Record<string, string> = {
  '$': '#22C55E',
  '$$': '#FF6B35',
  '$$$': '#9333EA',
};

// ─── Filter options ───────────────────────────────────────
const PRICE_OPTIONS = ['$', '$$', '$$$'];

interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  location: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  images: string[];
  tags: string[];
  categories: string[];
  openTime: string;
  closeTime: string;
  hasParking: boolean;
  isFeatured: boolean;
}

const FALLBACK =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80';


// ═══════════════════════════════════════════════
//  CARD
// ═══════════════════════════════════════════════
const RestaurantCard = ({
  item, favorites, onToggleFav,
}: {
  item: Restaurant;
  favorites: string[];
  onToggleFav: (id: string) => void;
}) => {
  const isFav = favorites.includes(item._id);
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/restaurant/${item._id}`)}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.images?.[0] || FALLBACK }} style={styles.image} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFillObject} />

        <TouchableOpacity style={styles.favBtn} onPress={() => onToggleFav(item._id)}>
          <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={isFav ? '#EF4444' : '#374151'} />
        </TouchableOpacity>

        <View style={styles.overlay}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.subRow}>
            <Text style={styles.cuisine}>{item.cuisine}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.price, { color: PRICE_COLOR[item.priceRange] || PRIMARY }]}>
              {item.priceRange}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.review}>({item.reviewCount})</Text>
          </View>
          <View style={styles.cityRow}>
            <Ionicons name="location-outline" size={12} color={TEXT_MUTED} />
            <Text style={styles.city}>{item.city}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-sharp" size={12} color={TEXT_SEC} />
          <Text style={styles.location} numberOfLines={1}>{item.location}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={TEXT_MUTED} />
          <Text style={styles.time}>{item.openTime} - {item.closeTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};


// ═══════════════════════════════════════════════
//  EXPLORE SCREEN
// ═══════════════════════════════════════════════
export default function ExploreScreen() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useI18n();
  const sortOptions = [
    { key: 'rating', label: t('sort.rating') },
    { key: 'reviews', label: t('sort.reviews') },
    { key: 'name', label: t('sort.name') },
  ];

  const quickTags = [
    t('tag.vietnamese'),
    t('tag.european'),
    t('tag.rooftop'),
    t('tag.japanese'),
    t('tag.hotpot'),
  ];

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Search & filter state
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch ────────────────────────────────────
  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await restaurantAPI.getAll();
      setRestaurants(res.data.restaurants || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchRestaurants();
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants();
  };

  // ── Toggle favourite ─────────────────────────
  const toggleFav = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ── Derived: filter + sort ───────────────────
  const filtered = (() => {
    let list = [...restaurants];

    // 1. Search theo tên
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q),
      );
    }

    // 2. Filter theo tag (cuisine hoặc tags[])
    if (activeTag) {
      list = list.filter(
        (r) =>
          r.cuisine?.toLowerCase().includes(activeTag.toLowerCase()) ||
          r.tags?.some((t) => t.toLowerCase().includes(activeTag.toLowerCase())),
      );
    }

    // 3. Filter theo price range
    if (activePrice) {
      list = list.filter((r) => r.priceRange === activePrice);
    }

    // 4. Sort
    if (activeSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (activeSort === 'reviews') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (activeSort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  })();

  const hasActiveFilter = !!activeTag || !!activePrice || !!activeSort;

  const clearFilters = () => {
    setActiveTag(null);
    setActivePrice(null);
    setActiveSort(null);
  };

  // ── Render ───────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── HEADER ─────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('explore.title')}</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('explore.searchPlaceholder')}
            placeholderTextColor={TEXT_MUTED}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close" size={18} color={TEXT_MUTED} />
            </TouchableOpacity>
          )}
          {/* Nút filter */}
          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={hasActiveFilter ? GRAD : ['#E5E7EB', '#E5E7EB']}
              style={styles.filterBtn}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={hasActiveFilter ? '#fff' : TEXT_SEC}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
        >
          {quickTags.map((tag) => {
            const active = activeTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, active && styles.tagChipActive]}
                onPress={() => setActiveTag(active ? null : tag)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Filter panel (mở khi bấm nút options) */}
        {showFilters && (
          <View style={styles.filterPanel}>
            {/* Price */}
            <Text style={styles.filterLabel}>{t('home.filterPrice')}</Text>
            <View style={styles.filterRow}>
              {PRICE_OPTIONS.map((p) => {
                const active = activePrice === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setActivePrice(active ? null : p)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sort */}
            <Text style={styles.filterLabel}>{t('home.filterSort')}</Text>
            <View style={styles.filterRow}>
              {sortOptions.map((s) => {
                const active = activeSort === s.key;
                return (
                  <TouchableOpacity
                    key={s.key}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setActiveSort(active ? null : s.key)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Clear */}
            {hasActiveFilter && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                <Text style={styles.clearBtnText}>{t('home.clearFilters')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── Result count ────────────────────────── */}
      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          {t('explore.resultsCount', { count: filtered.length })}
        </Text>
        {hasActiveFilter && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearInline}>{t('explore.clearInline')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── LIST ────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>{t('home.noResultsTitle')}</Text>
              <Text style={styles.emptyText}>{t('home.noResultsSubtitle')}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <RestaurantCard item={item} favorites={favorites} onToggleFav={toggleFav} />
        )}
      />
    </View>
  );
}


// ═══════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  title: { fontSize: 22, fontWeight: '800', color: TEXT, marginBottom: 12 },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: TEXT },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick tags
  tagsRow: { gap: 8, paddingRight: 4 },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: SURFACE,
  },
  tagChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  tagText: { fontSize: 12, fontWeight: '600', color: TEXT_SEC },
  tagTextActive: { color: '#fff' },

  // Filter panel
  filterPanel: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: SURFACE,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterChipText: { fontSize: 13, color: TEXT_SEC, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  clearBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  clearBtnText: { fontSize: 13, color: '#EF4444', fontWeight: '700' },

  // Result row
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultText: { fontSize: 13, color: TEXT_MUTED },
  clearInline: { fontSize: 13, color: PRIMARY, fontWeight: '700' },

  // List
  list: { padding: 16 },

  // Card
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrap: { height: 190 },
  image: { width: '100%', height: '100%' },
  favBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: { position: 'absolute', bottom: 12, left: 12 },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cuisine: { color: '#fff', fontSize: 12 },
  dot: { color: '#fff' },
  price: { fontSize: 12, fontWeight: '700' },
  info: { padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontWeight: '700', fontSize: 13 },
  review: { fontSize: 12, color: TEXT_MUTED },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  city: { fontSize: 12, color: TEXT_MUTED },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  location: { fontSize: 12, color: TEXT_SEC },
  time: { fontSize: 12, color: TEXT_MUTED },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginTop: 14 },
  emptyText: { fontSize: 13, color: TEXT_MUTED, marginTop: 6 },
});