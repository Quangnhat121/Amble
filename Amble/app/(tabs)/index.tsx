import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl, FlatList,
  TextInput, SafeAreaView, StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { restaurantAPI } from "../../services/api";
import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

// ─── Design tokens ────────────────────────────────────────
const PRIMARY = "#FF6B35";
const GRAD: [string, string] = ["#FF6B35", "#FFD700"];
const BG = "#FAFAFA";
const SURFACE = "#FFFFFF";
const TEXT = "#1A1A1A";
const TEXT_SEC = "#6B7280";
const TEXT_MUTED = "#9CA3AF";

const PRICE_COLOR: Record<string, string> = {
  $: "#22C55E",
  $$: "#FF6B35",
  $$$: "#9333EA",
};

// ─── Types ────────────────────────────────────────────────
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
  subscriptionPackage: "basic" | "pro" | "premium";
}

interface Category {
  icon: IconName;
  label: string;
  key: string;
}

// ─── Constants ────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { icon: "home", label: "Gần đây", key: "local" },
  { icon: "heart", label: "Hẹn hò", key: "date" },
  { icon: "people", label: "Gia đình", key: "family" },
  { icon: "briefcase", label: "Công việc", key: "business" },
  { icon: "people-circle", label: "Nhóm bạn", key: "group" },
  { icon: "gift", label: "Sinh nhật", key: "celebration" },
];

const QUICK_TAGS = ["Món Việt", "Đồ Âu", "Rooftop", "Nhật Bản", "Lẩu nướng"];

const PRICE_OPTIONS = ["$", "$$", "$$$"];

const SORT_OPTIONS = [
  { key: "rating", label: "Đánh giá cao nhất" },
  { key: "reviews", label: "Nhiều đánh giá nhất" },
  { key: "name", label: "Tên A-Z" },
];

const FALLBACK =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80";


