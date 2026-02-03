import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import Svg, { Rect, Text as SvgText } from "react-native-svg";

export default function AdminPanel() {
  const router = useRouter();
  const [panelData, setPanelData] = useState({
    usersLogged: 0,
    shopkeepersLogged: 0,
    recentLoginsCount: 0,
    distributedUsers: 0,
    stateSummary: []
  });

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

  useEffect(() => {
    const loadPanel = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("Token from AsyncStorage:", token); // ✅ Add this


      const res = await fetch("http://localhost:8000/api/admin/panel", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Ensure Bearer prefix
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      console.log("Panel data:", data); // ✅ See what backend returns
      setPanelData(data);
    };
    loadPanel();
  }, []);


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.headerText}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      <Text style={styles.title}>Admin Panel</Text>

      {/* Progress Bars */}
      <View style={styles.loginSummary}>
        <View style={styles.barWrapper}>
          <FontAwesome name="user" size={24} color="#003366" />
          <Text style={styles.loginLabel}>Users Logged In</Text>
          <Progress.Bar
            progress={panelData.usersLogged / 100}
            width={200}
            color="#00BFFF"
            style={{ marginVertical: 8 }}
          />
          <Text style={styles.percentLabel}>{panelData.usersLogged}%</Text>
        </View>

        <View style={styles.barWrapper}>
          <FontAwesome name="shopping-cart" size={24} color="#003366" />
          <Text style={styles.loginLabel}>Shopkeepers Logged In</Text>
          <Progress.Bar
            progress={panelData.shopkeepersLogged / 100}
            width={200}
            color="#FF6347"
            style={{ marginVertical: 8 }}
          />
          <Text style={styles.percentLabel}>{panelData.shopkeepersLogged}%</Text>
        </View>
      </View>

      {/* Stat Cards */}
      <View style={styles.statCard}>
        <Text style={styles.loginLabel}>Recent Logins (7 days)</Text>
        <Text style={styles.loginCount}>{panelData.recentLoginsCount}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.loginLabel}>Users Distributed</Text>
        <Text style={styles.loginCount}>{panelData.distributedUsers}</Text>
      </View>

      {/* Custom SVG Bar Chart */}
      {/* Custom SVG Bar Chart */}
      {Array.isArray(panelData.stateSummary) && panelData.stateSummary.length > 0 && (
        <View style={{ marginVertical: 20, alignItems: "center" }}>
          <Text style={styles.title}>State-wise User Distribution</Text>
          <Svg height="200" width="350">
            {panelData.stateSummary.map((item, index) => {
              const barHeight = item.count * 5; // scale factor
              return (
                <Rect
                  key={item._id || index}
                  x={index * 50}
                  y={200 - barHeight}
                  width="40"
                  height={barHeight}
                  fill="#1E88E5"
                />
              );
            })}
            {panelData.stateSummary.map((item, index) => (
              <SvgText
                key={(item._id || index) + "-label"}
                x={index * 50 + 20}
                y={190}
                fontSize="10"
                fill="#003366"
                textAnchor="middle"
              >
                {item._id}
              </SvgText>
            ))}
          </Svg>
        </View>
      )}


      {/* Dashboard Tiles */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.tile} onPress={() => router.push("/admin/users")}>
          <FontAwesome name="users" size={28} color="white" />
          <Text style={styles.tileText}>Manage Users</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => router.push("/admin/products")}>
          <MaterialIcons name="inventory" size={28} color="white" />
          <Text style={styles.tileText}>Manage Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => router.push("/admin/distribution")}>
          <MaterialIcons name="event" size={28} color="white" />
          <Text style={styles.tileText}>Distribution Tracking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => router.push("/admin/feedback")}>
          <MaterialIcons name="feedback" size={28} color="white" />
          <Text style={styles.tileText}>Feedback Review</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center"
  },
  emblem: {
    width: 40,
    height: 40,
    marginRight: 10
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003366"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#003366"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  tile: {
    width: "48%",
    backgroundColor: "#1E88E5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3
  },
  tileText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center"
  },
  loginSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20
  },
  loginLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginTop: 4,
    textAlign: "center"
  },
  loginCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E88E5",
    textAlign: "center"
  },
  barWrapper: {
    alignItems: "center",
    marginBottom: 20
  },
  percentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    marginTop: 4
  },
  statCard: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2
  }
});
