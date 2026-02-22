import { StyleSheet, Text, View } from "react-native";

export default function AlertsCard({ logs }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>⚠️ Alerts</Text>
      <Text>Wheat below 20kg</Text>
      <Text style={{ marginTop: 10 }}>📜 History</Text>
      {logs.map(log => (
        <Text key={log.id}>{log.date} - {log.action}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 16, marginBottom: 20 },
  sectionTitle: { fontWeight: "bold", marginBottom: 8, color: "#003366" },
});
