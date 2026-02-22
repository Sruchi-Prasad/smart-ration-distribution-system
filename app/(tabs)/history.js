import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function DistributionHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);

        // Example: Replace with backend API call
        // const API_URL = "http://localhost:8000";
        // const res = await fetch(`${API_URL}/api/distribution/${parsedUser._id}`);
        // const data = await res.json();
        // setHistory(data.history);

        // Temporary mock data
        setHistory([
          {
            date: "2026-02-01",
            items: { rice: 5, wheat: 3, sugar: 1, oil: 1 },
            status: "Completed",
          },
          {
            date: "2026-01-01",
            items: { rice: 5, wheat: 5, sugar: 2, oil: 1 },
            status: "Completed",
          },
          {
            date: "2025-12-01",
            items: { rice: 4, wheat: 4, sugar: 1, oil: 0 },
            status: "Pending",
          },
        ]);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchHistory();
  }, []);

  if (!history.length) return <Text style={{ padding: 20 }}>No distribution history found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>📜 Distribution History</Text>

      {history.map((entry, index) => (
        <View key={index} style={styles.card}>
          {/* Date + Status */}
          <View style={styles.row}>
            <MaterialIcons name="event" size={20} color="#003366" />
            <Text style={styles.date}>{new Date(entry.date).toLocaleDateString()}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: entry.status === "Completed" ? "#4CAF50" : "#FFC107" },
              ]}
            >
              <Text style={styles.statusText}>{entry.status}</Text>
            </View>
          </View>

          {/* Items */}
          <View style={styles.items}>
            <View style={styles.itemRow}>
              <MaterialIcons name="restaurant" size={18} color="#4CAF50" />
              <Text style={styles.itemText}>Rice: {entry.items.rice} kg</Text>
            </View>
            <View style={styles.itemRow}>
              <MaterialIcons name="grain" size={18} color="#FFC107" />
              <Text style={styles.itemText}>Wheat: {entry.items.wheat} kg</Text>
            </View>
            <View style={styles.itemRow}>
              <MaterialIcons name="icecream" size={18} color="#9C27B0" />
              <Text style={styles.itemText}>Sugar: {entry.items.sugar} kg</Text>
            </View>
            <View style={styles.itemRow}>
              <MaterialIcons name="local-drink" size={18} color="#03A9F4" />
              <Text style={styles.itemText}>Oil: {entry.items.oil} L</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  date: { flex: 1, marginLeft: 8, fontSize: 15, fontWeight: "600", color: "#333" },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: { color: "white", fontWeight: "600", fontSize: 12 },
  items: { marginTop: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  itemText: { marginLeft: 6, fontSize: 14, color: "#555" },
});
