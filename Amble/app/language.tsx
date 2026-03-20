import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLanguageStore } from "../store/languageStore";
import { useI18n } from "../hooks/use-i18n";

type LanguageValue = "vi" | "en";

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [selected, setSelected] = useState<LanguageValue>(language);

  const options = useMemo(
    () => [
      {
        code: "VN",
        label: t("language.option.vn.label"),
        subLabel: t("language.option.vn.subLabel"),
        value: "vi" as const,
      },
      {
        code: "EN",
        label: t("language.option.en.label"),
        subLabel: t("language.option.en.subLabel"),
        value: "en" as const,
      },
    ],
    [t]
  );

  const handleSelect = (value: LanguageValue) => {
    setSelected(value);
    setLanguage(value);
    setTimeout(() => {
      router.replace("/welcome");
    }, 200);
  };

  const selectedMeta = useMemo(
    () => options.find((item) => item.value === selected),
    [options, selected]
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#FF7A00", "#FFA63E", "#FFD17A"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <LinearGradient
            colors={["#FFB347", "#FF6B35"]}
            style={styles.logoInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoText}>A</Text>
          </LinearGradient>
        </View>
        <Text style={styles.appName}>Amble</Text>
        <Text style={styles.subtitle}>{t("language.subtitle")}</Text>
      </View>

      <View style={styles.cardWrap}>
        {options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.85}
            >
              <View style={styles.codePill}>
                <Text style={styles.codeText}>{option.code}</Text>
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{option.label}</Text>
                <Text style={styles.cardSubtitle}>{option.subLabel}</Text>
              </View>

              <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                {isSelected && <Ionicons name="checkmark" size={16} color="#FF7A00" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedMeta ? (
        <Text style={styles.helperText}>
          {selectedMeta.label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 64,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  appName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  cardWrap: {
    gap: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2E8",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardSelected: {
    backgroundColor: "#FFF7EE",
  },
  codePill: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFE6D1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkCircleSelected: {
    backgroundColor: "#FFF2E8",
  },
  helperText: {
    textAlign: "center",
    marginTop: 16,
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
  },
});
