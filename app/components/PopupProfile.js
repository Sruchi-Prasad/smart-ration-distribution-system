import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PopupProfile({ user, slideAnim, handleLogout, handleClose }) {
  return (
    <Animated.View style={[styles.popup, { transform: [{ translateX: slideAnim }] }]}>
      {/* Header row with user icon and close button */}
      <View style={styles.headerRow}>
        <View style={styles.profileRow}>
          <FontAwesome name="user" size={24} color="white" style={{ marginRight: 10 }} />
          <Pressable onPress={() => console.log("Profile pressed")}>
            <View>
              {user ? (
                <>
                  <Text style={styles.name}>{user.fullName}</Text>
                  <Text style={styles.email}>{user.email}</Text>
                </>
              ) : (
                <Text style={styles.name}>Guest</Text>
              )}
            </View>
          </Pressable>
        </View>

        {/* Close button (X icon) */}
        <TouchableOpacity onPress={handleClose}>
          <FontAwesome name="times" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sync status */}
      <View style={styles.syncRow}>
        <MaterialIcons name="sync" size={20} color="#4CAF50" />
        <Text style={styles.syncText}>Sync is on</Text>
      </View>

      {/* Logout option */}
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.optionText}>Logout</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    top: 70,
    right: 10,
    width: 330,
    backgroundColor: "#003366",
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 999, // ensures it's above everything
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  email: { fontSize: 14, color: "#cfd8dc" },
  syncRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  syncText: { marginLeft: 6, fontSize: 14, color: "#4CAF50", fontWeight: "600" },
  optionText: { fontSize: 14, color: "#fff", fontWeight: "400" },
});
