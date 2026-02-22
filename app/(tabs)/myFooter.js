import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: "Home", icon: <MaterialIcons name="home" size={24} />, route: "/" },
    { label: "Members", icon: <FontAwesome name="users" size={22} />, route: "/members" },
    { label: "Report", icon: <MaterialIcons name="report-problem" size={22} />, route: "/report" },
    { label: "Feedback", icon: <MaterialIcons name="feedback" size={22} />, route: "/feedback" },
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
              {tab.icon}
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
