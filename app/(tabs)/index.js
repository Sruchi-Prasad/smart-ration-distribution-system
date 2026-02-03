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

const Index = () => {
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
          <Text style={{ color: "white", fontWeight: "bold" }}>
            NOTIFICATIONS: Next distribution starts on 20 Jan 2026
          </Text>
        </View>


       


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


            <View style={{ width: isMobile ? "100%" : "25%", paddingHorizontal: 10, gap: 16 }}>        {[
              {
                label: "NEXT DISTRIBUTION",
                icon: <Entypo name="calendar" size={24} color="white" />,
                color: "#1E88E5",
              },
              {
                label: "GIVE FEEDBACK",
                icon: <MaterialIcons name="feedback" size={24} color="white" />,
                color: "#F57C00",
              },
              {
                label: "MEMBERS Detail",
                icon: <FontAwesome5 name="users" size={24} color="white" />,
                color: "#00796B",
              },
              {
                label: "PRODUCT DETAIL",
                icon: (
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={24}
                    color="white"
                  />
                ),
                color: "#388E3C",
              },
            ].map((item, index) => (
              <Pressable
                key={index}
                style={[
                  styles.portalButton,
                  {
                    backgroundColor: item.color,
                    alignSelf: isMobile ? "stretch" : "center",
                  },
                ]}
                onPress={() => {
                  if (item.label === "PRODUCT DETAIL") router.push("/productDetail");
                  if (item.label === "NEXT DISTRIBUTION") router.push("/distribution");
                  if (item.label === "MEMBERS Detail") router.push("/members");
                  if (item.label === "GIVE FEEDBACK") router.push("/feedback");
                }}
              >
                <View style={styles.portalIcon}>{item.icon}</View>
                <Text style={styles.portalText}>{item.label}</Text>
              </Pressable>
            ))}
            </View>

    
            <View style={{ width: isMobile ? "100%" : "45%", paddingHorizontal: 10}}>     <Text style={styles.galleryTitle}>
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

            <View style={{ width: isMobile ? "100%" : "25%", paddingHorizontal: 10, gap: 16 }}>
              <View style={{ flexDirection: "column", gap: 16, width: "100%" }}>
                <Pressable style={styles.card1} onPress={() => router.push("/kyc")}>
                  <View style={styles.iconCircle}>
                    <FontAwesome name="id-card" size={28} color="black" />
                  </View>
                  <Text style={styles.label}>KYC Detail</Text>
                </Pressable>

                <Pressable style={styles.card1} onPress={() => router.push("/card")}>
                  <View style={styles.iconCircle}>
                    <FontAwesome name="id-card" size={28} color="black" />
                  </View>
                  <Text style={styles.label}>Card Detail</Text>
                </Pressable>

                <Pressable style={styles.card1} onPress={()=>router.push("/report")}>
                  <View style={styles.iconCircle}>
                    <MaterialIcons name="report" size={28} color="black" />
                  </View>
                  <Text style={styles.label}>Report Issue</Text>
                </Pressable>

                <Pressable style={styles.card1}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="qrcode" size={28} color="black" />
                  </View>
                  <Text style={styles.label}>QR Code</Text>
                </Pressable>
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
    maxWidth: 600,
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
    fontSize: 14,
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
    backgroundColor: "#C5E1A5", // muted institutional green
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
  }

});
