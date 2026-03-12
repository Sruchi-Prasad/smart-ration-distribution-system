import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PopupProfile({ user, slideAnim, handleLogout, handleClose }) {
  return (
    <Animated.View style={[styles.popup, { transform: [{ translateX: slideAnim }] }]}>
      {/* Header row with user icon and close button */}
      <View style={styles.headerRow}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <FontAwesome name="user" size={20} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            {user ? (
              <>
                <Text style={styles.name} numberOfLines={1}>{user.fullName}</Text>
                <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
              </>
            ) : (
              <Text style={styles.name}>Guest User</Text>
            )}
          </View>
        </View>

        <TouchableOpacity onPress={handleClose}>
          <MaterialIcons name="close" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Sync status */}
      <View style={styles.syncRow}>
        <MaterialIcons name="cloud-done" size={18} color="#128807" />
        <Text style={styles.syncText}>Secure Sync Enabled</Text>
      </View>

      <View style={styles.divider} />

      {/* Logout option */}
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.optionText}>Log Out Account</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    top: 80,
    right: 20,
    width: 300,
    backgroundColor: "white",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  profileRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  name: { fontSize: 18, fontWeight: "900", color: "#003366" },
  email: { fontSize: 13, color: "#666", fontWeight: "600", marginTop: 2 },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#F0F9F0",
    padding: 10,
    borderRadius: 12,
  },
  syncText: { marginLeft: 8, fontSize: 13, color: "#128807", fontWeight: "800", textTransform: "uppercase" },
  optionText: {
    fontSize: 14,
    color: "#D32F2F",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F4F8",
    marginBottom: 20,
  }
});
