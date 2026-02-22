import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function RationBalancePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <Text style={{ padding: 20 }}>Loading...</Text>;

  // Example quotas (you can adjust based on your backend scheme)
  const quotas = {
    rice: 50, // kg per month
    wheat: 50,
    sugar: 10,
    oil: 5, // liters
  };

  const balanceItems = [
    { key: "rice", label: "Rice", icon: "restaurant", color: "#4CAF50" },
    { key: "wheat", label: "Wheat", icon: "grain", color: "#FFC107" },
    { key: "sugar", label: "Sugar", icon: "icecream", color: "#9C27B0" },
    { key: "oil", label: "Oil", icon: "local-drink", color: "#03A9F4" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>📊 Monthly Ration Balance</Text>

      {balanceItems.map((item) => {
        const remaining = user.balance?.[item.key] || 0;
        const quota = quotas[item.key];
        const consumed = quota - remaining;
        const percent = Math.min((remaining / quota) * 100, 100);

        return (
          <View key={item.key} style={styles.card}>
            <View style={styles.row}>
              <MaterialIcons name={item.icon} size={22} color={item.color} />
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>
                {remaining}/{quota} {item.key === "oil" ? "L" : "kg"}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${percent}%`, backgroundColor: item.color },
                ]}
              />
            </View>

            {/* Consumed Info */}
            <Text style={styles.consumedText}>
              Consumed: {consumed} {item.key === "oil" ? "L" : "kg"}
            </Text>
          </View>
        );
      })}
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
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  label: { flex: 1, marginLeft: 8, fontSize: 15, fontWeight: "600", color: "#333" },
  value: { fontWeight: "bold", color: "#003366" },
  progressBar: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 6,
  },
  progressFill: { height: 10, borderRadius: 5 },
  consumedText: { fontSize: 12, color: "#777", marginTop: 4 },
});
