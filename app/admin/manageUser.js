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
            <View style={styles.header}>
                <MaterialCommunityIcons name="account-details" size={26} color="#003366" />
                <Text style={styles.title}>Manage User</Text>
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
                <Text style={styles.detail}>
                    📄 KYC Status: {user.kycStatus === "complete" ? "✅ Complete" : "❌ Incomplete"}
                </Text>
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
                <Text style={styles.sectionTitle}>Ration Balance</Text>
                <Text style={styles.detail}>🍚 Rice: {user.balance?.rice ?? 0} kg</Text>
                <Text style={styles.detail}>🌾 Wheat: {user.balance?.wheat ?? 0} kg</Text>
                <Text style={styles.detail}>🛢️ Oil: {user.balance?.oil ?? 0} L</Text>
                <Text style={styles.detail}>🍬 Sugar: {user.balance?.sugar ?? 0} kg</Text>
                <Text style={styles.detail}>📦 Other: {user.balance?.other ?? 0}</Text>
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
                <TouchableOpacity style={styles.button} onPress={onEditUser}>
                    <Text style={styles.buttonText}>Edit User</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={onResetPassword}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deactivate]} onPress={onDeactivate}>
                    <Text style={styles.buttonText}>Deactivate Account</Text>
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
    loadingText: { marginTop: 10, fontSize: 16, color: "#666" }
});
