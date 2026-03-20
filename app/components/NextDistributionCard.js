import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NextDistributionCard({ nextDate }) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle1}>📅 Next Distribution</Text>
      <Text style={styles.sectionTitle}>{nextDate || "Fetching..."}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/shopkeeper/DistributionForm")}
      >
        <Text style={styles.buttonText}>START DISTRIBUTION</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#003366",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#003366",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    borderBottomWidth: 6,
    borderBottomColor: "#FF9933",
  },
  sectionTitle1: {
    fontWeight: "900",
    marginBottom: 10,
    color: "#E0E0E0",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 12,
  },
  sectionTitle: {
    fontWeight: "900",
    marginBottom: 24,
    color: "#fff",
    fontSize: 26,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: "#FF9933",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 14,
  },
});
