import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ManageUser({ user: passedUser, onApproveKYC, onEditUser, onDeactivate, onResetPassword }) {
    const [user, setUser] = useState(passedUser || null);
    const [loading, setLoading] = useState(!passedUser);

    useEffect(() => {
        const fetchUser = async () => {
            if (passedUser) return;
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("accessToken");
                const res = await fetch("http://localhost:8000/api/admin/users/default", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setUser(data);
                else console.error("Fetch failed:", res.status, data);
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [passedUser]);

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
        <ScrollView style={styles.container}>


            {/* Header */}
            <View style={styles.pageHeader}>
                <Text style={styles.back}>← Back to Dashboard</Text>

                <Text style={styles.pageTitle}>All Users</Text>
                <Text style={styles.pageSubtitle}>
                    Manage registered users, KYC status and accounts
                </Text>
            </View>

            {/* Profile Card */}
            <View style={styles.card}>
                <Text style={styles.name}>{user.fullName}</Text>
                <Text style={styles.detail}>📧 {user.email}</Text>
                <Text style={styles.detail}>📞 {user.phone}</Text>
                <Text style={styles.detail}>📍 {user.city}, {user.state}, {user.country}</Text>
                <Text style={styles.detail}>👥 Role: {user.role}</Text>
                {user.lastLogin && (
                    <Text style={styles.detail}>🕒 Last Login: {new Date(user.lastLogin).toLocaleString()}</Text>
                )}
                <View style={styles.badgeRow}>
                    <View style={[
                        styles.badge,
                        user.kycStatus === "complete"
                            ? styles.successBadge
                            : styles.errorBadge
                    ]}>
                        <Text style={styles.badgeText}>
                            {user.kycStatus === "complete" ? "KYC Complete" : "KYC Pending"}
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
                    <Text style={styles.sectionTitle}>Household Members ({user.members})</Text>
                    {user.memberDetails?.map((m, i) => (
                        <Text key={i} style={styles.detail}>
                            👤 {m.name} — Age: {m.age} — KYC: {m.kycStatus === "complete" ? "✅" : "❌"}
                        </Text>
                    ))}
                </View>
            )}

            {/* Ration Balance */}
            <View style={styles.card}>
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
                        <Text style={styles.balanceLabel}>Other</Text>
                    </View>
                </View>
                {user.lastDistribution && (
                    <Text style={styles.detail}>📅 Last Distribution: {new Date(user.lastDistribution).toLocaleDateString()}</Text>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                {user.kycStatus === "incomplete" && (
                    <TouchableOpacity style={styles.button} onPress={onApproveKYC}>
                        <Text style={styles.buttonText}>Approve KYC</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.primaryBtn} onPress={onEditUser}>
                    <MaterialCommunityIcons name="account-edit" size={20} color="#fff" />
                    <Text style={styles.btnText}>Edit User</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.warningBtn} onPress={onResetPassword}>
                    <MaterialCommunityIcons name="lock-reset" size={20} color="#fff" />
                    <Text style={styles.btnText}>Reset Password</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dangerBtn} onPress={onDeactivate}>
                    <MaterialCommunityIcons name="account-cancel" size={20} color="#fff" />
                    <Text style={styles.btnText}>Deactivate</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 22, fontWeight: "700", color: "#003366", marginLeft: 8 },
    card: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    name: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
    detail: { fontSize: 16, marginBottom: 4, color: "#444" },
    sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8, color: "#003366" },
    actions: { flexDirection: "column", gap: 12 },
    button: { backgroundColor: "#003366", padding: 12, borderRadius: 8, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "600" },
    deactivate: { backgroundColor: "#B71C1C" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    loadingText: { marginTop: 10, fontSize: 16, color: "#666" }, headerCard: {
        backgroundColor: "#003366",
        padding: 18,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
        elevation: 4
    },

    headerName: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700"
    },

    headerEmail: {
        color: "#E3F2FD",
        marginTop: 2
    },

    badgeRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10
    },

    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },

    successBadge: { backgroundColor: "#2E7D32" },
    errorBadge: { backgroundColor: "#C62828" },

    roleBadge: {
        backgroundColor: "#1565C0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },

    badgeText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 12
    },

    balanceGrid: {
        flexDirection: "row",
        flexWrap: "wrap",        // allows proper alignment
        justifyContent: "space-between",
        marginTop: 10,
    },


    balanceItem: {
        width: "18%",   // 4 cards in one row
        alignItems: "center",
        paddingVertical: 15,
        borderRadius: 12,
    },

    balanceIcon: { fontSize: 20 },
    balanceValue: { fontSize: 18, fontWeight: "700", color: "#003366" },
    balanceLabel: { fontSize: 12, color: "#666" },

    primaryBtn: {
        backgroundColor: "#003366",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        padding: 14,
        borderRadius: 10
    },

    warningBtn: {
        backgroundColor: "#EF6C00",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        padding: 14,
        borderRadius: 10
    },

    dangerBtn: {
        backgroundColor: "#B71C1C",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        padding: 14,
        borderRadius: 10
    },

    btnText: {
        color: "#fff",
        fontWeight: "600"
    },
    pageHeader: {
        backgroundColor: "#003366",
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
    },

    back: {
        color: "#BBDEFB",
        marginBottom: 8,
        fontSize: 14,
    },

    pageTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
    },

    pageSubtitle: {
        color: "#E3F2FD",
        marginTop: 4,
    },
});
