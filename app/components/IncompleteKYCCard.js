import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function IncompleteKYCCard({ households }) {
  const router = useRouter();
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>📋 Incomplete KYC</Text>

      {households
        .filter(h =>
          ["Pending", "Rejected"].includes(h.kycStatus) ||
          h.memberDetails?.some(m => ["Pending", "Rejected"].includes(m.kycStatus))
        )
        .map(h => (
          <View key={h._id || h.id} style={styles.householdCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.householdName}>{h.fullName || h.name}</Text>
              <Text style={{ fontSize: 11, color: "#666", fontWeight: "600" }}>
                {h.kycStatus === "Pending" ? "Head: Pending" : h.kycStatus === "Rejected" ? "Head: Rejected" : "Members Pending"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push({ pathname: "/shopkeeper/MemberKYCManager", params: { userId: h._id } })}
            >
              <Text style={styles.buttonText}>Review KYC</Text>
            </TouchableOpacity>
          </View>
        ))}

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#003366",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1.5
  },
  householdCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  householdName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#003366",
    flex: 1,
  },
  button: {
    backgroundColor: "#003366",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 11,
    textTransform: "uppercase",
  },
});
