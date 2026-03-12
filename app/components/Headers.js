// components/Header.js
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Header({ router, togglePopup }) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.logo} />

        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable style={styles.iconGroup} onPress={() => router.push("/")}>
          <Entypo name="home" size={24} color="black" />
          <Text style={styles.iconLabel}>HOME</Text>
        </Pressable>
        <Pressable style={styles.toggleButton} onPress={togglePopup}>
          <FontAwesome name="user-circle-o" size={20} color="white" />
          <Text style={styles.toggleText}>User</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: "#FF9933",
  },
  logo: { width: 36, height: 36, marginRight: 12 },
  title: {
    fontWeight: "900",
    color: "#003366",
    fontSize: 16,
    flex: 1,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  actions: { flexDirection: "row", alignItems: "center" },
  iconGroup: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 12,
  },
  iconLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "800",
    color: "#003366",
    textTransform: "uppercase",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#003366",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  toggleText: { color: "white", marginLeft: 8, fontWeight: "900", fontSize: 13, textTransform: "uppercase" },
});
