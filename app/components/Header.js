import { Entypo, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function MyHeader() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const { user: authUser, logout } = useAuth();
    const [user, setUser] = useState(null);
    const [visible, setVisible] = useState(false);
    const screenWidth = Dimensions.get("window").width;
    const slideAnim = useState(new Animated.Value(screenWidth))[0];

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        };
        loadUser();

        // Listen for potential user changes (optional but good)
        const interval = setInterval(loadUser, 5000);
        return () => clearInterval(interval);
    }, []);

    const togglePopup = () => {
        const toValue = visible ? screenWidth : 0;
        setVisible(!visible);
        Animated.timing(slideAnim, {
            toValue,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const insets = useSafeAreaInsets();

    const handleLogout = async () => {
        await logout();
        setVisible(false);
    };

    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                {/* Left: Logo + Title */}
                <View style={styles.leftHeader}>
                    <Image
                        source={require("../../assets/images/emblem.png")}
                        style={styles.logo}
                    />
                    <Text style={[styles.title, { fontSize: isMobile ? 12 : 18 }]} numberOfLines={1}>
                        {isMobile ? "SMART RATION" : "SMART RATION DISTRIBUTION SYSTEM"}
                    </Text>
                </View>

                {/* Right: Buttons */}
                <View style={[styles.rightHeader, { gap: isMobile ? 8 : 16 }]}>
                    <Pressable style={styles.iconGroup} onPress={() => router.push("/")}>
                        <Entypo name="home" size={22} color="black" />
                        {!isMobile && <Text style={styles.iconLabel}>HOME</Text>}
                    </Pressable>

                    <Pressable style={styles.toggleButton} onPress={togglePopup}>
                        <FontAwesome name="user-circle-o" size={18} color="white" />
                        {!isMobile && (
                            <Text style={styles.toggleText}>{visible ? "Close" : "Open"} User</Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={styles.iconGroup}
                        onPress={() => router.push("/(tabs)/login")}
                    >
                        <Entypo name="login" size={22} color="black" />
                        {!isMobile && <Text style={styles.iconLabel}>LOGIN</Text>}
                    </Pressable>

                    <Pressable style={styles.iconGroup}>
                        <Entypo name="dots-three-horizontal" size={22} color="black" />
                    </Pressable>
                </View>
            </View>

            {/* Profile Popup */}
            {visible && (
                <View style={styles.popupOverlay}>
                    <Animated.View style={[styles.popup, { transform: [{ translateX: slideAnim }] }]}>
                        <View style={styles.profileRow}>
                            <FontAwesome name="user" size={24} color="white" style={{ marginRight: 10 }} />
                            <Pressable onPress={() => { setVisible(false); router.push("/profile"); }}>
                                <View>
                                    {authUser ? (
                                        <>
                                            <Text style={styles.name}>{authUser.name || authUser.fullName || "User"}</Text>
                                            <Text style={styles.email}>{authUser.email || ""}</Text>
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

                        <Pressable style={styles.option} onPress={() => { setVisible(false); router.push("/profile"); }}>
                            <Text style={styles.optionText}>Profile Settings</Text>
                        </Pressable>
                        <Pressable style={styles.option} onPress={() => { setVisible(false); router.push("/settings"); }}>
                            <Text style={styles.optionText}>Settings</Text>
                        </Pressable>
                        <Pressable onPress={handleLogout} style={styles.option}>
                            <Text style={[styles.optionText, { color: "#ff5252" }]}>Logout</Text>
                        </Pressable>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        zIndex: 1000,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 3,
        borderBottomColor: "#FF9933", // Saffron Accent
    },
    leftHeader: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 1,
    },
    rightHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    logo: {
        width: 42,
        height: 42,
        marginRight: 12,
        resizeMode: "contain",
    },
    title: {
        fontWeight: "900",
        color: "#003366", // Primary Navy
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    iconGroup: {
        alignItems: "center",
    },
    iconLabel: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#003366",
        marginTop: 2,
    },
    toggleButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#003366",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20, // Pill shape
        elevation: 2,
    },
    toggleText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
        marginLeft: 6,
    },
    popupOverlay: {
        position: "absolute",
        top: 70,
        right: 0,
        left: 0,
        height: 2000,
        backgroundColor: "rgba(0,0,0,0.1)",
        zIndex: 9999,
    },
    popup: {
        position: "absolute",
        top: 0,
        right: 16,
        width: 280,
        backgroundColor: "#003366",
        padding: 20,
        borderRadius: 16,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ffffff",
    },
    email: {
        fontSize: 13,
        color: "#cfd8dc",
        marginTop: 2,
    },
    syncRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: 8,
        borderRadius: 8,
    },
    syncText: {
        marginLeft: 8,
        fontSize: 12,
        color: "#4CAF50",
        fontWeight: "700",
    },
    divider: {
        height: 1,
        backgroundColor: "#ffffff",
        opacity: 0.15,
        marginVertical: 12,
    },
    option: {
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    optionText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
});
