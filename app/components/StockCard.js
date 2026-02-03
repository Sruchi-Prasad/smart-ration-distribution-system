// components/StockCard.js
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";

export default function StockCard({ stock }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📦 Current Stock</Text>
      {Object.keys(stock).map((item, index) => (
        <View key={index}>
          <Text style={styles.item}>{item}: {stock[item]} {item === "oil" ? "litre" : "kg"}</Text>
          <Progress.Bar progress={stock[item] ? stock[item] / 100 : 0} width={null} color="#1E88E5" />
        </View>
      ))}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Request Refill</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#E3F2FD", padding: 16, borderRadius: 10, marginBottom: 20 },
  title: { fontWeight: "bold", color: "#003366", marginBottom: 8 },
  item: { fontSize: 16, color: "#333", marginBottom: 4 },
  button: { marginTop: 12, backgroundColor: "#003366", paddingVertical: 10, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
