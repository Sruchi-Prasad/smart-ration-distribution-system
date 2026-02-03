import { useRouter } from "expo-router";
import { useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const RightSidePopup = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  // Start off-screen to the right
  const screenWidth = Dimensions.get("window").width;
  const slideAnim = useState(new Animated.Value(screenWidth))[0];

  const togglePopup = () => {
    Animated.timing(slideAnim, {
      toValue: visible ? screenWidth : screenWidth - 220, // Slide in/out
      duration: 300,
      useNativeDriver: false,
    }).start(() => setVisible(!visible));
  };

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <Pressable style={styles.toggleButton} onPress={togglePopup}>
        <Text style={styles.toggleText}>{visible ? "Close" : "Open"} Menu</Text>
      </Pressable>

      {/* Popup Box */}
      <Animated.View style={[styles.popup, { left: slideAnim }]}>
        <Pressable onPress={() => router.push("/profile")}>
          <Text style={styles.menuItem}>Profile</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/settings")}>
          <Text style={styles.menuItem}>Settings</Text>
        </Pressable>
        <Pressable onPress={togglePopup}>
          <Text style={styles.menuItem}>Logout</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default RightSidePopup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 40,
    paddingLeft: 20,
    backgroundColor: "#f0f0f0", // Optional: light background
  },
  toggleButton: {
    backgroundColor: "#030356",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  toggleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  popup: {
    position: "absolute",
    top: 80,
    width: 200,
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: {
    color: "white",
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
});
