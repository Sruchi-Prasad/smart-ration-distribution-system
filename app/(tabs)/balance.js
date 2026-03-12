import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RationBalancePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };
    fetchUser();
  }, []);

  if (!user) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading Balance...</Text>
    </View>
  );

  const quotas = { rice: 50, wheat: 50, sugar: 10, oil: 5 };
  const balanceItems = [
    { key: "rice", label: "Premium Rice", icon: "inventory-2", color: "#003366" },
    { key: "wheat", label: "Fortified Wheat", icon: "grain", color: "#FF9933" },
    { key: "sugar", label: "Refined Sugar", icon: "bakery-dining", color: "#128807" },
    { key: "oil", label: "Cooking Oil", icon: "opacity", color: "#D32F2F" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ration Allocation</Text>
        </View>

        {/* HERO SUMMARY */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>MONTHLY QUOTA STATUS</Text>
          <Text style={styles.heroValue}>MARCH 2024</Text>
          <View style={styles.underline} />
          <Text style={styles.heroSub}>Your entitlements are updated in real-time based on distribution records.</Text>
        </View>

        {/* BALANCE CARDS */}
        {balanceItems.map((item) => {
          const remaining = user.balance?.[item.key] || 0;
          const quota = quotas[item.key] || 1;
          const consumed = quota - remaining;
          const percent = Math.min((remaining / quota) * 100, 100);

          return (
            <View key={item.key} style={styles.balanceCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <MaterialIcons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDesc}>Monthly Authorized Quota</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.remainingVal, { color: item.color }]}>
                    {remaining}{item.key === "oil" ? "L" : "kg"}
                  </Text>
                  <Text style={styles.totalVal}>of {quota}{item.key === "oil" ? "L" : "kg"}</Text>
                </View>
              </View>

              {/* MODERN PROGRESS */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: item.color }]} />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>{Math.round(percent)}% Remaining</Text>
                  <Text style={styles.consumedText}>Used: {consumed}{item.key === "oil" ? "L" : "kg"}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* FOOTER NOTE */}
        <View style={styles.footerNote}>
          <MaterialIcons name="info-outline" size={20} color="#64748B" />
          <Text style={styles.footerText}>Balance resets on the 1st of every month automatically.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FB" },
  loadingText: { fontSize: 16, fontWeight: "900", color: "#003366" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  backText: { marginLeft: 4, fontWeight: "800", color: "#003366", fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", marginLeft: 20, textTransform: "uppercase", letterSpacing: 0.5 },

  heroCard: {
    backgroundColor: "#003366",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#003366",
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  heroLabel: { color: "#FF9933", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  heroValue: { color: "white", fontSize: 28, fontWeight: "900", marginTop: 8 },
  underline: { height: 4, width: 40, backgroundColor: "#FF9933", borderRadius: 2, marginVertical: 16 },
  heroSub: { color: "rgba(255,255,255,0.7)", textAlign: "center", fontSize: 13, fontWeight: "600", lineHeight: 20 },

  balanceCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    borderLeftWidth: 6,
    borderLeftColor: "#EEF2F6", // Neutral by default
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" },
  itemLabel: { fontSize: 16, fontWeight: "900", color: "#003366" },
  itemDesc: { fontSize: 11, fontWeight: "700", color: "#64748B", marginTop: 2, textTransform: "uppercase" },
  remainingVal: { fontSize: 18, fontWeight: "900" },
  totalVal: { fontSize: 12, fontWeight: "700", color: "#94A3B8" },

  progressContainer: { marginTop: 20 },
  progressTrack: { height: 10, backgroundColor: "#F1F5F9", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  progressInfo: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  progressText: { fontSize: 12, fontWeight: "900", color: "#475569" },
  consumedText: { fontSize: 12, fontWeight: "800", color: "#94A3B8" },

  footerNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20, paddingHorizontal: 30 },
  footerText: { marginLeft: 10, fontSize: 13, fontWeight: "600", color: "#64748B", textAlign: "center" }
});