// ═══════════════════════════════════════════════════════════
//  RestaurantCardFull
// ═══════════════════════════════════════════════════════════
const RestaurantCardFull = React.memo(
  ({
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
        style={cardFull.card}
        activeOpacity={0.88}
        onPress={() => router.push(`/restaurant/${item._id}`)}
      >
        <View style={cardFull.imageWrap}>
          <Image
            source={{ uri: item.images?.[0] || FALLBACK }}
            style={cardFull.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.62)"]}
            style={StyleSheet.absoluteFillObject}
          />

          {item.isFeatured && (
            <LinearGradient
              colors={GRAD}
              style={cardFull.badgeFeatured}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={cardFull.badgeText}>Yêu thích</Text>
            </LinearGradient>
          )}
          {!item.isFeatured && item.subscriptionPackage === "premium" && (
            <LinearGradient
              colors={["#9333EA", "#6366F1"]}
              style={cardFull.badgeFeatured}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={cardFull.badgeText}>Xu hướng</Text>
            </LinearGradient>
          )}

          <TouchableOpacity
            style={cardFull.favBtn}
            onPress={() => onToggleFav(item._id)}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color={isFav ? "red" : "gray"}
            />
          </TouchableOpacity>

          <View style={cardFull.overlayBottom}>
            <Text style={cardFull.name} numberOfLines={1}>{item.name}</Text>
            <View style={cardFull.subRow}>
              <Text style={cardFull.cuisine}>{item.cuisine}</Text>
              <Text style={cardFull.dot}>•</Text>
              <Text style={[cardFull.price, { color: PRICE_COLOR[item.priceRange] ?? PRIMARY }]}>
                {item.priceRange}
              </Text>
            </View>
          </View>
        </View>

        <View style={cardFull.info}>
          <View style={cardFull.infoRow}>
            <View style={cardFull.ratingRow}>
              <Text style={{ fontSize: 13 }}>⭐</Text>
              <Text style={cardFull.ratingNum}>{item.rating.toFixed(1)}</Text>
              <Text style={cardFull.ratingCount}>({item.reviewCount} đánh giá)</Text>
            </View>
            <View style={cardFull.cityRow}>
              <Text style={cardFull.cityText}>{item.city}</Text>
            </View>
          </View>

          <View style={cardFull.metaRow}>
            <Text style={cardFull.metaLocation} numberOfLines={1}>
              {item.location || item.city}
            </Text>
            {item.hasParking && (
              <Text style={cardFull.parking}>Có bãi đậu xe</Text>
            )}
            <Text style={cardFull.hours}>{item.openTime}–{item.closeTime}</Text>
          </View>

          {item.tags?.length > 0 && (
            <View style={cardFull.tagsRow}>
              {item.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={cardFull.tag}>
                  <Text style={cardFull.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);
//  RestaurantCardCompact
const RestaurantCardCompact = React.memo(
  ({
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
        style={cardCompact.card}
        activeOpacity={0.88}
        onPress={() => router.push(`/restaurant/${item._id}`)}
      >
        <View style={cardCompact.imageWrap}>
          <Image
            source={{ uri: item.images?.[0] || FALLBACK }}
            style={cardCompact.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)"]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={cardCompact.cuisineBadge}>
            <Text style={cardCompact.cuisineText} numberOfLines={1}>
              {item.cuisine}
            </Text>
          </View>
          <TouchableOpacity
            style={cardCompact.favBtn}
            onPress={() => onToggleFav(item._id)}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={16}
              color={isFav ? "red" : "gray"}
            />
          </TouchableOpacity>
        </View>

        <View style={cardCompact.info}>
          <Text style={cardCompact.name} numberOfLines={1}>{item.name}</Text>
          <View style={cardCompact.ratingRow}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={cardCompact.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={cardCompact.reviews}>({item.reviewCount})</Text>
          </View>
          <Text style={cardCompact.city} numberOfLines={1}>{item.city}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);


// ═══════════════════════════════════════════════════════════
//  Section wrapper
// ═══════════════════════════════════════════════════════════
const Section = ({
  title, onViewAll, children,
}: {
  title: string;
  onViewAll?: () => void;
  children: React.ReactNode;
}) => (
  <View style={sec.wrap}>
    <View style={sec.header}>
      <Text style={sec.title}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={sec.link}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);


// ═══════════════════════════════════════════════════════════
//  Skeleton
// ═══════════════════════════════════════════════════════════
const SkeletonCard = () => (
  <View style={skeleton.card}>
    <View style={skeleton.image} />
    <View style={skeleton.body}>
      <View style={skeleton.line1} />
      <View style={skeleton.line2} />
      <View style={skeleton.line3} />
    </View>
  </View>
);


// ═══════════════════════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════════════════════
export default function HomeScreen() {
  const { user } = useAuthStore();

  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [featured, setFeatured] = useState<Restaurant[]>([]);
  const [forDate, setForDate] = useState<Restaurant[]>([]);
  const [budgetList, setBudgetList] = useState<Restaurant[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & filter
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [featRes, allRes, dateRes, budgetRes] = await Promise.all([
        restaurantAPI.getFeatured(),
        restaurantAPI.getAll(),
        restaurantAPI.getAll({ category: "date" }),
        restaurantAPI.getAll({ priceRange: "$" } as any),
      ]);
      setFeatured(featRes.data.restaurants ?? []);
      setAllRestaurants(allRes.data.restaurants ?? []);
      setForDate(dateRes.data.restaurants ?? []);
      setBudgetList(budgetRes.data.restaurants ?? []);
    } catch (err) {
      console.warn("[HomeScreen] fetchData error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    setSearch("");
    setActiveCategory(null);
    setActiveTag(null);
    setActivePrice(null);
    setActiveSort(null);
    fetchData();
  };

  // ── Toggle favourite ───────────────────────────────────────
  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // ── Derived: filter + sort allRestaurants ──────────────────
  const allList = (() => {
    let list = [...allRestaurants];

    // 1. Search: tên / cuisine / city
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine?.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q),
      );
    }

    // 2. Category
    if (activeCategory) {
      list = list.filter(
        (r) =>
          r.categories?.includes(activeCategory) ||
          r.tags?.includes(activeCategory),
      );
    }

    // 3. Quick tag
    if (activeTag) {
      list = list.filter(
        (r) =>
          r.cuisine?.toLowerCase().includes(activeTag.toLowerCase()) ||
          r.tags?.some((t) => t.toLowerCase().includes(activeTag.toLowerCase())),
      );
    }

    // 4. Price
    if (activePrice) {
      list = list.filter((r) => r.priceRange === activePrice);
    }

    // 5. Sort
    if (activeSort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (activeSort === "reviews") {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (activeSort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  })();

  const hasActiveFilter =
    !!search.trim() || !!activeCategory || !!activeTag || !!activePrice || !!activeSort;

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveTag(null);
    setActivePrice(null);
    setActiveSort(null);
  };

  const favRestaurants = allRestaurants.filter((r) => favorites.includes(r._id));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "buổi sáng";
    if (h < 18) return "buổi chiều";
    return "buổi tối";
  };

  const activeCat = CATEGORIES.find((c) => c.key === activeCategory);
  const allSectionTitle = activeCat ? `${activeCat.label}` : "Tất cả nhà hàng";

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.logoRow}>
                <LinearGradient colors={GRAD} style={styles.logoDot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.logoA}>A</Text>
                </LinearGradient>
                <Text style={styles.logoText}>Amble</Text>
              </View>
            </View>
            <View style={[skel.line, { width: 180, height: 28, marginBottom: 8 }]} />
            <View style={[skel.line, { width: 120, height: 16, marginBottom: 18 }]} />
            <View style={[skel.line, { height: 50, borderRadius: 16, marginBottom: 12 }]} />
          </View>
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            {[1, 2, 3].map((k) => <SkeletonCard key={k} />)}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main render ────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
      >
        {/* ════ HEADER ════ */}
        <View style={styles.header}>

          {/* Logo + icon buttons */}
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <LinearGradient colors={GRAD} style={styles.logoDot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.logoA}>A</Text>
              </LinearGradient>
              <Text style={styles.logoText}>Amble</Text>
            </View>

            <View style={styles.headerBtns}>
              <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
                <Text style={{ fontSize: 18 }}>❤️</Text>
                {favorites.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeNum}>{favorites.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.8}>
                <Text style={{ fontSize: 18 }}>🔔</Text>
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <View style={styles.greetingWrap}>
            <Text style={styles.greetingName}>
              {user ? `Chào ${greeting()}, ${user.fullName?.split(" ").pop()}!` : "Chào bạn!"}
            </Text>
            <Text style={styles.greetingSub}>Hôm nay muốn ăn gì?</Text>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm nhà hàng, món ăn, địa điểm..."
              placeholderTextColor={TEXT_MUTED}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close" size={18} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
            {/* Filter button */}
            <TouchableOpacity onPress={() => setShowFilters((v) => !v)} activeOpacity={0.8}>
              <LinearGradient
                colors={hasActiveFilter ? GRAD : ["#E5E7EB", "#E5E7EB"]}
                style={styles.micBtn}
              >
                <Ionicons
                  name="options-outline"
                  size={16}
                  color={hasActiveFilter ? "#fff" : TEXT_SEC}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Tags — bấm được, highlight khi active */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickTagsRow}
          >
            {QUICK_TAGS.map((tag) => {
              const active = activeTag === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.quickTag, active && styles.quickTagActive]}
                  onPress={() => setActiveTag(active ? null : tag)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.quickTagText, active && styles.quickTagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Filter panel */}
          {showFilters && (
            <View style={styles.filterPanel}>
              <Text style={styles.filterLabel}>Mức giá</Text>
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

              <Text style={styles.filterLabel}>Sắp xếp</Text>
              <View style={styles.filterRow}>
                {SORT_OPTIONS.map((s) => {
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

              {hasActiveFilter && (
                <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
                  <Text style={styles.clearBtnText}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ════ CATEGORIES ════ */}
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={styles.catItem}
                onPress={() => setActiveCategory(isActive ? null : cat.key)}
                activeOpacity={0.75}
              >
                {isActive ? (
                  <LinearGradient
                    colors={GRAD}
                    style={styles.catIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={cat.icon} size={22} color="#fff" />
                  </LinearGradient>
                ) : (
                  <View style={[styles.catIcon, styles.catIconInactive]}>
                    <Ionicons name={cat.icon} size={22} color="#555" />
                  </View>
                )}
                <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Khi đang search/filter: ẩn section featured/date/budget, chỉ show kết quả */}
        {hasActiveFilter ? (
          <Section title={`Kết quả tìm kiếm (${allList.length})`}>
            {allList.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 48 }}>🍽️</Text>
                <Text style={styles.emptyTitle}>Không tìm thấy nhà hàng</Text>
                <Text style={styles.emptyText}>Thử từ khóa hoặc bộ lọc khác</Text>
                <TouchableOpacity style={styles.clearBtn2} onPress={clearFilters}>
                  <Text style={styles.clearBtnText}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.px20}>
                {allList.map((r) => (
                  <RestaurantCardFull
                    key={r._id}
                    item={r}
                    favorites={favorites}
                    onToggleFav={toggleFav}
                  />
                ))}
              </View>
            )}
          </Section>
        ) : (
          <>
            {/* ════ FEATURED ════ */}
            {featured.length > 0 && (
              <Section title="Đề xuất cho bạn" onViewAll={() => {}}>
                <View style={styles.px20}>
                  {featured.slice(0, 3).map((r) => (
                    <RestaurantCardFull
                      key={r._id}
                      item={r}
                      favorites={favorites}
                      onToggleFav={toggleFav}
                    />
                  ))}
                </View>
              </Section>
            )}

            {/* ════ HẸN HÒ ════ */}
            {forDate.length > 0 && (
              <Section title="Địa điểm hẹn hò" onViewAll={() => {}}>
                <FlatList
                  data={forDate}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item }) => (
                    <RestaurantCardCompact item={item} favorites={favorites} onToggleFav={toggleFav} />
                  )}
                />
              </Section>
            )}

            {/* ════ TẤT CẢ ════ */}
            <Section title={allSectionTitle}>
              {allList.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={{ fontSize: 48 }}>🍽️</Text>
                  <Text style={styles.emptyTitle}>Không tìm thấy nhà hàng</Text>
                  <Text style={styles.emptyText}>Kéo xuống để tải lại</Text>
                </View>
              ) : (
                <View style={styles.px20}>
                  {allList.map((r) => (
                    <RestaurantCardFull
                      key={r._id}
                      item={r}
                      favorites={favorites}
                      onToggleFav={toggleFav}
                    />
                  ))}
                </View>
              )}
            </Section>

            {/* ════ QUÁN NGON GIÁ TỐT ════ */}
            {budgetList.length > 0 && (
              <Section title="Quán ngon giá tốt" onViewAll={() => {}}>
                <FlatList
                  data={budgetList}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item }) => (
                    <RestaurantCardCompact item={item} favorites={favorites} onToggleFav={toggleFav} />
                  )}
                />
              </Section>
            )}

            {/* ════ YÊU THÍCH ════ */}
            {favRestaurants.length > 0 && (
              <Section title="❤️ Yêu thích của bạn">
                <FlatList
                  data={favRestaurants}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item }) => (
                    <RestaurantCardCompact item={item} favorites={favorites} onToggleFav={toggleFav} />
                  )}
                />
              </Section>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

//  STYLES

const cardFull = StyleSheet.create({
  card: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: { height: 192, position: "relative" },
  image: { width: "100%", height: "100%" },
  badgeFeatured: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  favBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  overlayBottom: { position: "absolute", bottom: 12, left: 12, right: 52 },
  name: {
    fontSize: 16, fontWeight: "800", color: "#fff", marginBottom: 3,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cuisine: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
  dot: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  price: { fontSize: 12, fontWeight: "800" },
  info: { padding: 12 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingNum: { fontSize: 13, fontWeight: "800", color: TEXT },
  ratingCount: { fontSize: 12, color: TEXT_MUTED },
  cityRow: { flexDirection: "row", alignItems: "center" },
  cityText: { fontSize: 12, color: TEXT_MUTED },
  metaRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginBottom: 8, flexWrap: "wrap",
  },
  metaLocation: { fontSize: 11, color: TEXT_SEC, flex: 1 },
  parking: { fontSize: 11, color: "#22C55E", fontWeight: "700" },
  hours: { fontSize: 11, color: TEXT_MUTED },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { backgroundColor: "#FFF3ED", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 10, color: PRIMARY, fontWeight: "700" },
});

const cardCompact = StyleSheet.create({
  card: {
    width: 176, backgroundColor: SURFACE, borderRadius: 18,
    overflow: "hidden", marginRight: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  imageWrap: { height: 112, position: "relative" },
  image: { width: "100%", height: "100%" },
  cuisineBadge: {
    position: "absolute", bottom: 8, left: 8,
    backgroundColor: "rgba(254,158,28,0.92)",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, maxWidth: 130,
  },
  cuisineText: { fontSize: 9, fontWeight: "700", color: "#fff" },
  favBtn: {
    position: "absolute", top: 7, right: 7,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center", justifyContent: "center",
  },
  info: { padding: 9 },
  name: { fontSize: 13, fontWeight: "700", color: TEXT, marginBottom: 3 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 3 },
  rating: { fontSize: 11, fontWeight: "700", color: TEXT },
  reviews: { fontSize: 10, color: TEXT_MUTED },
  city: { fontSize: 10, color: TEXT_MUTED },
});

const sec = StyleSheet.create({
  wrap: { marginBottom: 10 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: "900", color: TEXT },
  link: { fontSize: 13, fontWeight: "700", color: PRIMARY },
});

const skel = StyleSheet.create({
  line: { backgroundColor: "#F0F0F0", borderRadius: 8 },
});

const skeleton = StyleSheet.create({
  card: { backgroundColor: SURFACE, borderRadius: 20, overflow: "hidden", marginBottom: 14 },
  image: { height: 192, backgroundColor: "#F0F0F0" },
  body: { padding: 12 },
  line1: { height: 16, backgroundColor: "#F0F0F0", borderRadius: 8, marginBottom: 8, width: "70%" },
  line2: { height: 12, backgroundColor: "#F0F0F0", borderRadius: 8, marginBottom: 8, width: "50%" },
  line3: { height: 12, backgroundColor: "#F0F0F0", borderRadius: 8, width: "40%" },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },

  header: {
    paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: "#FFF8F5",
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    marginBottom: 4,
    shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09, shadowRadius: 14, elevation: 4,
  },

  headerTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 18,
  },

  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoDot: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  logoA: { fontSize: 18, fontWeight: "900", color: "#fff" },
  logoText: { fontSize: 22, fontWeight: "900", color: TEXT },

  headerBtns: { flexDirection: "row", gap: 8 },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center", position: "relative",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  badge: {
    position: "absolute", top: -4, right: -4,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: PRIMARY, alignItems: "center",
    justifyContent: "center", paddingHorizontal: 3,
  },
  badgeNum: { fontSize: 9, fontWeight: "800", color: "#fff" },
  notifDot: {
    position: "absolute", top: 9, right: 9,
    width: 7, height: 7, borderRadius: 4, backgroundColor: PRIMARY,
  },

  greetingWrap: { marginBottom: 18 },
  greetingName: { fontSize: 22, fontWeight: "900", color: TEXT, letterSpacing: -0.3 },
  greetingSub: { fontSize: 14, color: TEXT_SEC, marginTop: 3 },

  searchBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: SURFACE, borderRadius: 16,
    borderWidth: 1, borderColor: "#E5E7EB",
    paddingHorizontal: 14, height: 50,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    marginBottom: 12, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: TEXT, paddingVertical: 0 },
  micBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  // Quick tags
  quickTagsRow: { gap: 8, paddingRight: 4 },
  quickTag: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
    borderColor: "#E5E7EB", backgroundColor: SURFACE,
  },
  quickTagActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  quickTagText: { fontSize: 12, fontWeight: "600", color: TEXT_SEC },
  quickTagTextActive: { color: "#fff" },

  // Filter panel
  filterPanel: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "#E5E7EB",
  },
  filterLabel: {
    fontSize: 11, fontWeight: "700", color: TEXT_MUTED,
    marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5,
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB",
    backgroundColor: SURFACE,
  },
  filterChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filterChipText: { fontSize: 12, color: TEXT_SEC, fontWeight: "600" },
  filterChipTextActive: { color: "#fff" },
  clearBtn: {
    alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: "#EF4444",
  },
  clearBtn2: {
    marginTop: 14, alignSelf: "center",
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: "#EF4444",
  },
  clearBtnText: { fontSize: 13, color: "#EF4444", fontWeight: "700" },

  // Categories
  categoriesGrid: {
    flexDirection: "row", paddingHorizontal: 14,
    paddingVertical: 16, gap: 2,
  },
  catItem: { flex: 1, alignItems: "center", gap: 5 },
  catIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  catIconInactive: { backgroundColor: "#FFF3ED" },
  catLabel: { fontSize: 9, fontWeight: "600", color: TEXT_SEC, textAlign: "center", lineHeight: 12 },
  catLabelActive: { color: PRIMARY, fontWeight: "800" },

  hList: { paddingHorizontal: 20, paddingRight: 20 },
  px20: { paddingHorizontal: 20 },

  emptyBox: { alignItems: "center", paddingVertical: 56, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: TEXT, marginTop: 14, marginBottom: 6 },
  emptyText: { fontSize: 13, color: TEXT_MUTED, textAlign: "center", lineHeight: 20 },
});