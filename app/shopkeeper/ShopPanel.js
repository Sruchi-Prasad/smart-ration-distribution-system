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
import { ProgressChart } from "react-native-chart-kit";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth as globalFetchWithAuth } from "../../utils/fetchWithAuth";

import AlertsCard from "../components/AlertsCard";
import Header from "../components/Header";
import IncompleteKYCCard from "../components/IncompleteKYCCard";
import NextDistributionCard from "../components/NextDistributionCard";
import PopupProfile from "../components/PopupProfile";
import QuickActionsCard from "../components/QuickActionsCard";
import StockCard from "../components/StockCard";

export default function ShopPanel() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { width } = Dimensions.get("window");
    const isWeb = width > 768;

    const [visible, setVisible] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // ✅ States for backend data
    const [stock, setStock] = useState({ rice: 0, wheat: 0, oil: 0, sugar: 0, other: 0 });
    const [households, setHouseholds] = useState([]);
    const [logs, setLogs] = useState([]);

    // ✅ User list states
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // ✅ Dashboard stats
    const [statsData, setStatsData] = useState(null);

    const sendKycReminder = async (id = null) => {
        // 🛡️ Safety Check: Ensure 'id' is a string or null (prevents circular JSON error from event objects)
        const userId = (typeof id === 'string') ? id : null;

        try {
            const response = await globalFetchWithAuth(`${API_BASE}/api/auth/send-kyc-reminder`, {
                method: "POST",
                body: JSON.stringify({ userId })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✅ KYC Reminder Processed!\n\n${data.message}`);
            } else {
                alert(`❌ Failed: ${data.message || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("⚠️ Error sending notification");
        }
    };

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

    const handleLogout = () => {
        logout();
        setVisible(false);
    };

    // Simplified: Role protection is now handled by AuthContext.js
    // Local refresh and fetch logic removed in favor of global utilities.

    // Simplified: Role protection is now handled by AuthContext.js
    // Local fetchWithAuth is replaced by global utility.

    // ✅ Fetch panel data based on auth user
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const token = await AsyncStorage.getItem("accessToken");
                if (!token) return;

                const role = user.role;

                // Fetch stats for all roles
                try {
                    const statsRes = await globalFetchWithAuth(`${API_BASE}/api/analytics/stats`);
                    if (statsRes.ok) {
                        setStatsData(await statsRes.json());
                    }
                } catch (e) {
                    console.log("Stats fetch failed");
                }

                // 🔹 Admin panel
                if (role === "admin") {
                    const resPanel = await globalFetchWithAuth(`${API_BASE}/api/admin/panel`);
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
                    const resUsers = await globalFetchWithAuth(`${API_BASE}/api/shopkeeper/users`);
                    if (resUsers.ok) {
                        const data = await resUsers.json();
                        setUsers(data);
                        setHouseholds(data);
                    } else {
                        console.error("User fetch failed:", resUsers.status);
                    }

                    const resStock = await globalFetchWithAuth(`${API_BASE}/api/shopkeeper/stock`);
                    if (resStock.ok) {
                        const stockData = await resStock.json();
                        setStock({
                            rice: stockData.rice || 0,
                            wheat: stockData.wheat || 0,
                            sugar: stockData.sugar || 0,
                            oil: stockData.oil || 0,
                            other: 0
                        });
                    }

                    // ✅ Fetch Real Notifications
                    const resNotifs = await globalFetchWithAuth(`${API_BASE}/api/auth/notifications`);
                    if (resNotifs.ok) {
                        const notifs = await resNotifs.json();
                        setLogs(notifs.map(n => ({
                            id: n._id,
                            action: n.body,
                            date: new Date(n.createdAt).toLocaleDateString()
                        })));
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
        container: {
            flex: 1,
            backgroundColor: "#F4F7FB"
        },
        content: {
            padding: 20,
            paddingBottom: 40,
        },
        topGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 24
        },
        hubContainer: { marginBottom: 20 },
        hubCard: {
            backgroundColor: "white",
            padding: 24,
            borderRadius: 24,
            marginBottom: 16,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            borderWidth: 1,
            borderColor: "#EEF2F6",
        },
        hubHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
        hubTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1 },
        hubDesc: { fontSize: 13, color: "#666", fontWeight: "600", lineHeight: 20 },
        secondGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 24
        },
        middleColumn: {
            flex: 1,
            minWidth: 300,
            gap: 20
        },
        premiumCard: {
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 24,
            flex: 1,
            minWidth: 320,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 15,
            elevation: 6,
            borderWidth: 1,
            borderColor: "#EEF2F6",
            borderLeftWidth: 6,
            borderLeftColor: "#FF9933",
        },
        premiumTitle: {
            fontSize: 18,
            fontWeight: "900",
            color: "#003366",
            marginBottom: 20,
            textTransform: "uppercase",
            letterSpacing: 1,
        },
        summaryRow: {
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: "#F8FAFC",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#EEF2F6",
        },
        summaryLabel: {
            fontSize: 13,
            color: "#666",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 0.5,
        },
        summaryValue: {
            fontSize: 22,
            fontWeight: "900",
            color: "#003366",
        },
        cardWide: {
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 20,
            width: "48%",
            minWidth: 280,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 4,
            borderWidth: 1,
            borderColor: "#EEF2F6",
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "900",
            color: "#003366",
            marginBottom: 8,
            textTransform: "uppercase",
        },
        subText: {
            fontSize: 13,
            color: "#666",
            lineHeight: 18,
            fontWeight: "500",
        },
        infoCard: {
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 15,
            borderWidth: 1,
            borderColor: "#EEF2F6",
        },
        infoTitleRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20
        },
        infoTitleText: {
            fontSize: 16,
            fontWeight: "900",
            color: "#003366",
            marginLeft: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
        },
        detailRow: {
            flexDirection: "row",
            marginBottom: 10,
        },
        detailLabel: {
            fontSize: 14,
            color: "#666",
            fontWeight: "700",
            width: 100,
        },
        detailValue: {
            fontSize: 14,
            color: "#003366",
            fontWeight: "800",
            flex: 1,
        },
        kycButton: {
            backgroundColor: "#D32F2F",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            elevation: 4,
            shadowColor: "#D32F2F",
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        kycButtonText: {
            color: "white",
            fontWeight: "900",
            textTransform: "uppercase",
            fontSize: 12,
            letterSpacing: 0.5,
            marginLeft: 8,
        },
        userItem: {
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderColor: "#F0F4F8",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        userName: {
            fontSize: 16,
            fontWeight: "800",
            color: "#003366",
        },
        manageKycBtn: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
            borderRadius: 14,
            backgroundColor: "#fff",
            borderWidth: 1.5,
            borderColor: "#003366",
            marginTop: 12,
            borderStyle: "dashed",
        },
        manageKycBtnText: {
            color: "#003366",
            fontWeight: "900",
            fontSize: 12,
            textTransform: "uppercase",
            marginLeft: 8,
            letterSpacing: 0.5,
        }
    });

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Header router={router} togglePopup={togglePopup} />

            {/* Popup Overlay */}
            {visible && (
                <>
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.15)", zIndex: 998 }} />
                    <PopupProfile user={user} slideAnim={slideAnim} handleLogout={handleLogout} handleClose={togglePopup} />
                </>
            )}

            {/* ================= ANALYTICS ROW ================= */}
            {statsData && statsData.type === "shopkeeper" && (
                <View style={styles.topGrid}>
                    <View style={styles.premiumCard}>
                        <Text style={styles.premiumTitle}>Inventory Utilization</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap" }}>
                            {statsData.stockStats.map((stat, i) => (
                                <View key={i} style={{ alignItems: "center", margin: 10 }}>
                                    <ProgressChart
                                        data={[stat.current / stat.total]}
                                        width={120}
                                        height={120}
                                        strokeWidth={8}
                                        radius={36}
                                        chartConfig={{
                                            backgroundColor: "#ffffff",
                                            backgroundGradientFrom: "#ffffff",
                                            backgroundGradientTo: "#ffffff",
                                            color: (opacity = 1) => stat.color,
                                        }}
                                        hideLegend={true}
                                    />
                                    <Text style={{ fontWeight: "900", marginTop: 8, fontSize: 13, color: "#003366", textTransform: "uppercase" }}>{stat.name}</Text>
                                    <Text style={{ fontSize: 11, color: "#666", fontWeight: "700" }}>{stat.current} / {stat.total} U</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.premiumCard}>
                        <Text style={styles.premiumTitle}>Shop Summary</Text>
                        <View style={{ gap: 16 }}>
                            <View style={styles.summaryRow}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#E3F2FD", justifyContent: "center", alignItems: "center" }}>
                                    <MaterialCommunityIcons name="account-group" size={24} color="#003366" />
                                </View>
                                <View style={{ marginLeft: 16 }}>
                                    <Text style={styles.summaryValue}>{statsData.summary?.totalBeneficiaries || 0}</Text>
                                    <Text style={styles.summaryLabel}>Total Beneficiaries</Text>
                                </View>
                            </View>
                            <View style={[styles.summaryRow, { borderColor: "#FFEBEB" }]}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFEBEB", justifyContent: "center", alignItems: "center" }}>
                                    <MaterialCommunityIcons name="alert-circle" size={24} color="#D32F2F" />
                                </View>
                                <View style={{ marginLeft: 16 }}>
                                    <Text style={[styles.summaryValue, { color: "#D32F2F" }]}>{statsData.summary?.pendingKyc || 0}</Text>
                                    <Text style={styles.summaryLabel}>Pending KYC</Text>
                                </View>
                            </View>
                            <View style={[styles.summaryRow, { borderColor: "#E8F5E9" }]}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#E8F5E9", justifyContent: "center", alignItems: "center" }}>
                                    <MaterialCommunityIcons name="chart-line" size={24} color="#2E7D32" />
                                </View>
                                <View style={{ marginLeft: 16 }}>
                                    <Text style={[styles.summaryValue, { color: "#2E7D32" }]}>{statsData.summary?.monthlyDistributions || 0}</Text>
                                    <Text style={styles.summaryLabel}>Monthly Distributions</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* ================= TOP ROW ================= */}
            <View style={styles.topGrid}>
                <StockCard stock={stock} />
                <View style={styles.middleColumn}>
                    <NextDistributionCard nextDate={statsData?.summary?.nextDistributionDate} />
                    <AlertsCard logs={logs} />
                </View>
                <QuickActionsCard />
            </View>

            {/* ================= STRATEGIC HUB ================= */}
            <Text style={styles.premiumTitle}>Strategic Hub</Text>
            <View style={styles.hubContainer}>
                <HubCard
                    title="Distribute Rations"
                    desc="Record and verify monthly ration quota releases for households."
                    onPress={() => router.push("/shopkeeper/DistributionForm")}
                />
                <HubCard
                    title="Inventory"
                    desc="Manage stock levels and track supply intake."
                    onPress={() => router.push("/shopkeeper/Inventory")}
                />
                <HubCard
                    title="Analytics"
                    desc="Deep dive into performance and usage trends."
                    onPress={() => router.push("/shopkeeper/Analytics")}
                />
            </View>

            {/* ================= SECOND ROW ================= */}
            <View style={styles.secondGrid}>
                <TouchableOpacity
                    style={styles.cardWide}
                    onPress={() => router.push("/shopkeeper/DistributionHistory")}
                >
                    <Text style={styles.sectionTitle}>Distributions</Text>
                    <Text style={styles.subText}>Historical records of all successful ration distributions.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cardWide} onPress={() => router.push("/shopkeeper/Userfeedbackrecord")}>
                    <Text style={styles.sectionTitle}>Feedback</Text>
                    <Text style={styles.subText}>Direct communication channel for user complaints and reviews.</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.cardWide, { borderLeftColor: "#128807", borderLeftWidth: 6 }]} onPress={() => router.push("/shopkeeper/ManageOrders")}>
                    <Text style={[styles.sectionTitle, { color: "#128807" }]}>Marketplace Orders</Text>
                    <Text style={styles.subText}>Verify and fulfill premium commodity purchases from citizens.</Text>
                </TouchableOpacity>
            </View>

            {/* ================= BOTTOM ROW ================= */}
            <View style={styles.infoCard}>
                <View style={styles.infoTitleRow}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F4F8", justifyContent: "center", alignItems: "center" }}>
                        <MaterialCommunityIcons name="account-tie" size={22} color="#003366" />
                    </View>
                    <Text style={styles.infoTitleText}>Shopkeeper Profile</Text>
                </View>
                {user ? (
                    <View>
                        <Text style={{ fontSize: 24, fontWeight: "900", color: "#003366", marginBottom: 16 }}>{user.fullName}</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>EMAIL</Text>
                            <Text style={styles.detailValue}>{user.email}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>ROLE</Text>
                            <Text style={styles.detailValue}>{user.role}</Text>
                        </View>
                        {user.lastLogin && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>LAST LOGIN</Text>
                                <Text style={styles.detailValue}>{new Date(user.lastLogin).toLocaleString()}</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <Text style={styles.subText}>Session expired. Please log in again.</Text>
                )}
            </View>

            {/* Household Users Section */}
            <View style={styles.infoCard}>
                <View style={[styles.infoTitleRow, { justifyContent: "space-between" }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F4F8", justifyContent: "center", alignItems: "center" }}>
                            <MaterialCommunityIcons name="home-group" size={24} color="#003366" />
                        </View>
                        <Text style={styles.infoTitleText}>Household Directory</Text>
                    </View>
                    <TouchableOpacity onPress={() => sendKycReminder()} style={styles.kycButton}>
                        <MaterialCommunityIcons name="bell-ring" size={18} color="white" />
                        <Text style={styles.kycButtonText}>Blast Reminder</Text>
                    </TouchableOpacity>
                </View>

                {selectedUser ? (
                    <View>
                        <Text style={{ fontSize: 22, fontWeight: "900", color: "#003366", marginBottom: 20 }}>
                            {selectedUser.fullName}
                        </Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>EMAIL</Text>
                            <Text style={styles.detailValue}>{selectedUser.email}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>PHONE</Text>
                            <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>LOCATION</Text>
                            <Text style={styles.detailValue}>{selectedUser.city}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>MEMBERS</Text>
                            <Text style={styles.detailValue}>{selectedUser.members} Individuals</Text>
                        </View>

                        {/* Incomplete KYC Card */}
                        <View style={{ marginTop: 24 }}>
                            <IncompleteKYCCard households={households} />

                            <TouchableOpacity
                                onPress={() => router.push({ pathname: "/shopkeeper/MemberKYCManager", params: { userId: selectedUser._id } })}
                                style={styles.manageKycBtn}
                            >
                                <MaterialCommunityIcons name="account-details" size={18} color="#003366" />
                                <Text style={styles.manageKycBtnText}>Manage Member KYC</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Send Individual Reminder Button */}
                        {(selectedUser.kycStatus === "Pending" || selectedUser.kycStatus === "Rejected") && (
                            <TouchableOpacity
                                onPress={() => sendKycReminder(selectedUser._id)}
                                style={[styles.kycButton, { marginTop: 20, width: "100%", justifyContent: "center" }]}
                            >
                                <MaterialCommunityIcons name="bell-check" size={20} color="white" />
                                <Text style={styles.kycButtonText}>Send Priority KYC Alert</Text>
                            </TouchableOpacity>
                        )}

                        {/* Household Members */}
                        {selectedUser.memberDetails?.length > 0 && (
                            <View style={{ marginTop: 32, backgroundColor: "#F8FAFC", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#EEF2F6" }}>
                                <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Family Composition</Text>
                                {selectedUser.memberDetails.map((member, index) => (
                                    <View key={index} style={[styles.userItem, { backgroundColor: "white", borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: "#EEF2F6" }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.userName}>{member.name}</Text>
                                            <Text style={[styles.subText, { fontSize: 11 }]}>Age: {member.age} • Dependancy: Active</Text>
                                            {member.aadhaarNumber && (
                                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                                                    <MaterialCommunityIcons name="fingerprint" size={12} color="#666" />
                                                    <Text style={{ fontSize: 10, color: "#666", marginLeft: 4, fontWeight: "600", letterSpacing: 1 }}>{member.aadhaarNumber}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ alignItems: "flex-end", gap: 8 }}>
                                            <View style={{
                                                paddingHorizontal: 10,
                                                paddingVertical: 4,
                                                borderRadius: 8,
                                                backgroundColor: member.kycStatus === "Verified" ? "#E8F5E9" : member.kycStatus === "Rejected" ? "#FFEBEB" : "#FFF3E0"
                                            }}>
                                                <Text style={{
                                                    fontSize: 10,
                                                    fontWeight: "900",
                                                    color: member.kycStatus === "Verified" ? "#2E7D32" : member.kycStatus === "Rejected" ? "#D32F2F" : "#EF6C00"
                                                }}>
                                                    {member.kycStatus || "PENDING"}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => sendKycReminder(selectedUser._id)} style={{ padding: 8, backgroundColor: "#F0F4F8", borderRadius: 10 }}>
                                                <MaterialCommunityIcons name="bell-outline" size={16} color="#003366" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        <TouchableOpacity onPress={() => setSelectedUser(null)} style={{ marginTop: 24, alignSelf: "center" }}>
                            <Text style={{ color: "#003366", fontWeight: "900", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>
                                ← Return to Directory
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : loadingUsers ? (
                    <ActivityIndicator size="large" color="#FF9933" style={{ marginVertical: 40 }} />
                ) : users.length > 0 ? (
                    <View style={{ marginTop: 10 }}>
                        {users.map((u) => (
                            <TouchableOpacity
                                key={u._id}
                                onPress={() => setSelectedUser(u)}
                                style={styles.userItem}
                            >
                                <Text style={styles.userName}>{u.fullName}</Text>
                                <MaterialCommunityIcons name="chevron-right" size={24} color="#003366" />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <Text style={[styles.subText, { textAlign: "center", marginVertical: 20 }]}>No household registrations found.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const HubCard = ({ title, desc, onPress }) => (
    <TouchableOpacity style={styles_hub.hubCard} onPress={onPress}>
        <View style={styles_hub.hubHeader}>
            <Text style={styles_hub.hubTitle}>{title}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#003366" />
        </View>
        <Text style={styles_hub.hubDesc}>{desc}</Text>
    </TouchableOpacity>
);

const styles_hub = StyleSheet.create({
    hubCard: {
        backgroundColor: "white",
        padding: 24,
        borderRadius: 24,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    hubHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    hubTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1 },
    hubDesc: { fontSize: 13, color: "#666", fontWeight: "600", lineHeight: 20 },
});

const styles_legacy = StyleSheet.create({}); // Empty to satisfy any dynamic refs
