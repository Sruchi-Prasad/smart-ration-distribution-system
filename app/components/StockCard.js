// components/StockCard.js
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function StockCard({ stock }) {
  const handleRefill = async () => {
    try {
      const items = Object.keys(stock).filter(item => stock[item] < 50); // Request refill for items below 50
      if (items.length === 0) {
        alert("Stock levels are sufficient. No refill needed.");
        return;
      }

      const response = await fetchWithAuth(`${API_BASE}/api/shopkeeper/request-refill`, {
        method: "POST",
        body: JSON.stringify({ items })
      });

      if (response.ok) {
        alert("✅ Refill Request Sent Successfully!");
      } else {
        const errorData = await response.json();
        alert(`❌ Failed: ${errorData.message || errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Error sending refill request");
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>📦 Current Stock</Text>
      {Object.keys(stock).map((item, index) => (
        <View key={index} style={styles.itemWrapper}>
          <Text style={styles.itemLabel}>{item}: {stock[item]} {item === "oil" ? "litre" : "kg"}</Text>
          <Progress.Bar
            progress={stock[item] ? stock[item] / 100 : 0}
            width={null}
            color="#FF9933"
            unfilledColor="#F0F4F8"
            borderWidth={0}
            height={8}
            borderRadius={4}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleRefill}>
        <Text style={styles.buttonText}>Request Refill</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    borderLeftWidth: 6,
    borderLeftColor: "#FF9933",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#003366",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  itemWrapper: { marginBottom: 16 },
  itemLabel: {
    fontSize: 14,
    color: "#003366",
    marginBottom: 6,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  button: {
    marginTop: 20,
    backgroundColor: "#003366",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#003366",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1
  },
});
