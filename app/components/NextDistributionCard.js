import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NextDistributionCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>📅 Next Distribution</Text>
      <Text>24 Apr 3024</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>START DISTRIBUTION</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontWeight: "bold", marginBottom: 8, color: "#003366" },
  button: { marginTop: 10, backgroundColor: "#003366", padding: 10, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
