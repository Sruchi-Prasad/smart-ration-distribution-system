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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { width: 40, height: 40, marginRight: 10 },
  title: { fontWeight: "bold", color: "#003366", fontSize: 18 },
  iconGroup: { flexDirection: "row", alignItems: "center", marginHorizontal: 8 },
  iconLabel: { marginLeft: 4, fontSize: 12, fontWeight: "600", color: "black" },
  toggleButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#003366", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  toggleText: { color: "white", marginLeft: 6, fontWeight: "600" },
});
