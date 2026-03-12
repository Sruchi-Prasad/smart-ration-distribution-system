import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QuickActionsCard() {
  const router = useRouter();

  const actions = [
    { label: "KYC Detail", route: "/kyc", icon: "assignment-ind" },
    { label: "Ration Card", route: "/card", icon: "credit-card" },
    { label: "Report Issue", route: "/report", icon: "report-problem" },
    { label: "QR Access", route: "/qrcode", icon: "qr-code-scanner" },
    { label: "Members", route: "/(tabs)/members", icon: "people" },
    { label: "Products", route: "/admin/manageProduct", icon: "inventory" }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shortcuts</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionBtn}
            onPress={() => router.push(action.route)}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name={action.icon} size={24} color="#003366" />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#003366",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1.5
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionBtn: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  actionLabel: {
    color: "#003366",
    fontWeight: "800",
    fontSize: 11,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
