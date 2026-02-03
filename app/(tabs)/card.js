import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CardDetailPage() {
  const router = useRouter();

  // Example static data (replace with backend fetch or AsyncStorage)
  const card = {
    holder: "Ramesh Kumar",
    rationCard: "MH123456789",
    aadhaar: "1234 **** 5678",
    issueDate: "2020-01-15",
    expiryDate: "2030-01-15",
    members: 4,
    balance: { rice: 20, wheat: 15, sugar: 5, oil: 2 },
    status: "Active",
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      {/* Banner */}
      <View
        style={[
          styles.banner,
          { backgroundColor: card.status === "Active" ? "#4CAF50" : "#F44336" },
        ]}
      >
        <Text style={styles.bannerText}>
          {card.status === "Active" ? "✅ Active Ration Card" : "❌ Expired Ration Card"}
        </Text>
      </View>

      {/* Card Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Information</Text>
        <Text style={styles.detail}>Cardholder: {card.holder}</Text>
        <Text style={styles.detail}>Ration Card No: {card.rationCard}</Text>
        <Text style={styles.detail}>Aadhaar: {card.aadhaar}</Text>
        <Text style={styles.detail}>
          Issue Date: {card.issueDate ? new Date(card.issueDate).toLocaleDateString() : "Not available"}
        </Text>
        <Text style={styles.detail}>
          Expiry Date: {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : "Not available"}
        </Text>
        <Text style={styles.detail}>Household Members: {card.members}</Text>
      </View>

      {/* Balance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remaining Balance</Text>
        <Text style={styles.detail}>Rice: {card.balance.rice} kg</Text>
        <Text style={styles.detail}>Wheat: {card.balance.wheat} kg</Text>
        <Text style={styles.detail}>Sugar: {card.balance.sugar} kg</Text>
        <Text style={styles.detail}>Oil: {card.balance.oil} L</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/update-info")}>
          <MaterialIcons name="edit" size={20} color="white" />
          <Text style={styles.buttonText}>Update Info</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/members")}>
          <FontAwesome name="users" size={20} color="white" />
          <Text style={styles.buttonText}>View Members</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/report")}>
          <MaterialIcons name="report-problem" size={20} color="white" />
          <Text style={styles.buttonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" }, // ✅ use flex instead of flexGrow
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingHorizontal: 20 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  banner: { padding: 12, borderRadius: 8, marginBottom: 20, alignItems: "center", marginHorizontal: 20 },
  bannerText: { color: "white", fontWeight: "600" },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: "#000", // ✅ shadow for iOS/web
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // ✅ shadow for Android
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#003366", marginBottom: 10 },
  detail: { fontSize: 14, color: "#333", marginBottom: 6 },
  actions: { marginTop: 20, marginHorizontal: 20 },
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
