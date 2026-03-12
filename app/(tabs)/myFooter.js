import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: "Home", icon: (active) => <MaterialIcons name="home" size={26} color={active ? "white" : "#003366"} />, route: "/" },
    { label: "Market", icon: (active) => <MaterialIcons name="shopping-bag" size={22} color={active ? "white" : "#003366"} />, route: "/Marketplace" },
    { label: "Members", icon: (active) => <FontAwesome name="users" size={22} color={active ? "white" : "#003366"} />, route: "/members" },
    { label: "Feedback", icon: (active) => <MaterialIcons name="feedback" size={22} color={active ? "white" : "#003366"} />, route: "/feedback" },
  ];

  return (
    <View style={styles.footer}>
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => router.push(tab.route)}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIcon]}>
              {tab.icon(isActive)}
            </View>
            <Text style={[styles.tabText, isActive && styles.activeText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,

    /* ❌ removed absolute positioning */
    /* position: "absolute",
       bottom: 0,
       left: 0,
       right: 0, */

    marginTop: 20, // ✅ gives spacing from content
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  tab: {
    alignItems: "center",
    flex: 1,
  },

  iconWrapper: {
    padding: 6,
    borderRadius: 20,
  },

  activeIcon: {
    backgroundColor: "#FFD700",
  },

  tabText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },

  activeText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
