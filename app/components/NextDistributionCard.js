import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NextDistributionCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle1}>📅 Next Distribution</Text>
      <Text style={styles.sectionTitle}>24 Apr 3024</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>START DISTRIBUTION</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#003366", padding: 16, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontWeight: "bold", marginBottom: 8, color: "#fff" },
  button: { marginTop: 10, backgroundColor: "#fff", padding: 10, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#003366", fontWeight: "bold" },
  sectionTitle1: { fontWeight: "bold", marginBottom: 10, color: "#fff" },

});
