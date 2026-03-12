import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

/**
 * DistributionHistoryPage
 * Fetches and displays the distribution history for the logged-in user.
 */
export default function DistributionHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/distribution/mine`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#003366" />
      <Text style={styles.loadingText}>Fetching your records...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Log</Text>
        </View>

        {/* SUMMARY HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <MaterialIcons name="receipt-long" size={32} color="white" />
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.heroLabel}>TOTAL DISTRIBUTIONS</Text>
              <Text style={styles.heroValue}>{history.length} RECORDS</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>RECENT TRANSACTIONS</Text>

        {/* LOG ENTRIES */}
        {history.length > 0 ? (
          history.map((entry, index) => (
            <View key={index} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View>
                  <Text style={styles.txnId}>ID: {entry._id.substring(0, 8).toUpperCase()}</Text>
                  <Text style={styles.txnDate}>{new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <View style={[styles.statusBadge, styles.completedBadge]}>
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>

              <View style={styles.shopInfo}>
                <MaterialIcons name="storefront" size={16} color="#64748B" />
                <Text style={styles.shopName}>Official Ration Distribution</Text>
              </View>

              <View style={styles.dashedLine} />

              <View style={styles.itemsGrid}>
                <ItemBox
                  label={entry.product?.name?.toUpperCase() || "PRODUCT"}
                  val={`${entry.quantity}${entry.product?.unit || "U"}`}
                  icon={entry.product?.name?.toLowerCase() === "oil" ? "opacity" : "inventory-2"}
                />
              </View>

              <TouchableOpacity style={styles.detailLink}>
                <Text style={styles.linkText}>VIEW DIGITAL RECEIPT</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#FF9933" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No distribution records found.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const ItemBox = ({ label, val, icon }) => (
  <View style={styles.itemBox}>
    <MaterialIcons name={icon} size={14} color="#003366" />
    <Text style={styles.itemVal}>{val}</Text>
    <Text style={styles.itemLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FB" },
  loadingText: { fontSize: 16, fontWeight: "900", color: "#003366", marginTop: 12 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  backText: { marginLeft: 4, fontWeight: "800", color: "#003366", fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", marginLeft: 20, textTransform: "uppercase", letterSpacing: 0.5 },

  heroCard: {
    backgroundColor: "#003366",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    borderBottomWidth: 4,
    borderBottomColor: "#FF9933",
  },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroLabel: { color: "#FF9933", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heroValue: { color: "white", fontSize: 24, fontWeight: "900", marginTop: 4 },

  sectionLabel: { fontSize: 12, fontWeight: "900", color: "#64748B", marginBottom: 16, letterSpacing: 1.5 },

  logCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  logHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  txnId: { fontSize: 10, fontWeight: "900", color: "#94A3B8" },
  txnDate: { fontSize: 16, fontWeight: "900", color: "#003366", marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  completedBadge: { backgroundColor: "#ECFDF5" },
  statusText: { fontSize: 10, fontWeight: "900", textTransform: "uppercase", color: "#059669" },

  shopInfo: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  shopName: { fontSize: 12, fontWeight: "700", color: "#64748B", marginLeft: 6 },

  dashedLine: { height: 1, borderStyle: "dashed", borderWidth: 1, borderColor: "#E2E8F0", marginVertical: 12 },

  itemsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", marginBottom: 16 },
  itemBox: { width: "30%", alignItems: "center", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 12, marginRight: 10 },
  itemVal: { fontSize: 13, fontWeight: "900", color: "#003366", marginVertical: 4 },
  itemLabel: { fontSize: 8, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },

  detailLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 16 },
  linkText: { fontSize: 11, fontWeight: "900", color: "#FF9933", marginRight: 8, letterSpacing: 0.5 },

  emptyContainer: { alignItems: "center", marginTop: 40 },
  emptyText: { marginTop: 16, fontSize: 16, color: "#64748B", fontWeight: "700" },
});
