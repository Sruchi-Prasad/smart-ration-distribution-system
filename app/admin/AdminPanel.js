import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import * as Progress from "react-native-progress";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import UserGrid from "./UserGrid";

export default function AdminPanel() {
  const router = useRouter();

  const [showUserGrid, setShowUserGrid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [panelData, setPanelData] = useState({
    usersLogged: 0,
    shopkeepersLogged: 0,
    recentLoginsCount: 0,
    distributedUsers: 0,
    stateSummary: []
  });

  /* ---------------- ROLE CHECK ---------------- */
  useEffect(() => {
    const checkRole = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user || user.role !== "admin") {
        router.replace("/login");
      }
    };
    checkRole();
  }, []);

  /* ---------------- LOAD DASHBOARD ---------------- */
  const loadPanel = useCallback(async () => {
    try {
      setError(null);

      // Use your helper instead of plain fetch
      const res = await fetchWithAuth("http://localhost:8000/api/admin/panel");

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
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              "accessToken",
              "refreshToken",
              "user"
            ]);
            // ✅ Ensure storage is cleared before navigating
            console.log("Tokens cleared, redirecting...");
            router.replace("/login");
          } catch (err) {
            console.error("Logout failed:", err);
          }
        }
      }
    ]);
  };


  /* ---------------- USER GRID ---------------- */
  if (showUserGrid) {
    return <UserGrid onBack={() => setShowUserGrid(false)} />;
  }

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text>Loading Admin Dashboard...</Text>
      </View>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{error}</Text>
        <TouchableOpacity onPress={loadPanel}>
          <Text style={{ color: "#1E88E5", marginTop: 10 }}>
            Retry
          </Text>
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
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/emblem.png")}
          style={styles.emblem}
        />
        <Text style={styles.headerText}>
          SMART RATION DISTRIBUTION SYSTEM
        </Text>
      </View>

      <Text style={styles.title}>Admin Panel</Text>

      {/* LOGIN PROGRESS */}
      <View style={styles.loginSummary}>
        <View style={styles.barWrapper}>
          <FontAwesome name="user" size={24} color="#003366" />
          <Text style={styles.loginLabel}>Users Logged In</Text>
          <Progress.Bar
            progress={panelData.usersLogged / 100}
            width={200}
            color="#00BFFF"
          />
          <Text>{panelData.usersLogged}%</Text>
        </View>

        <View style={styles.barWrapper}>
          <FontAwesome name="shopping-cart" size={24} color="#003366" />
          <Text style={styles.loginLabel}>Shopkeepers Logged</Text>
          <Progress.Bar
            progress={panelData.shopkeepersLogged / 100}
            width={200}
            color="#FF6347"
          />
          <Text>{panelData.shopkeepersLogged}%</Text>
        </View>
      </View>

      {/* STAT CARDS */}
      <View style={styles.statCard}>
        <TouchableOpacity
          onPress={async () => {
            try {
              const response = await fetch("http://localhost:8000/api/recent-logins");
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
          <Text>Recent Logins (7 days)</Text>
        </TouchableOpacity>


        <Text style={styles.loginCount}>
          {panelData.recentLoginsCount}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text>Users Distributed</Text>
        <Text style={styles.loginCount}>
          {panelData.distributedUsers}
        </Text>
      </View>

      <View style={styles.stateCard}>
        <Text style={styles.stateTitle}>Users by State</Text>

        {panelData.stateSummary.length === 0 ? (
          <Text>No state data available</Text>
        ) : (
          panelData.stateSummary.map((item, index) => (
            <View key={index} style={styles.stateRow}>
              <Text style={styles.stateName}>
                {item.state || item._id || "Unknown"}
              </Text>
              <View style={styles.progressWrapper}>
                <Progress.Bar
                  progress={item.count / maxUsers}
                  width={null}
                  height={10}
                  color="#4CAF50"
                />
              </View>

              <Text style={styles.stateCount}>{item.count}</Text>
            </View>
          ))
        )}
      </View>

      {/* DASHBOARD GRID */}
      <View style={styles.grid}>
        <Tile icon="people" text="Manage Users" onPress={() => setShowUserGrid(true)} />
        <Tile icon="inventory" text="Manage Products" onPress={() => router.push("/admin/Productlist")} />
        <Tile icon="event" text="Distribution Tracking" onPress={() => router.push("/admin/distributionTracking")} />
        <Tile icon="feedback" text="Feedback Review" onPress={() => router.push("/admin/feedbackReview")} />
        <Tile icon="history" text="Audit Logs" onPress={() => router.push("/admin/auditLogs")} />
        <Tile icon="bar-chart" text="Analytics" onPress={() => router.push("/admin/analytics")} />
        <Tile icon="settings" text="System Settings" onPress={() => router.push("/admin/SystemSetting")} />
        <Tile icon="logout" text="Logout" onPress={async () => {
          console.log("Logout pressed");
          await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
          router.replace("/login");
        }}
        />
      </View>
    </ScrollView>
  );
}

/* -------- TILE COMPONENT (Reusable) -------- */
const Tile = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.tile} onPress={onPress}>
    <MaterialIcons name={icon} size={28} color="white" />
    <Text style={styles.tileText}>{text}</Text>
  </TouchableOpacity>
);

/* -------- STYLES -------- */
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  emblem: { width: 40, height: 40, marginRight: 10 },
  headerText: { fontWeight: "bold", color: "#003366" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  tile: {
    width: "48%",
    backgroundColor: "#1E88E5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center"
  },
  tileText: { color: "white", marginTop: 8, fontWeight: "600" },
  loginSummary: { flexDirection: "row", justifyContent: "space-around" },
  barWrapper: { alignItems: "center" },
  statCard: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15
  },
  loginCount: { fontSize: 18, fontWeight: "bold", color: "#1E88E5" },
  stateCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3
  },

  stateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#003366"
  },

  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  stateName: {
    width: 90,              // ⭐ FIX
    fontSize: 15,
    fontWeight: "600",
    color: "#000"
  },

  progressWrapper: {
    flex: 5,               // ⭐ FIX
    marginHorizontal: 10
  },

  stateCount: {
    flex: 1,               // ⭐ FIX
    fontWeight: "bold",
    textAlign: "right",
    color: "#1E88E5"
  }
});
