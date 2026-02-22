import { Entypo, FontAwesome5 } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import {
  Animated, Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import RationCard from "../(tabs)/RationCard";


const Index = () => {

  const [expandedSections, setExpandedSections] = useState([]);
  const DropdownSection = ({ title, sectionKey, items, expandedSections, setExpandedSections }) => {
    const isExpanded = expandedSections.includes(sectionKey);

    const toggleSection = () => {
      if (isExpanded) {
        setExpandedSections(expandedSections.filter(key => key !== sectionKey));
      } else {
        setExpandedSections([...expandedSections, sectionKey]);
      }
    };

    return (
      <View style={{ marginBottom: 16 }}>
        <TouchableOpacity
          onPress={toggleSection}
          style={{
            backgroundColor: "#003366",
            padding: 12,
            borderRadius: 8,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>{title}</Text>
          <Entypo name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="white" />
        </TouchableOpacity>

        {isExpanded && (
          <View style={{ marginTop: 10 }}>
            {items.map((item, index) => (
              <Pressable
                key={index}
                style={[styles.portalButton, { backgroundColor: item.color }]}
                onPress={() => router.push(item.route)}
              >
                <View style={styles.portalIcon}>{item.icon}</View>
                <Text style={styles.portalText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };


  const router = useRouter();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // slideshow images
  const pdsImages = [
    {
      source: require("../../assets/images/distributionCenter.jpg"),
      caption: "Grain distribution at ration shop",
    },
    {
      source: require("../../assets/images/newCard.jpg"),
      caption: "Ration shop counter operations",
    },
  ];

  const notifications = [
    "Next distribution starts on 20 Jan 2026  ",
    "New ration policy update released  ",
    "KYC verification deadline: 25 Jan 2026  ",
    "Rice stock available from tomorrow",
  ];

  const tickerText = notifications.join("   ✦   ") + "   ✦   ";
  const scrollX = useState(new Animated.Value(0))[0];

  // load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Redirect based on role
        {/* if (parsedUser.role === "shopkeeper") {
        router.replace("/shopkeeper/ShopPanel");
      } else if (parsedUser.role === "user") {
        router.replace("/");
      }*/}
      }
    };
    loadUser();
  }, []);

  // slideshow auto-advance
  useEffect(() => {
    if (!pdsImages || pdsImages.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % pdsImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [pdsImages]);

  // popup animation
  const screenWidth = Dimensions.get("window").width;
  const slideAnim = useState(new Animated.Value(screenWidth))[0];

  const togglePopup = () => {
    const toValue = visible ? screenWidth : 0; // slide out if visible, slide in if not
    setVisible(!visible); // flip state immediately
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  // return JSX here...
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      setShowMenu(false);
      setVisible(false);
      router.replace("/(tabs)/login");
    }
    catch (error) {
      console.error("Logout failed:", error);
    }
  };

 useEffect(() => {
  const screenWidth = Dimensions.get("window").width;

  Animated.loop(
    Animated.sequence([
      Animated.timing(scrollX, {
        toValue: -screenWidth,
        duration: 12000,
        useNativeDriver: true,
      }),
      Animated.timing(scrollX, {
        toValue: screenWidth,
        duration: 0,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

  return (

    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{
          width: "100%",              // ✅ full width
          maxWidth: 1400,             // ✅ limit max width on large screens
          marginHorizontal: "auto",   // ✅ center align
          minHeight: "100vh",         // ✅ full screen height
          paddingHorizontal: 16,      // ✅ optional side padding
        }}
      >

        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("../../assets/images/emblem.png")}
              style={{ width: 40, height: 40, marginRight: 10 }}
            />
            <Text style={[styles.title, { fontSize: isMobile ? 16 : 24 }]}>
              SMART RATION DISTRIBUTION SYSTEM
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable style={styles.iconGroup} onPress={() => router.push("/")}>
              <Entypo name="home" size={24} color="black" />
              <Text style={styles.iconLabel}>HOME</Text>
            </Pressable>
            <Pressable style={styles.toggleButton} onPress={togglePopup}>
              <FontAwesome name="user-circle-o" size={20} color="white" />
              <Text style={styles.toggleText}>
                {visible ? "Close" : "Open"} User
              </Text>
            </Pressable>
            <Pressable
              style={styles.iconGroup}
              onPress={() => router.push("/(tabs)/login")}
            >
              <Entypo name="login" size={24} color="black" />
              <Text style={styles.iconLabel}>LOGIN</Text>
            </Pressable>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              style={styles.iconGroup}
            >
              <Entypo name="dots-three-horizontal" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.banner}>
          <Entypo name="bell" size={20} color="white" style={{ marginRight: 8 }} />

          <View style={{ flex: 1, overflow: "hidden" }}>
            <Animated.View
              style={{
                flexDirection: "row",
                transform: [{ translateX: scrollX }],
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginRight: 60,
                  whiteSpace: "nowrap",   // ⭐ MOST IMPORTANT FIX
                }}
              >
                {tickerText}
              </Text>

              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginRight: 60,
                  whiteSpace: "nowrap",
                }}
              >
                {tickerText}
              </Text>
            </Animated.View>
          </View>
        </View>

        <RationCard />

        <View style={styles.mainContainer}>

          <View style={{
            width: "100%",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            flexWrap: "nowrap",
            paddingHorizontal: 16,
            gap: 24,
            minHeight: "100vh",
          }} >
            <View style={{ width: isMobile ? "100%" : "28%", paddingHorizontal: 10 }}>
              <View style={{ flexDirection: "column", gap: 20, marginVertical: 20 }}>
                <DropdownSection
                  title="Your Ration Info"
                  sectionKey="info"
                  expandedSections={expandedSections}
                  setExpandedSections={setExpandedSections}
                  items={[
                    { label: "RATION BALANCE", icon: <MaterialCommunityIcons name="scale-balance" size={24} color="white" />, color: "#6A1B9A", route: "/balance" },
                    { label: "DISTRIBUTION HISTORY", icon: <MaterialIcons name="history" size={24} color="white" />, color: "#0288D1", route: "/history" },
                  ]}
                />

                <DropdownSection
                  title="Actions & Requests"
                  sectionKey="actions"
                  expandedSections={expandedSections}
                  setExpandedSections={setExpandedSections}
                  items={[
                    { label: "GIVE FEEDBACK", icon: <MaterialIcons name="feedback" size={24} color="white" />, color: "#F57C00", route: "/feedback" },
                    { label: "KYC DETAIL", icon: <FontAwesome name="id-card" size={24} color="white" />, color: "#00796B", route: "/kyc" },
                  ]}
                />

                <DropdownSection
                  title="Household & Products"
                  sectionKey="household"
                  expandedSections={expandedSections}
                  setExpandedSections={setExpandedSections}
                  items={[
                    { label: "MEMBERS DETAIL", icon: <FontAwesome5 name="users" size={24} color="white" />, color: "#1E88E5", route: "/members" },
                    { label: "PRODUCT DETAIL", icon: <MaterialCommunityIcons name="package-variant" size={24} color="white" />, color: "#388E3C", route: "/productDetail" },
                    { label: "ANNOUNCEMENTS", icon: <Entypo name="megaphone" size={24} color="white" />, color: "#C2185B", route: "/announcements" },
                  ]}
                />

                <DropdownSection
                  title="Profile & Tools"
                  sectionKey="tools"
                  expandedSections={expandedSections}
                  setExpandedSections={setExpandedSections}
                  items={[
                    { label: "CARD DETAIL", icon: <FontAwesome name="id-card" size={24} color="white" />, color: "#388E3C", route: "/card" },
                    { label: "REPORT ISSUE", icon: <MaterialIcons name="report" size={24} color="white" />, color: "#C2185B", route: "/report" },
                    { label: "QR CODE", icon: <MaterialCommunityIcons name="qrcode" size={24} color="white" />, color: "#6A1B9A", route: "/qr" },
                  ]}
                />
              </View>

            </View>

            <View style={{ width: isMobile ? "100%" : "42%", paddingHorizontal: 10 }}>
              <Text style={styles.galleryTitle}>
                Public Distribution System (PDS) Scenes
              </Text>
              <View style={styles.imageCard}>
                <Image
                  source={pdsImages[currentIndex].source}
                  style={[styles.galleryImage, { height: isMobile ? 220 : 360 }]}
                />
                <Text style={styles.imageCaption}>
                  {pdsImages[currentIndex].caption}
                </Text>
              </View>
            </View>
            <View style={{ width: isMobile ? "100%" : "28%", paddingHorizontal: 10, gap: 16 }}>
              {/* Digital Ration Card */}
              <View style={styles.card1}>
                <Text style={styles.optionText}>Digital Ration Card</Text>
                <Text style={styles.detailText}>Household ID: MH-2026-00123</Text>
                <Text style={styles.detailText}>Members: 4</Text>
                <Text style={styles.detailText}>Valid Till: Dec 2026</Text>
                <View style={{ marginTop: 10, alignItems: "center" }}>
                  <MaterialCommunityIcons name="qrcode" size={48} color="#003366" />
                </View>
              </View>

              {/* Distribution Timeline */}
              <View style={styles.card1}>
                <Text style={styles.optionText}>Distribution Timeline</Text>
                <Text style={styles.detailText}>Last Pickup: 15 Jan 2026</Text>
                <Text style={styles.detailText}>Next Pickup: 20 Jan 2026</Text>
                <Text style={styles.detailText}>Missed: None</Text>
              </View>

              {/* Support & Help */}
              <View style={styles.card1}>
                <Text style={styles.optionText}>Need Help?</Text>
                <Text style={styles.detailText}>📞 Call: 1800-XYZ-RATION</Text>
                <Text style={styles.detailText}>📧 Email: support@ration.gov.in</Text>
                <TouchableOpacity style={{ marginTop: 10 }}>
                  <Text style={{ color: "#00796B", fontWeight: "600" }}>Raise a Ticket →</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>


        {visible && (
          <Animated.View style={[styles.popup, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.profileRow}>
              <FontAwesome name="user" size={24} color="white" style={{ marginRight: 10 }} />
              <Pressable onPress={() => router.push("/profile")}>
                <View>
                  {user ? (
                    <>
                      <Text style={styles.name}>{user.name}</Text>
                      <Text style={styles.email}>{user.email}</Text>
                    </>
                  ) : (
                    <Text style={styles.name}>Guest</Text>
                  )}

                </View>
              </Pressable>
            </View>

            <View style={styles.syncRow}>
              <MaterialIcons name="sync" size={20} color="#4CAF50" />
              <Text style={styles.syncText}>Sync is on</Text>
            </View>

            <View style={styles.divider} />

            <Pressable style={styles.option}>
              <Text style={styles.optionText}>Set up new personal profile</Text>
            </Pressable>
            <Pressable style={styles.option}>
              <Text style={styles.optionText}>Other profiles</Text>
            </Pressable>
            <Pressable onPress={handleLogout}>
              <Text style={styles.optionText}>Logout</Text>
            </Pressable>
          </Animated.View>
        )}
        {showMenu && (
          <View style={styles.dropdown}>
            <Pressable onPress={() => router.push("/profile")}>
              <Text style={styles.menuItem}>Profile</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/settings")}>
              <Text style={styles.menuItem}>Settings</Text>
            </Pressable>
            <Pressable onPress={handleLogout}>
              <Text style={styles.menuItem}>Logout</Text>
            </Pressable>
          </View>
        )}


      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#003366",
  },
  iconGroup: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  iconLabel: {
    fontSize: 12,
    color: "#333",
  },
  container: {
    flex: 1,
    padding: 16,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    flexWrap: "wrap",
    position: "relative",
  },



  imageCard: {
    width: "100%",
    maxWidth: 700,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  galleryImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    resizeMode: "cover",
  },

  galleryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 10,
    textAlign: "center",
  },

  imageCaption: {
    padding: 6,
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  }

  ,
  portalButton: {
    width: "100%",
    maxWidth: 300,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    elevation: 3,
    marginBottom: 16,
  },
  portalIcon: {
    marginRight: 12,
  }
  ,

  portalText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  }
  ,
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  grid: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#E0E0E0", // neutral gray
    borderRadius: 6,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  card1: {
    width: "100%",
    backgroundColor: "#ea8d0b", // muted institutional green
    borderRadius: 6,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#003366",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  dropdown: {
    position: "absolute",
    top: 58,
    right: 10, // anchor to right instead of fixed left
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 6,
    paddingVertical: 5,
    minWidth: 120,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mainContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "column",
    gap: 20,
    marginVertical: 20,

  }
  ,
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    color: "#003366",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  menuItem: {
    padding: 10,
    fontSize: 16,
    color: "#003366",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  toggleButton: {
    backgroundColor: "#003366", // navy
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  toggleText: {
    color: "white",
    fontSize: 14,
  },
  popup: {
    position: "absolute",
    top: 80,
    right: 10,
    width: 330,
    backgroundColor: "#003366",
    padding: 14,
    borderRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  popupItem: {
    color: "white",
    fontSize: 14,
    paddingVertical: 6,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },

  email: {
    fontSize: 14,
    color: "#cfd8dc",
  },

  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  syncText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#ffffff",
    opacity: 0.3,
    marginVertical: 10,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },

  optionText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "400",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003366",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#003366",
    marginBottom: 8,
    marginTop: 12,
  },

});