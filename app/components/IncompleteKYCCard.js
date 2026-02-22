import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function IncompleteKYCCard({ households }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>📋 Incomplete KYC</Text>

      {households
        .filter(h => h.kycStatus === "incomplete") // only households with incomplete KYC
        .map(h => (
          <View key={h.id} style={styles.householdCard}>
            <Text style={styles.householdName}>{h.name}</Text>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Complete KYC</Text>
            </TouchableOpacity>
          </View>
        ))}

    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#003366", padding: 16, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontWeight: "bold", marginBottom: 10, color: "#fff" },
  householdCard: { marginBottom: 12 },
  button: { marginTop: 8, backgroundColor: "#003366", padding: 8, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#524a4a", fontWeight: "bold" },
});

