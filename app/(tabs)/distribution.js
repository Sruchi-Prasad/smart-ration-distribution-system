import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

/**
 * NextDistribution Screen
 * Shows eligibility and details for the upcoming distribution.
 */
export default function NextDistribution() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/products`); // FIXED: was /api/product
        if (res.ok) {
          const data = await res.json();
          // Filter products relevant for distribution (some might be admin-only)
          setProducts(data);
        }
      } catch (err) {
        console.error("Fetch products error:", err);
        Alert.alert("Connection Issue", err.message || "Failed to connect to the backend.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Entypo name="calendar" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.bannerText}>📅 Next Distribution: 20 Jan 2026</Text>
      </View>

      {/* Distribution Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eligible Products</Text>
        {loading ? (
          <ActivityIndicator color="#003366" />
        ) : products.length > 0 ? (
          products.map((p, i) => (
            <Text key={i} style={styles.detail}>
              {p.name}: {p.minStock || "Standard"} {p.unit || "kg"}
            </Text>
          ))
        ) : (
          <Text style={styles.detail}>No products currently assigned.</Text>
        )}
        <Text style={styles.eligibility}>✅ Eligible for current period</Text>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.detail}>Pickup Location: Assigned Ration Shop</Text>
        <Text style={styles.detail}>Timing: 9 AM – 5 PM</Text>
        <Text style={styles.detail}>Documents Required: Ration Card, Aadhaar</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/history")}>
          <MaterialIcons name="history" size={20} color="white" />
          <Text style={styles.buttonText}>View Transaction Log</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/feedback")}>
          <MaterialIcons name="feedback" size={20} color="white" />
          <Text style={styles.buttonText}>Give Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/report")}>
          <FontAwesome name="exclamation-circle" size={20} color="white" />
          <Text style={styles.buttonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  bannerText: { color: "white", fontWeight: "600" },
  section: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#003366", marginBottom: 10 },
  detail: { fontSize: 14, color: "#333", marginBottom: 6 },
  eligibility: { fontSize: 14, fontWeight: "bold", color: "#4CAF50", marginTop: 8 },
  actions: { marginTop: 20 },
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
