import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function ReportReviewPage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const reportTypes = ["Card Problem", "Distribution Delay", "Wrong Quantity", "Complaint"];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_BASE}/api/feedback/all`);
      if (res.ok) {
        const data = await res.json();
        // Filter for specific report types
        const filtered = data.filter(item => reportTypes.includes(item.type));
        setReports(filtered);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.reportBadge}>
          <Text style={styles.reportText}>{item.type}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.message}>{item.message}</Text>

      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <MaterialIcons name="account-circle" size={18} color="#D32F2F" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.infoText}>{item.user?.fullName || item.name || "Anonymous"}</Text>
            {(item.user?.email || item.email) && (
              <Text style={styles.subInfoText}>{item.user?.email || item.email}</Text>
            )}
          </View>
        </View>
        
        <View style={[styles.infoItem, { borderLeftWidth: 1, borderLeftColor: "#EEE", paddingLeft: 12, marginLeft: 12 }]}>
          <MaterialIcons name="storefront" size={18} color="#666" />
          <Text style={[styles.infoText, { color: "#666" }]} numberOfLines={1}>
            {item.shop?.shopName || "General"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Case Tracking</Text>
        <MaterialIcons name="assignment-late" size={24} color="#D32F2F" />
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchReports}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="check-circle-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyText}>All Clear - No Pending Issues</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 3,
    borderBottomColor: "#D32F2F",
    elevation: 4,
  },
  headerTitle: { fontSize: 16, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#D32F2F",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  reportBadge: { backgroundColor: "#FFEBEB", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  reportText: { color: "#D32F2F", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  dateText: { fontSize: 11, color: "#999", fontWeight: "700" },
  message: { fontSize: 15, color: "#003366", fontWeight: "600", lineHeight: 22, marginVertical: 12 },
  footer: { flexDirection: "row", backgroundColor: "#F9FAFB", padding: 12, borderRadius: 12, marginTop: 10 },
  infoItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  infoText: { fontSize: 12, fontWeight: "800", color: "#003366" },
  subInfoText: { fontSize: 10, color: "#666", fontWeight: "600" },
  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 20, fontSize: 15, fontWeight: "800", color: "#999", textTransform: "uppercase" }
});
