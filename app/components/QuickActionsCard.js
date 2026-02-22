import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QuickActionsCard() {
  const router = useRouter();

  const actions = [
    { label: "KYC DETAIL", route: "/kyc" },
    { label: "CARD DETAIL", route: "/card" },
    { label: "REPORT ISSUE", route: "/report" },
    { label: "QR CODE", route: "/qrcode" },
    { label: "MEMBERS DETAIL", route: "/(tabs)/members" },
    { label: "MANAGE PRODUCTS", route: "/admin/manageProduct"}                     

  ];

  return (
    <View style={styles.verticalSidebar}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickButton}
          onPress={() => router.push(action.route)} // ✅ navigate on press
        >
          <Text style={styles.quickText}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  verticalSidebar: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
    marginBottom: 20,
  },
  quickButton: {
    backgroundColor: "#C8E6C9",
    padding: 30,
    borderRadius: 6,
    margin: 6,
  },
  quickText: {
    color: "#003366",
    fontWeight: "600",
    textAlign: "center", // ✅ center text properly
  },
});
