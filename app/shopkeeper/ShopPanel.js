import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
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
    const { width } = Dimensions.get("window");
    const isWeb = width > 768;

    const [visible, setVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // ✅ States for backend data
    const [stock, setStock] = useState({ rice: 0, wheat: 0, oil: 0, sugar: 0, other: 0 });
    const [households, setHouseholds] = useState([]);
    const [logs, setLogs] = useState([]);

    // ✅ User list states
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const screenWidth = Dimensions.get("window").width;
    const slideAnim = useState(new Animated.Value(screenWidth))[0];

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
        await AsyncStorage.removeItem("refreshToken");
        setUser(null);
        setVisible(false);
        router.replace("/(tabs)/login");
    };

    // 🔄 Refresh token logic
    // 🔄 Refresh token logic with debug logs
    const refreshAccessToken = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            if (!refreshToken) {
                console.log("⚠️ No refresh token found in storage");
                return null;
            }

            const res = await fetch("http://localhost:8000/api/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }), // ✅ backend expects this key
            });

            if (res.ok) {
                const data = await res.json();

                // Save both new tokens
                await AsyncStorage.setItem("accessToken", data.accessToken);
                await AsyncStorage.setItem("refreshToken", data.refreshToken);

                // 🔎 Debug logs
                console.log("🔄 Tokens refreshed successfully!");
                console.log("New Access Token:", data.accessToken.slice(0, 20) + "..."); // log first 20 chars
                console.log("New Refresh Token:", data.refreshToken.slice(0, 20) + "...");

                return data.accessToken;
            } else {
                console.error("❌ Refresh failed with status:", res.status);
                return null;
            }
        } catch (err) {
            console.error("❌ Refresh token error:", err);
            return null;
        }
    };

    // 🔄 Wrapper for fetch with retry
    const fetchWithAuth = async (url, token) => {
        let res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

        if (res.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                res = await fetch(url, { headers: { Authorization: `Bearer ${newToken}` } });
            } else {
                handleLogout(); // ✅ force logout if refresh fails
            }
        }
        return res;
    };

    // ✅ Load logged-in user and fetch panel data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                const token = await AsyncStorage.getItem("accessToken");
                if (!storedUser || !token) return;

                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                const role = parsedUser.role;

                // 🔹 Admin panel
                if (role === "admin") {
                    const resPanel = await fetchWithAuth("http://localhost:8000/api/admin/panel", token);
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
                    setLoadingUsers(true);
                    const resUsers = await fetchWithAuth("http://localhost:8000/api/shopkeeper/users", token);
                    if (resUsers.ok) {
                        const data = await resUsers.json();
                        setUsers(data);
                        setHouseholds(data);
                    } else {
                        console.error("User fetch failed:", resUsers.status);
                    }
                    setLoadingUsers(false);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);

    

    // ✅ Styles
    const styles = StyleSheet.create({
        topGrid: { flexDirection: "row", flexWrap: "wrap", gap: 20, marginBottom: 24 },
        secondGrid: { flexDirection: "row", flexWrap: "wrap", gap: 20, marginBottom: 24 },
        middleColumn: { flex: 1, minWidth: 300, gap: 20 },
        nextDistributionCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
        alertsCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
        card: { backgroundColor: "#fff", borderRadius: 14, padding: 20, flex: 1, minWidth: 300, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
        cardWide: { backgroundColor: "#fff", borderRadius: 14, padding: 20, width: "48%", minWidth: 300, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
        card1: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
        sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0b2c4d", marginBottom: 10 },
        subText: { fontSize: 14, color: "#555", marginBottom: 6 },
        optionText: { fontSize: 18, fontWeight: "700", color: "#0b2c4d" },
        detailText: { fontSize: 14, color: "#333", marginBottom: 6 },
    });

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "#f4f7fb" }} contentContainerStyle={{ padding: 20 }}>
            <Headers router={router} togglePopup={togglePopup} />

            {/* Popup Overlay */}
            {visible && (
                <>
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 998 }} />
                    <PopupProfile user={user} slideAnim={slideAnim} handleLogout={handleLogout} handleClose={togglePopup} />
                </>
            )}

            {/* ================= TOP ROW ================= */}
            <View style={styles.topGrid}>
                <View style={styles.card}><StockCard stock={stock} /></View>
                <View style={styles.middleColumn}>
                    <View style={styles.nextDistributionCard}><NextDistributionCard /></View>
                    <View style={styles.alertsCard}><AlertsCard logs={logs} /></View>
                </View>
                <View style={styles.card}><QuickActionsCard /></View>
            </View>

            {/* ================= SECOND ROW ================= */}
            <View style={styles.secondGrid}>
                <View style={styles.cardWide}><Text style={styles.sectionTitle}>Inventory Management</Text><Text style={styles.subText}>Update stock levels or add new products to inventory.</Text></View>
                <View style={styles.cardWide}>
                    <Text style={styles.sectionTitle}>Distribution Records</Text>
                    <Text style={styles.subText}>Track ration distribution history for households.</Text>
                </View>
                <View style={styles.cardWide}>
                    <Text style={styles.sectionTitle}>Shop Analytics</Text>
                    <Text style={styles.subText}>Daily and weekly performance insights.</Text>
                </View>
                <View style={styles.cardWide}>
                    <Text style={styles.sectionTitle}>User Feedback</Text>
                    <Text style={styles.subText}>View complaints or send announcements.</Text>

                </View>
            </View>

            {/* ================= BOTTOM ROW ================= */}
            <View style={styles.card1}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <MaterialCommunityIcons name="account-tie" size={22} color="#003366" />
                    <Text style={[styles.optionText, { marginLeft: 8 }]}>Shopkeeper Info</Text>
                </View>
                {user ? (
                    <View>
                        <Text style={{ fontSize: 22 }}>{user.fullName}</Text>
                        <Text style={styles.detailText}>📧 Email: {user.email}</Text>
                        <Text style={styles.detailText}>👥 Role: {user.role}</Text>
                        {user.lastLogin && (
                            <Text style={styles.detailText}>
                                🕒 Last Login: {new Date(user.lastLogin).toLocaleString()}
                            </Text>
                        )}
                    </View>
                ) : (
                    <Text>No user logged in</Text>
                )}
            </View>

            {/* Household Users Section */}
            <View style={styles.card1}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                    <MaterialCommunityIcons name="home-group" size={24} color="#003366" />
                    <Text style={[styles.optionText, { marginLeft: 8 }]}>Household Users</Text>
                </View>

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
                            <Text style={styles.detailText}>
                                🕒 Last Login: {new Date(selectedUser.lastLogin).toLocaleString()}
                            </Text>
                        )}

                        {/* Incomplete KYC Card */}
                        <View style={{ marginTop: 12 }}>
                            <IncompleteKYCCard households={households} />
                        </View>

                        {/* Household Members */}
                        {selectedUser.memberDetails?.length > 0 && (
                            <View
                                style={{
                                    marginTop: 16,
                                    padding: 10,
                                    backgroundColor: "#e4e4e4ff",
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6 }}>
                                    Household Members
                                </Text>
                                {selectedUser.memberDetails.map((member, index) => (
                                    <View key={index} style={{ marginBottom: 8 }}>
                                        <Text>👤 {member.name} — Age: {member.age}</Text>
                                        <IncompleteKYCCard households={households} />
                                    </View>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity onPress={() => setSelectedUser(null)} style={{ marginTop: 16 }}>
                            <Text style={{ color: "#00796B", fontWeight: "600", fontSize: 16 }}>
                                ← Back to Household List
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : loadingUsers ? (
                    <ActivityIndicator size="large" color="#003366" />
                ) : users.length > 0 ? (
                    <ScrollView style={{ maxHeight: 300 }}>
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
                    </ScrollView>
                ) : (
                    <Text style={{ color: "gray" }}>No household users found</Text>
                )}
            </View>
        </ScrollView>
    );
}
