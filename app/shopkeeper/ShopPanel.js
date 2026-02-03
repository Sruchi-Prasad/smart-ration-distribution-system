import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";

import AlertsCard from "../components/AlertsCard";
import Headers from "../components/Headers";
import IncompleteKYCCard from "../components/IncompleteKYCCard";
import NextDistributionCard from "../components/NextDistributionCard";
import PopupProfile from "../components/PopupProfile";
import QuickActionsCard from "../components/QuickActionsCard";
import StockCard from "../components/StockCard";


export default function ShopPanel() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isWeb = width > 768;

    const [visible, setVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(true);


    // ✅ States for backend data
    const [stock, setStock] = useState({ rice: 0, wheat: 0, oil: 0, sugar: 0, other: 0 });
    const [households, setHouseholds] = useState([]);
    const [logs, setLogs] = useState([]);

    // ✅ User list states (must be inside component!)
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const screenWidth = Dimensions.get("window").width;
    const slideAnim = useState(new Animated.Value(screenWidth))[0];

    // ... rest of your code unchanged ...


    const togglePopup = () => {
        const toValue = visible ? screenWidth : 0;
        setVisible(!visible);
        Animated.timing(slideAnim, {
            toValue,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("accessToken");
        setUser(null);
        setVisible(false);
        router.replace("/(tabs)/login");
    };

    // ✅ Load logged-in user and fetch panel data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                const token = await AsyncStorage.getItem("accessToken");
                console.log("Stored user:", storedUser);
                console.log("Token being sent:", token);
                if (!storedUser || !token) return;

                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser); // ✅ only the logged-in user
                const role = parsedUser.role;

                const getAuthHeaders = (token) => ({
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                });

                // 🔹 Admin panel
                if (role === "admin") {
                    const resPanel = await fetch("http://localhost:8000/api/admin/panel", {
                        headers: getAuthHeaders(token),
                    });
                    if (resPanel.ok) {
                        const dataPanel = await resPanel.json();
                        setStock({
                            rice: dataPanel.riceStock || 0,
                            wheat: dataPanel.wheatStock || 0,
                            oil: dataPanel.oilStock || 0,
                            sugar: dataPanel.sugarStock || 0,
                            other: dataPanel.otherStock || 0,
                        });
                        setLogs([
                            { id: 1, action: `Users logged in: ${dataPanel.usersLogged}`, date: new Date().toLocaleDateString() },
                            { id: 2, action: `Shopkeepers logged in: ${dataPanel.shopkeepersLogged}`, date: new Date().toLocaleDateString() },
                        ]);
                    }
                }

                // 🔹 Shopkeeper incomplete KYC
                if (role === "shopkeeper") {
                    setLoadingUsers(true); // 🔹 Start loading
                    const resUsers = await fetch("http://localhost:8000/api/shopkeeper/users", {
                        headers: getAuthHeaders(token),
                    });
                    if (resUsers.ok) {
                        const data = await resUsers.json();
                        console.log("Fetched household users:", data);
                        setUsers(data);
                        setHouseholds(data);
                    } else {
                        console.error("User fetch failed:", resUsers.status);
                    }
                    setLoadingUsers(false); // 🔹 End loading
                }

            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);

    // ✅ Styles
    const styles = StyleSheet.create({
        cardContainer: {
            flexDirection: isWeb ? "row" : "column",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: isWeb ? 24 : 12,
            paddingBottom: 20,
        },
        card: {
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 10,
            marginBottom: 20,
            minWidth: isWeb ? 470 : "100%",
            maxWidth: isWeb ? "60%" : "100%",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },

        card1: {
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            minWidth: isWeb ? "100%" : "100%",
            maxWidth: isWeb ? "48%" : "100%",
            flexGrow: 1,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        },

        optionText: {
            fontSize: 18,
            fontWeight: "700",
            color: "#003366",
        },
        detailText: {
            fontSize: 16,
            marginBottom: 4,
            color: "#444",
        }

    });

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#f5f5f5" }} contentContainerStyle={{ padding: 16 }}>
            <Headers router={router} togglePopup={togglePopup} />

            {visible && (
                <>
                    {visible && (
                        <>
                            <View
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: "rgba(0,0,0,0.3)",
                                    zIndex: 998,
                                }}
                            />
                            <PopupProfile
                                user={user}
                                slideAnim={slideAnim}
                                handleLogout={handleLogout}
                                handleClose={togglePopup}   // ✅ add this
                            />
                        </>
                    )}

                </>
            )}

            {/* Responsive grid layout */}
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    <StockCard stock={stock} />
                    <NextDistributionCard />
                </View>

                <View style={styles.card}>
                    <AlertsCard logs={logs} />
                </View>

                <View style={styles.card}>
                    <QuickActionsCard />
                </View>
            </View>

            {/* 🔹 User Record Section */}
            <View style={styles.card1}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <MaterialCommunityIcons name="account-tie" size={22} color="#003366" />
                    <Text style={[styles.optionText, { marginLeft: 8 }]}>Shopkeeper Info</Text>
                </View>

                {user ? (
                    <View>
                        <Text style={{ fontSize: 22 }}>{user.fullName}</Text>
                        <Text style={styles.detailText}>📧Email: {user.email}</Text>
                        <Text style={styles.detailText}>👥Role: {user.role}</Text>
                        {user.lastLogin && (
                            <Text style={styles.detailText}>🕒Last Login: {new Date(user.lastLogin).toLocaleString()}</Text>
                        )}

                    </View>
                ) : (
                    <Text>No user logged in</Text>
                )}
            </View>

            <View style={styles.card1}>
                {/* Section Header */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                    <MaterialCommunityIcons name="home-group" size={24} color="#003366" />
                    <Text style={[styles.optionText, { marginLeft: 8 }]}>Household Users</Text>
                </View>

                {/* Detail View */}
                {selectedUser ? (
                    <View>
                        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
                            {selectedUser.fullName}
                        </Text>
                        <Text style={styles.detailText}>📧 Email: {selectedUser.email}</Text>
                        <Text style={styles.detailText}>📞 Phone: {selectedUser.phone}</Text>
                        <Text style={styles.detailText}>🌆 City: {selectedUser.city}</Text>
                        <Text style={styles.detailText}>👥 Members: {selectedUser.members}</Text>
                        {selectedUser.lastLogin && (
                            <Text style={styles.detailText}>🕒 Last Login: {new Date(selectedUser.lastLogin).toLocaleString()}</Text>
                        )}
                        <IncompleteKYCCard households={households} />

                        {selectedUser.memberDetails?.length > 0 && (
                            <View style={{ marginTop: 16, padding: 10, backgroundColor: "#e4e4e4ff", borderRadius: 8 }}>
                                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6 }}>
                                    Household Members
                                </Text>
                                {selectedUser.memberDetails.map((member, index) => (
                                    <View key={index} style={{ fontSize: 16, marginBottom: 8 }}>
                                        <Text>👤 {member.name} — Age: {member.age}</Text>
                                        {/* ❌ Remove this line */}
                                        {/* <IncompleteKYCCard households={households} /> */}
                                    </View>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity onPress={() => setSelectedUser(null)} style={{ marginTop: 16 }}>
                            <Text style={{ color: "#00796B", fontWeight: "600", fontSize: 16 }}>← Back to Household List</Text>
                        </TouchableOpacity>

                    </View>

                ) : loadingUsers ? (
                    <Text style={{ color: "gray" }}>Loading household users...</Text>
                ) : users.length > 0 ? (
                    <View style={{ maxHeight: 300, overflow: "scroll" }}>
                        {users.map((u) => (
                            <TouchableOpacity
                                key={u._id}
                                onPress={() => setSelectedUser(u)}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 10,
                                    borderBottomWidth: 1,
                                    borderColor: "#eee",
                                }}
                            >
                                <Text style={{ fontSize: 18 }}>{u.fullName}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <Text style={{ color: "gray" }}>No household users found</Text>
                )}
            </View>



        </ScrollView>
    );
}
