import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function IncompleteKYCCard({ households }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>📋 Incomplete KYC</Text>
      {households.map(h => (
        <View key={h.id} style={styles.householdCard}>
          <Text style={styles.householdName}>{h.name}</Text>

          {/* Show all statuses if needed */}
          {h.statuses?.map((status, index) => (
            <Text key={index}>Status: {status}</Text>
          ))}

          {/* Single KYC button per household */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>KYC DOCUMENT</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontWeight: "bold", marginBottom: 8, color: "#003366" },
  householdCard: { marginBottom: 12 },
  button: { marginTop: 8, backgroundColor: "#003366", padding: 8, borderRadius: 6, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
