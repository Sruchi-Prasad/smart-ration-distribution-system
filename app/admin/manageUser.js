import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function ManageUser({ user: passedUser, onApproveKYC, onEditUser, onDeactivate, onResetPassword }) {
    const [user, setUser] = useState(passedUser || null);
    const [loading, setLoading] = useState(!passedUser);
    const [shops, setShops] = useState([]);
    const [showShopModal, setShowShopModal] = useState(false);
    const [assigningShop, setAssigningShop] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (passedUser) return;
            try {
                setLoading(true);
                const res = await fetchWithAuth(`${API_BASE}/api/admin/users/default`);
                const data = await res.json();
                if (res.ok) setUser(data);
                else console.error("Fetch failed:", res.status, data);
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };
        const fetchShops = async () => {
            try {
                const res = await fetchWithAuth(`${API_BASE}/api/shopkeeper/list`);
                if (res.ok) setShops(await res.json());
            } catch (err) {
                console.error("Error fetching shops", err);
            }
        }
        fetchUser();
        fetchShops();
    }, [passedUser]);

    const handleAssignShop = async (shopId) => {
        try {
            setAssigningShop(true);
            const res = await fetchWithAuth(`${API_BASE}/api/admin/users/${user._id}/assignShop`, {
                method: "POST",
                body: JSON.stringify({ shopId })
            });
            if (!res.ok) throw new Error("Failed to assign shop");
            const data = await res.json();
            setUser(data.user);
            Alert.alert("Success", "Shop mapping updated successfully!");
            setShowShopModal(false);
        } catch (err) {
            Alert.alert("Error", err.message);
        } finally {
            setAssigningShop(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#003366" />
                <Text style={styles.loadingText}>Loading user...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centered}>
                <MaterialCommunityIcons name="account-off" size={24} color="#999" />
                <Text style={styles.loadingText}>No user selected</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
            {/* Header */}
            <View style={styles.pageHeader}>
                <Text style={styles.back}>Administrative Registry</Text>
                <Text style={styles.pageTitle}>User Oversight</Text>
                <Text style={styles.pageSubtitle}>
                    Complete governance of accounts & KYC status
                </Text>
            </View>

            {/* Profile Card */}
            <View style={styles.card}>
                <Text style={styles.name}>{user.fullName}</Text>

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="email-outline" size={18} color="#FF9933" />
                    <Text style={styles.detail}>{user.email}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="phone-outline" size={18} color="#FF9933" />
                    <Text style={styles.detail}>{user.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={18} color="#FF9933" />
                    <Text style={styles.detail}>{user.city}, {user.state}</Text>
                </View>

                {user.lastLogin && (
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="clock-outline" size={18} color="#FF9933" />
                        <Text style={styles.detail}>Auth: {new Date(user.lastLogin).toLocaleString()}</Text>
                    </View>
                )}

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="storefront-outline" size={18} color="#FF9933" />
                    <Text style={styles.detail}>Shop: {user.assignedShop?.shopName || user.assignedShop?.fullName || "Unassigned"}</Text>
                    <TouchableOpacity style={styles.smallActionBtn} onPress={() => setShowShopModal(true)}>
                        <Text style={styles.smallActionText}>{user.assignedShop ? "Change" : "Assign"}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.badgeRow}>
                    <View style={[
                        styles.badge,
                        user.kycStatus === "complete" ? styles.successBadge : styles.errorBadge
                    ]}>
                        <Text style={[styles.badgeText, { color: user.kycStatus === "complete" ? "#128807" : "#D32F2F" }]}>
                            {user.kycStatus === "complete" ? "Verified" : "Pending KYC"}
                        </Text>
                    </View>

                    <View style={styles.roleBadge}>
                        <Text style={styles.badgeText}>{user.role}</Text>
                    </View>
                </View>
            </View>

            {/* Household Members */}
            {user.members > 0 && (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Family Composition ({user.members})</Text>
                    {user.memberDetails?.map((m, i) => (
                        <View key={i} style={styles.memberCard}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#003366" />
                                <Text style={[styles.detail, { fontSize: 14 }]}>{m.name} ({m.age})</Text>
                            </View>
                            <MaterialCommunityIcons
                                name={m.kycStatus === "complete" ? "check-circle" : "alert-circle"}
                                size={18}
                                color={m.kycStatus === "complete" ? "#128807" : "#FF9933"}
                            />
                        </View>
                    ))}
                </View>
            )}

            {/* Ration Balance */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Entitlement Ledger</Text>
                <View style={styles.balanceGrid}>
                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceIcon}>🍚</Text>
                        <Text style={styles.balanceValue}>{user.balance?.rice ?? 0}</Text>
                        <Text style={styles.balanceLabel}>Rice</Text>
                    </View>

                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceIcon}>🌾</Text>
                        <Text style={styles.balanceValue}>{user.balance?.wheat ?? 0}</Text>
                        <Text style={styles.balanceLabel}>Wheat</Text>
                    </View>

                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceIcon}>🛢️</Text>
                        <Text style={styles.balanceValue}>{user.balance?.oil ?? 0}</Text>
                        <Text style={styles.balanceLabel}>Oil</Text>
                    </View>
                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceIcon}>🍬</Text>
                        <Text style={styles.balanceValue}>{user.balance?.sugar ?? 0}</Text>
                        <Text style={styles.balanceLabel}>Sugar</Text>
                    </View>
                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceIcon}>📦</Text>
                        <Text style={styles.balanceValue}>{user.balance?.other ?? 0}</Text>
                        <Text style={styles.balanceLabel}>Misc</Text>
                    </View>
                </View>
                {user.lastDistribution && (
                    <View style={[styles.detailRow, { marginTop: 16, alignSelf: "center" }]}>
                        <MaterialCommunityIcons name="calendar-check" size={16} color="#666" />
                        <Text style={[styles.detail, { fontSize: 12, color: "#666" }]}>
                            Last Sync: {new Date(user.lastDistribution).toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                {user.kycStatus === "incomplete" && (
                    <TouchableOpacity style={styles.primaryBtn} onPress={onApproveKYC}>
                        <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
                        <Text style={styles.btnText}>Validate KYC</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.warningBtn} onPress={onEditUser}>
                    <MaterialCommunityIcons name="account-edit" size={20} color="#fff" />
                    <Text style={styles.btnText}>Modify Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.warningBtn} onPress={onResetPassword}>
                    <MaterialCommunityIcons name="lock-reset" size={20} color="#fff" />
                    <Text style={styles.btnText}>Sync Credentials</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dangerBtn} onPress={onDeactivate}>
                    <MaterialCommunityIcons name="account-cancel" size={20} color="#fff" />
                    <Text style={styles.btnText}>Freeze Account</Text>
                </TouchableOpacity>
            </View>

            {/* Shop Assignment Modal */}
            <Modal visible={showShopModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Assign to Shop</Text>
                        <ScrollView style={{ maxHeight: 300, marginBottom: 20 }}>
                            <TouchableOpacity
                                style={styles.shopItem}
                                onPress={() => handleAssignShop(null)}
                            >
                                <Text style={[styles.shopItemText, { color: "#D32F2F" }]}>None (Unassign)</Text>
                            </TouchableOpacity>
                            {shops.map(shop => (
                                <TouchableOpacity
                                    key={shop._id}
                                    style={styles.shopItem}
                                    onPress={() => handleAssignShop(shop._id)}
                                >
                                    <Text style={styles.shopItemText}>{shop.shopName || shop.fullName}</Text>
                                    <Text style={styles.shopItemSub}>{shop.city}, {shop.state}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowShopModal(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F7FB"
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F4F7FB"
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: "#003366",
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    pageHeader: {
        backgroundColor: "#003366",
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 15,
        borderBottomWidth: 4,
        borderBottomColor: "#FF9933",
    },
    back: {
        color: "#BBDEFB",
        marginBottom: 12,
        fontSize: 12,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    pageTitle: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "900",
    },
    pageSubtitle: {
        color: "#E3F2FD",
        marginTop: 6,
        fontSize: 13,
        fontWeight: "600",
    },
    card: {
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    name: {
        fontSize: 22,
        fontWeight: "900",
        color: "#003366",
        marginBottom: 16
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    detail: {
        fontSize: 14,
        color: "#444",
        fontWeight: "700",
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: "#003366",
        marginBottom: 18,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    successBadge: {
        backgroundColor: "#E8F5E9",
        borderColor: "#C8E6C9",
    },
    errorBadge: {
        backgroundColor: "#FFEBEE",
        borderColor: "#FFCDD2",
    },
    roleBadge: {
        backgroundColor: "#E3F2FD",
        borderColor: "#BBDEFB",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    badgeText: {
        color: "#003366",
        fontWeight: "900",
        fontSize: 10,
        textTransform: "uppercase",
    },
    balanceGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 10,
    },
    balanceItem: {
        width: "18%",
        alignItems: "center",
        paddingVertical: 16,
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    balanceIcon: { fontSize: 22, marginBottom: 4 },
    balanceValue: { fontSize: 16, fontWeight: "900", color: "#003366" },
    balanceLabel: { fontSize: 10, color: "#666", fontWeight: "800", textTransform: "uppercase" },
    actions: {
        flexDirection: "column",
        gap: 12,
        marginBottom: 40,
    },
    primaryBtn: {
        backgroundColor: "#003366",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        elevation: 4,
    },
    warningBtn: {
        backgroundColor: "#FF9933",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        elevation: 4,
    },
    dangerBtn: {
        backgroundColor: "#D32F2F",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 16,
        elevation: 4,
    },
    btnText: {
        color: "#fff",
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginLeft: 10,
    },
    memberCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 14,
        backgroundColor: "#fff",
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    smallActionBtn: {
        marginLeft: 'auto',
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    smallActionText: {
        color: "#003366",
        fontSize: 10,
        fontWeight: "800",
        textTransform: "uppercase",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#003366",
        marginBottom: 16,
        textAlign: "center",
    },
    shopItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#EEF2F6",
    },
    shopItemText: { fontSize: 15, fontWeight: "800", color: "#003366" },
    shopItemSub: { fontSize: 12, color: "#666" },
    cancelBtn: { padding: 16, backgroundColor: "#F1F5F9", borderRadius: 12, alignItems: "center" },
    cancelBtnText: { fontWeight: "800", color: "#666", textTransform: "uppercase" },
});
