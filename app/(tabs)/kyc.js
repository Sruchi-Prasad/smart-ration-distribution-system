import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function KYC() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      <Text style={styles.pageTitle}>KYC Details</Text>

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.row}>
          <FontAwesome name="user" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.name}>{user?.fullName || "Guest"}</Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="calendar-today" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>
            {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"}
          </Text>
        </View>
        <View style={styles.row}>
          <FontAwesome name="envelope" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.email}>{user?.email || "Not provided"}</Text>
        </View>
        <View style={styles.row}>
          <FontAwesome name="phone" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.detail}>Phone: {user?.phone || "Not provided"}</Text>
        </View>
      </View>

      {/* Document Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Information</Text>
        <View style={styles.row}>
          <FontAwesome name="id-card" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.detail}>Ration Card: {user?.rationCard || "Not provided"}</Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="credit-card" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.label}>Aadhaar Number:</Text>
          <Text style={styles.value}>{user?.aadhaarNumber || "Not provided"}</Text>
        </View>
      </View>

      {/* Household Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Household Information</Text>
        <View style={styles.row}>
          <FontAwesome name="users" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.detail}>Members: {user?.members || "Not provided"}</Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="home" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.detail}>
            Location: {user?.city || "Not provided"}, {user?.country || "Not provided"}
          </Text>
        </View>
      </View>

      {/* Distribution Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribution Information</Text>
        <View style={styles.row}>
          <MaterialIcons name="inventory" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.label}>Balance:</Text>
          <Text style={styles.value}>
            Rice: {user?.balance?.rice || 0}kg, Wheat: {user?.balance?.wheat || 0}kg
          </Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="event" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.label}>Last Distribution:</Text>
          <Text style={styles.value}>
            {user?.lastDistribution
              ? new Date(user.lastDistribution).toLocaleDateString()
              : "Not distributed yet"}
          </Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="check-circle" size={22} color="#4CAF50" style={styles.icon} />
          <Text style={styles.label}>Eligibility:</Text>
          <Text style={styles.value}>
            {user?.balance?.rice > 0 || user?.balance?.wheat > 0
              ? "Eligible for distribution ✅"
              : "Not eligible"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f5f5" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 16, fontWeight: "bold", color: "#003366" },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366", marginBottom: 20, textAlign: "center" },
  section: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 20, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#003366", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { marginRight: 8 },
  label: { fontSize: 16, fontWeight: "bold", color: "#003366", marginRight: 6 },
  value: { fontSize: 16, color: "#333" },
  name: { fontSize: 16, fontWeight: "600", color: "#222" },
  email: { fontSize: 16, color: "#333" },
  detail: { fontSize: 16, color: "#333" },
});
