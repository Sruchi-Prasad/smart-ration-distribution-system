import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MembersPage() {
  const router = useRouter();

  // Example static data (replace with backend fetch)
  const members = [
    { name: "Ramesh Kumar", relation: "Head", dob: "1975-06-12", aadhaar: "1234 **** 5678", eligible: true },
    { name: "Sita Devi", relation: "Spouse", dob: "1978-09-20", aadhaar: "2345 **** 6789", eligible: true },
    { name: "Amit Kumar", relation: "Son", dob: "2005-01-15", aadhaar: "3456 **** 7890", eligible: false },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <FontAwesome name="users" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.bannerText}>👪 Household Members</Text>
      </View>

      {/* Member Cards */}
      {members.map((m, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.name}>{m.name}</Text>
          <Text style={styles.detail}>Relation: {m.relation}</Text>
          <Text style={styles.detail}>DOB: {new Date(m.dob).toLocaleDateString()}</Text>
          <Text style={styles.detail}>Aadhaar: {m.aadhaar}</Text>
          <Text style={[styles.eligibility, { color: m.eligible ? "#4CAF50" : "#F44336" }]}>
            {m.eligible ? "✅ Eligible" : "❌ Not Eligible"}
          </Text>
        </View>
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/add-member")}>
          <MaterialIcons name="person-add" size={20} color="white" />
          <Text style={styles.buttonText}>Add Member</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/update-member")}>
          <MaterialIcons name="edit" size={20} color="white" />
          <Text style={styles.buttonText}>Update Member Info</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  bannerText: { color: "white", fontWeight: "600" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 15, elevation: 2 },
  name: { fontSize: 16, fontWeight: "bold", color: "#003366" },
  detail: { fontSize: 14, color: "#333", marginTop: 4 },
  eligibility: { fontSize: 14, fontWeight: "bold", marginTop: 8 },
  actions: { marginTop: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 8 },
});
