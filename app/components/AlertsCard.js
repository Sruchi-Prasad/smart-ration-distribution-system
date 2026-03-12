import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function AlertsCard({ logs }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="warning" size={20} color="#D32F2F" />
        <Text style={styles.sectionTitle}>Critical Alerts</Text>
      </View>

      <View style={styles.alertItem}>
        <Text style={styles.alertText}>Wheat below 20kg threshold</Text>
      </View>

      <Text style={styles.historyTitle}>System Events</Text>
      {logs.map(log => (
        <View key={log.id} style={styles.logItem}>
          <Text style={styles.logDate}>{log.date}</Text>
          <Text style={styles.logAction}>{log.action}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  sectionTitle: {
    fontWeight: "900",
    color: "#D32F2F",
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  alertItem: {
    backgroundColor: "#FFEBEB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  alertText: { color: "#D32F2F", fontWeight: "700", fontSize: 13 },
  historyTitle: {
    fontWeight: "900",
    color: "#003366",
    marginBottom: 12,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  logItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
  },
  logDate: { fontSize: 11, color: "#999", fontWeight: "700", width: 80 },
  logAction: { fontSize: 12, color: "#444", fontWeight: "600", flex: 1 },
});
