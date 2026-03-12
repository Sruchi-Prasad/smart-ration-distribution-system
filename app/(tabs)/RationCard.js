import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function RationCard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to mask ration card number
  const maskRationCard = (cardNumber) => {
    if (!cardNumber) return "Not provided";
    const str = String(cardNumber);
    const visibleDigits = str.slice(-4);
    return "X".repeat(str.length - 4) + visibleDigits;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?._id) {
          setLoading(false);
          return;
        }
        const res = await fetchWithAuth(`${API_BASE}/api/auth/user/${parsedUser._id}`);


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

  if (loading) {
    return <Text style={{ textAlign: "center", marginTop: 20 }}>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Green Ration Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Ration Card</Text>
        {/* Masked ration card number */}
        <Text style={styles.detail}>
          Card Number: {maskRationCard(user?.rationCard)}
        </Text>

        <Text style={styles.detail}>Card Type: {user?.cardType || "BPL (Priority)"}</Text>
        <Text style={styles.detail}>
          Family Members: {Array.isArray(user?.memberDetails) ? user.memberDetails.length : 0}
        </Text>
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>✔ {user?.status || "Active"}</Text>
        </View>
      </View>
      {/* Household Members List */}
      {/*  <View style={styles.section}>
        <Text style={styles.sectionTitle}>Household Members</Text>
        {Array.isArray(user?.memberDetails) &&
          user.memberDetails.map((m, i) => (
            <Text key={i} style={styles.detail}>
              👤 {m.name} • {m.age} yrs
            </Text>
          ))}
      </View>*/}

      {/* Distribution Info */}
      {/*<View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribution Information</Text>
        <Text style={styles.detail}>
          Rice: {user?.balance?.rice || 0}kg, Wheat: {user?.balance?.wheat || 0}kg
        </Text>
        <Text style={styles.detail}>
          Last Distribution:{" "}
          {user?.lastDistribution
            ? new Date(user.lastDistribution).toLocaleDateString()
            : "Not distributed yet"}
        </Text>
      </View>*/}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    alignItems: "center",
    width: "100%",
  },
  card: {
    backgroundColor: "#003366", // Navy Blue
    borderRadius: 20,
    width: "95%",
    maxWidth: 400,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 153, 51, 0.3)", // Subtle Saffron border
    position: "relative",
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FF9933", // Saffron
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 153, 51, 0.5)",
    paddingBottom: 8,
  },
  detail: {
    fontSize: 16,
    color: "#E0E0E0",
    marginBottom: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  statusBox: {
    marginTop: 18,
    backgroundColor: "#FF9933", // Saffron
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
    shadowColor: "#FF9933",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  statusText: {
    color: "#003366", // Navy
    fontWeight: "900",
    fontSize: 14,
    textTransform: "uppercase",
  },
});
