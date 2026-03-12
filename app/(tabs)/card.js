import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function CardDetailPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const res = await fetchWithAuth(`${API_BASE}/api/auth/user/${parsedUser._id}`);

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Verifying Credentials...</Text>
    </View>
  );

  const isActive = user?.status !== "Expired";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Digital Ration Card</Text>
        </View>

        {/* PREMIUM CARD CONTAINER */}
        <View style={[styles.cardContainer, !isActive && styles.expiredCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.govWrapper}>
              <Text style={styles.govTitle}>GOVERNMENT OF INDIA</Text>
              <Text style={styles.govSub}>PUBLIC DISTRIBUTION SYSTEM</Text>
            </View>
            <MaterialIcons name="verified-user" size={32} color={isActive ? "#FF9933" : "#64748B"} />
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardNumberLabel}>RATION CARD NUMBER</Text>
            <Text style={styles.cardNumber}>{user?.rationCard || "NF-9923-0102-11"}</Text>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.cardLabel}>HOLDER NAME</Text>
                <Text style={styles.cardValue}>{user?.fullName || "N/A"}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.cardLabel}>TYPE</Text>
                <Text style={styles.cardValue}>PHH - Saffron</Text>
              </View>
            </View>

            <View style={[styles.row, { marginTop: 16 }]}>
              <View style={styles.col}>
                <Text style={styles.cardLabel}>ISSUE DATE</Text>
                <Text style={styles.cardValue}>
                  {user?.issueDate ? new Date(user.issueDate).toLocaleDateString() : "01/01/2024"}
                </Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.cardLabel}>EXPIRY</Text>
                <Text style={styles.cardValue}>
                  {user?.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : "31/12/2030"}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.statusBanner, isActive ? styles.activeBanner : styles.expiredBanner]}>
            <MaterialIcons name={isActive ? "check-circle" : "error"} size={16} color="white" />
            <Text style={styles.statusText}>{isActive ? "VALID & ACTIVE CERTIFICATE" : "EXPIRED / INACTIVE"}</Text>
          </View>
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identity Verification</Text>
          <DetailRow icon="fingerprint" label="Aadhaar Link" value={user?.aadhaarNumber ? user.aadhaarNumber.replace(/^(\d{4})\d{4}(\d{4})$/, "$1 **** $2") : "Not Verified"} />
          <DetailRow icon="group" label="Members Linked" value={`${user?.members?.length || 0} Verify Members`} />
          <DetailRow icon="security" label="Secure PIN" value="Enabled (Last reset 20d ago)" />
        </View>

        {/* QUOTA SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quota Authorization</Text>
          <View style={styles.quotaRow}>
            <QuotaItem label="RICE" value={`${user?.balance?.rice || 0}kg`} color="#003366" />
            <QuotaItem label="WHEAT" value={`${user?.balance?.wheat || 0}kg`} color="#128807" />
            <QuotaItem label="SUGAR" value={`${user?.balance?.sugar || 0}kg`} color="#FF9933" />
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <CardAction icon="edit" title="Update Profile" sub="Maintain accuracy" onPress={() => router.push("/update-info")} />
          <CardAction icon="history" title="Check Transactions" sub="View distribution log" onPress={() => router.push("/history")} />
          <CardAction icon="file-download" title="Export PDF" sub="Download certificate" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={20} color="#64748B" />
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const QuotaItem = ({ label, value, color }) => (
  <View style={styles.quotaItem}>
    <Text style={[styles.quotaValue, { color }]}>{value}</Text>
    <Text style={styles.quotaLabel}>{label}</Text>
  </View>
);

const CardAction = ({ icon, title, sub, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <View style={styles.actionIconBox}>
      <MaterialIcons name={icon} size={24} color="#003366" />
    </View>
    <View style={styles.actionTextBox}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSub}>{sub}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#64748B" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FB" },
  loadingText: { fontSize: 16, fontWeight: "900", color: "#003366" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  backText: { marginLeft: 4, fontWeight: "800", color: "#003366", fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", marginLeft: 20, textTransform: "uppercase", letterSpacing: 0.5 },

  cardContainer: {
    backgroundColor: "#003366",
    borderRadius: 24,
    padding: 24,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 24,
    overflow: "hidden",
  },
  expiredCard: { backgroundColor: "#1E293B" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  govWrapper: { borderLeftWidth: 4, borderLeftColor: "#FF9933", paddingLeft: 12 },
  govTitle: { color: "white", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  govSub: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "700", marginTop: 2 },

  cardBody: { marginBottom: 20 },
  cardNumberLabel: { color: "#FF9933", fontSize: 10, fontWeight: "900", letterSpacing: 1, marginBottom: 4 },
  cardNumber: { color: "white", fontSize: 22, fontWeight: "900", letterSpacing: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 20 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { flex: 1 },
  cardLabel: { color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  cardValue: { color: "white", fontSize: 14, fontWeight: "700", marginTop: 4 },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeBanner: { backgroundColor: "#128807" },
  expiredBanner: { backgroundColor: "#D32F2F" },
  statusText: { color: "white", fontSize: 11, fontWeight: "900", marginLeft: 8, letterSpacing: 0.5 },

  section: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    borderLeftWidth: 6,
    borderLeftColor: "#003366",
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#003366", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  detailText: { marginLeft: 14 },
  detailLabel: { fontSize: 10, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
  detailValue: { fontSize: 15, fontWeight: "700", color: "#003366", marginTop: 2 },

  quotaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  quotaItem: { alignItems: "center", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 16, width: "30%" },
  quotaValue: { fontSize: 16, fontWeight: "900" },
  quotaLabel: { fontSize: 9, fontWeight: "800", color: "#64748B", marginTop: 4 },

  actions: { marginBottom: 20 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  actionIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#F0F4F8", justifyContent: "center", alignItems: "center" },
  actionTextBox: { flex: 1, marginLeft: 16 },
  actionTitle: { fontSize: 15, fontWeight: "800", color: "#003366" },
  actionSub: { fontSize: 11, color: "#64748B", marginTop: 2, fontWeight: "600" },
});
