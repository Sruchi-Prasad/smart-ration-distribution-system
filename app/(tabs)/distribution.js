import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NextDistribution() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Entypo name="calendar" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.bannerText}>📅 Next Distribution: 20 Jan 2026</Text>
      </View>

      {/* Distribution Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribution Details</Text>
        <Text style={styles.detail}>Rice: 35kg</Text>
        <Text style={styles.detail}>Wheat: 35kg</Text>
        <Text style={styles.detail}>Sugar: 5kg</Text>
        <Text style={styles.detail}>Oil: 2L</Text>
        <Text style={styles.eligibility}>✅ Eligible</Text>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.detail}>Pickup Location: Mulund Ration Shop #12</Text>
        <Text style={styles.detail}>Timing: 9 AM – 5 PM</Text>
        <Text style={styles.detail}>Documents Required: Ration Card, Aadhaar</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/history")}>
          <MaterialIcons name="history" size={20} color="white" />
          <Text style={styles.buttonText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/feedback")}>
          <MaterialIcons name="feedback" size={20} color="white" />
          <Text style={styles.buttonText}>Give Feedback</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/report")}>
          <FontAwesome name="exclamation-circle" size={20} color="white" />
          <Text style={styles.buttonText}>Report Issue</Text>
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
  section: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#003366", marginBottom: 10 },
  detail: { fontSize: 14, color: "#333", marginBottom: 6 },
  eligibility: { fontSize: 14, fontWeight: "bold", color: "#4CAF50", marginTop: 8 },
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
