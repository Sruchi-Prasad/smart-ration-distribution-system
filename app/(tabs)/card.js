import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CardDetailPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      let token = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      console.log("Token being sent:", token);

      if (!storedUser || !token) {
        console.warn("No stored user or token found");
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      console.log("Parsed user ID:", parsedUser._id);

      const API_URL = "http://localhost:8000";
      let res = await fetch(`${API_URL}/api/auth/user/${parsedUser._id}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      // 🔄 If token expired, try refresh
      if (res.status === 401 && refreshToken) {
        console.warn("Access token expired, trying refresh...");
        const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          token = refreshData.accessToken;
          await AsyncStorage.setItem("accessToken", token);
          await AsyncStorage.setItem("refreshToken", refreshData.refreshToken);

          // Retry original request
          res = await fetch(`${API_URL}/api/auth/user/${parsedUser._id}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
        } else {
          console.error("Refresh failed, logging out");
          setLoading(false);
          return;
        }
      }

      if (res.ok) {
        const data = await res.json();
        console.log("Fetched user data:", data);
        setUser(data);
      } else {
        console.error("Failed to fetch user:", res.status);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);


  if (loading) return <Text>Loading...</Text>;

  const card = {
    status: user?.status,
    issueDate: user?.issueDate,
    expiryDate: user?.expiryDate,
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      {/* Banner */}
      <View
        style={[
          styles.banner,
          { backgroundColor: card.status === "Active" ? "#4CAF50" : "#F44336" },
        ]}
      >
        <Text style={styles.bannerText}>
          {card.status === "Active" ? "✅ Active Ration Card" : "❌ Expired Ration Card"}
        </Text>
      </View>

      {/* Card Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Information</Text>
        <Text style={styles.detail}>Cardholder: {user?.fullName || "Name not available"}</Text>
        <Text style={styles.detail}>Ration Card No: {user?.rationCard || "Not provided"}</Text>
        <Text style={styles.detail}>
          Aadhaar: {user?.aadhaarNumber
            ? user.aadhaarNumber.replace(/^(\d{4})\d{4}(\d{4})$/, "$1 **** $2")
            : "Not provided"}
        </Text>
        <Text style={styles.detail}>
          Issue Date: {card.issueDate ? new Date(card.issueDate).toLocaleDateString() : "Not available"}
        </Text>
        <Text style={styles.detail}>
          Expiry Date: {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : "Not available"}
        </Text>
        <Text style={styles.detail}>
          Household Members: {user?.members?.length ? user.members.join(", ") : "Not provided"}
        </Text>
      </View>

      {/* Balance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remaining Balance</Text>
        <Text style={styles.detail}>Rice: {user?.balance?.rice || 0} kg</Text>
        <Text style={styles.detail}>Wheat: {user?.balance?.wheat || 0} kg</Text>
        <Text style={styles.detail}>Sugar: {user?.balance?.sugar || 0} kg</Text>
        <Text style={styles.detail}>Oil: {user?.balance?.oil || 0} L</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/update-info")}>
          <MaterialIcons name="edit" size={20} color="white" />
          <Text style={styles.buttonText}>Update Info</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/members")}>
          <FontAwesome name="users" size={20} color="white" />
          <Text style={styles.buttonText}>View Members</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/report")}>
          <MaterialIcons name="report-problem" size={20} color="white" />
          <Text style={styles.buttonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingHorizontal: 20 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  banner: { padding: 12, borderRadius: 8, marginBottom: 20, alignItems: "center", marginHorizontal: 20 },
  bannerText: { color: "white", fontWeight: "600" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#003366", marginBottom: 10 },
  detail: { fontSize: 14, color: "#333", marginBottom: 6 },
  actions: { marginTop: 20, marginHorizontal: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
});
