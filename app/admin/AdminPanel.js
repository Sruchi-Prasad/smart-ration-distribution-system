import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import * as Progress from "react-native-progress";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import UserGrid from "./UserGrid";

export default function AdminPanel() {
  const router = useRouter();

  const [showUserGrid, setShowUserGrid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [blastLoading, setBlastLoading] = useState(false);

  const [panelData, setPanelData] = useState({
    usersLogged: 0,
    shopkeepersLogged: 0,
    recentLoginsCount: 0,
    distributedUsers: 0,
    stateSummary: []
  });

  const { user, logout } = useAuth();

  /* Dashboard and data loading logic continues... */

  /* ---------------- LOAD DASHBOARD ---------------- */
  const loadPanel = useCallback(async () => {
    try {
      setError(null);

      // Use your helper instead of plain fetch
      const res = await fetchWithAuth(`${API_BASE}/api/admin/panel`);

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard");
      }

      const data = await res.json();

      console.log("STATE SUMMARY:", data.stateSummary); // ✅ ADD HERE

      setPanelData(data);
    } catch (err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);


  useEffect(() => {
    loadPanel();
  }, []);

  /* ---------------- PULL TO REFRESH ---------------- */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPanel();
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    logout();
  };

  /* ---------------- BLAST KYC REMINDER ---------------- */
  const blastKycReminder = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("This will send an email AND in-app notification to ALL users with pending KYC. Continue?");
      if (!confirmed) return;
      executeBlast();
    } else {
      Alert.alert(
        "Blast KYC Reminder",
        "This will send an email AND in-app notification to ALL users with pending KYC. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: executeBlast }
        ]
      );
    }
  };

  const executeBlast = async () => {

    try {
      setBlastLoading(true);
      const res = await fetchWithAuth(`${API_BASE}/api/auth/send-kyc-reminder`, { method: "POST" });
      const data = await res.json();
      if (Platform.OS === 'web') {
        alert(`✅ KYC Reminder Sent!\n\nIn-app notifications: ${data.notificationsSaved}\nEmails sent: ${data.emailsSent}\nSkipped (rate-limit): ${data.skippedRateLimit}`);
      } else {
        Alert.alert("Success", `✅ KYC Reminder Sent!\n\nNotifications: ${data.notificationsSaved}\nEmails: ${data.emailsSent}`);
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        alert("❌ Failed to blast reminder. Please try again.");
      } else {
        Alert.alert("Error", "❌ Failed to blast reminder.");
      }
    } finally {
      setBlastLoading(false);
    }
  };


  /* ---------------- USER GRID ---------------- */
  if (showUserGrid) {
    return <UserGrid onBack={() => setShowUserGrid(false)} />;
  }

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF9933" />
        <Text style={{ marginTop: 16, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1 }}>Authenticating Dashboard...</Text>
      </View>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={48} color="#D32F2F" />
        <Text style={{ color: "#D32F2F", fontWeight: "800", marginTop: 16 }}>{error}</Text>
        <TouchableOpacity onPress={loadPanel} style={{ marginTop: 20, backgroundColor: "#003366", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
          <Text style={{ color: "white", fontWeight: "900", textTransform: "uppercase" }}>Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const maxUsers = Math.max(
    ...panelData.stateSummary.map(s => s.count),
    1
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9933" />
      }
    >
      {/* HEADER */}
      <View style={styles.premiumHeader}>
        <View style={styles.headerContent}>
          <Image
            source={require("../../assets/images/emblem.png")}
            style={styles.emblem}
          />
          <Text style={styles.headerTitle}>
            National Smart Ration Portal
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color="#FF9933" />
        </TouchableOpacity>
      </View>

      <Text style={styles.pageTitle}>Administrative Control</Text>
      <View style={styles.titleUnderline} />

      {/* LOGIN PROGRESS */}
      <View style={styles.statsRow}>
        <View style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
              <FontAwesome name="user" size={20} color="#003366" />
            </View>
            <Text style={styles.cardTitle}>Consumer Load</Text>
          </View>
          <Progress.Bar
            progress={panelData.usersLogged / 100}
            width={null}
            color="#003366"
            unfilledColor="#F0F4F8"
            borderWidth={0}
            height={6}
            borderRadius={3}
          />
          <View style={styles.cardFooter}>
            <Text style={styles.percentageText}>{panelData.usersLogged}%</Text>
            <Text style={styles.statusText}>Active Transitions</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}>
              <FontAwesome name="shopping-cart" size={20} color="#FF9933" />
            </View>
            <Text style={styles.cardTitle}>Shopkeeper Load</Text>
          </View>
          <Progress.Bar
            progress={panelData.shopkeepersLogged / 100}
            width={null}
            color="#FF9933"
            unfilledColor="#F0F4F8"
            borderWidth={0}
            height={6}
            borderRadius={3}
          />
          <View style={styles.cardFooter}>
            <Text style={[styles.percentageText, { color: "#FF9933" }]}>{panelData.shopkeepersLogged}%</Text>
            <Text style={styles.statusText}>System Uptime</Text>
          </View>
        </View>
      </View>

      {/* QUICK STATS */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.miniStatCard}
          onPress={async () => {
            try {
              const response = await fetch(`${API_BASE}/api/recent-logins`);
              const data = await response.json();
              router.push({
                pathname: "/admin/RecentLoginsScreen",
                params: { logins: JSON.stringify(data) }
              });
            } catch (error) {
              console.error("Error fetching recent logins:", error);
            }
          }}
        >
          <Text style={styles.statLabel}>Recent Logins (7d)</Text>
          <Text style={styles.statValue}>{panelData.recentLoginsCount}</Text>
        </TouchableOpacity>

        <View style={styles.miniStatCard}>
          <Text style={styles.statLabel}>Distributed Users</Text>
          <Text style={[styles.statValue, { color: "#128807" }]}>{panelData.distributedUsers}</Text>
        </View>
      </View>

      {/* STATE SUMMARY */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Geographical Distribution</Text>

        {panelData.stateSummary.length === 0 ? (
          <Text style={styles.emptyText}>No state data captured</Text>
        ) : (
          panelData.stateSummary.map((item, index) => (
            <View key={index} style={styles.stateRow}>
              <Text style={styles.stateLabel}>
                {item.state || item._id || "Unknown"}
              </Text>
              <View style={styles.progressWrapper}>
                <Progress.Bar
                  progress={item.count / maxUsers}
                  width={null}
                  height={8}
                  color="#003366"
                  unfilledColor="#F0F4F8"
                  borderWidth={0}
                  borderRadius={4}
                />
              </View>
              <Text style={styles.stateCount}>{item.count}</Text>
            </View>
          ))
        )}
      </View>

      {/* STRATEGIC HUB */}
      <Text style={styles.gridTitle}>Strategic Hub</Text>
      <View style={styles.hubContainer}>
        <HubCard
          title="Inventory"
          desc="Manage stock levels, update product list, and track intake."
          onPress={() => router.push("/admin/Productlist")}
        />
        <HubCard
          title="Analytics"
          desc="Deep dive into performance, usage trends, and demographics."
          onPress={() => router.push("/admin/analytics")}
        />
      </View>

      {/* ACTION GRID */}
      <Text style={styles.gridTitle}>System Management</Text>
      <View style={styles.grid}>
        <Tile icon="people" text="Users" onPress={() => setShowUserGrid(true)} />
        <Tile icon="inventory" text="Products" onPress={() => router.push("/admin/Productlist")} />
        <Tile icon="location-on" text="Distribution" onPress={() => router.push("/admin/distributionTracking")} />
        <Tile icon="rate-review" text="Feedback" onPress={() => router.push("/admin/feedbackReview")} />
        <Tile icon="local-shipping" text="Refill Requests" color="#FF9933" onPress={() => router.push("/admin/RefillRequests")} />
        <Tile icon="security" text="Audit Logs" onPress={() => router.push("/admin/auditLogs")} />
        <Tile icon="insights" text="Reports" onPress={() => router.push("/admin/reportReview")} />
        <Tile icon="settings" text="Settings" onPress={() => router.push("/admin/SystemSetting")} />
        <Tile icon="logout" text="Logout" color="#D32F2F" onPress={handleLogout} />
      </View>

      {/* BLAST KYC REMINDER */}
      <TouchableOpacity
        style={[styles.blastBtn, blastLoading && { opacity: 0.6 }]}
        onPress={blastKycReminder}
        disabled={blastLoading}
      >
        {blastLoading
          ? <ActivityIndicator color="white" />
          : <MaterialIcons name="notifications-active" size={20} color="white" />
        }
        <Text style={styles.blastBtnText}>
          {blastLoading ? "Sending..." : "Blast KYC Reminder to All"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const HubCard = ({ title, desc, onPress }) => (
  <TouchableOpacity style={styles.hubCard} onPress={onPress}>
    <View style={styles.hubHeader}>
      <Text style={styles.hubTitle}>{title}</Text>
      <MaterialIcons name="chevron-right" size={20} color="#003366" />
    </View>
    <Text style={styles.hubDesc}>{desc}</Text>
  </TouchableOpacity>
);

const Tile = ({ icon, text, onPress, color = "#003366" }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
    <View style={[styles.tileIcon, { backgroundColor: color === "#D32F2F" ? "#FFEBEB" : "#F0F4F8" }]}>
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.tileText, { color: color === "#D32F2F" ? "#D32F2F" : "#003366" }]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  hubContainer: { marginBottom: 20 },
  hubCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  hubHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  hubTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1 },
  hubDesc: { fontSize: 13, color: "#666", fontWeight: "600", lineHeight: 20 },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FB" },
  blastBtn: {
    backgroundColor: "#D32F2F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#D32F2F",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  blastBtnText: {
    color: "white",
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 14,
    letterSpacing: 1,
    marginLeft: 10,
  },
  premiumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: "#FF9933",
  },
  headerContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  emblem: { width: 32, height: 32, marginRight: 12 },
  headerTitle: { fontWeight: "900", color: "#003366", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 },
  logoutBtn: { padding: 8, backgroundColor: "#FFF3E0", borderRadius: 12 },
  pageTitle: { fontSize: 24, fontWeight: "900", color: "#003366", textAlign: "center", marginTop: 8 },
  titleUnderline: { height: 4, width: 40, backgroundColor: "#FF9933", borderRadius: 2, alignSelf: "center", marginTop: 8, marginBottom: 24 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  progressCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 8 },
  cardTitle: { fontSize: 11, fontWeight: "800", color: "#666", textTransform: "uppercase" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 },
  percentageText: { fontSize: 18, fontWeight: "900", color: "#003366" },
  statusText: { fontSize: 9, color: "#999", fontWeight: "700", textTransform: "uppercase" },
  miniStatCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    alignItems: "flex-start",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  statLabel: { fontSize: 10, fontWeight: "800", color: "#666", textTransform: "uppercase", marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: "900", color: "#003366" },
  analyticsCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    borderLeftWidth: 6,
    borderLeftColor: "#FF9933",
  },
  analyticsTitle: { fontSize: 16, fontWeight: "900", color: "#003366", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 },
  stateRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  stateLabel: { width: 80, fontSize: 13, fontWeight: "800", color: "#444" },
  progressWrapper: { flex: 1, marginHorizontal: 12 },
  stateCount: { width: 40, fontSize: 13, fontWeight: "900", color: "#003366", textAlign: "right" },
  gridTitle: { fontSize: 16, fontWeight: "900", color: "#003366", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.5, marginLeft: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  tile: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  tileIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  tileText: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  emptyText: { textAlign: "center", color: "#999", paddingVertical: 20, fontWeight: "600" }
});
