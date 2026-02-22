import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
        const token = await AsyncStorage.getItem("accessToken");
        if (!storedUser || !token) return;

        const parsedUser = JSON.parse(await AsyncStorage.getItem("user"));

        console.log("Token being sent:", token); // Debug

        const res = await fetch(`http://localhost:8000/api/auth/user/${parsedUser._id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,  // ✅ send token here
          },
        });


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
    flexGrow: 1,
    justifyContent: "flex-start", // don’t force vertical center
    alignItems: "center",         // horizontal center
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  card: {
    backgroundColor: "#e27d09",
    borderRadius: 12,
    padding: 30,
    marginBottom: 20,
    width: "90%",             // optional: control width
    maxWidth: 450,            // optional: prevent too wide on web
  },
  title: { fontSize: 20, fontWeight: "bold", color: "white", marginBottom: 10 },
  detail: { fontSize: 16, color: "white", marginBottom: 6 },
  statusBox: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  statusText: { color: "#e27d09", fontWeight: "bold", fontSize: 14 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#030356" },
  detailText: { fontSize: 16, color: "#222", marginBottom: 4 },
});
