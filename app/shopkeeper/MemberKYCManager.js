import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function MemberKYCManager() {
    const { userId } = useLocalSearchParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        if (userId) fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/shopkeeper/users`);
            if (res.ok) {
                const users = await res.json();
                const found = users.find(u => u._id === userId);
                setUser(found);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateMemberStatus = async (memberId, currentStatus) => {
        // Simple cycle: Pending -> Verified -> Rejected -> Pending
        const nextStatus =
            currentStatus === "Pending" ? "Verified" :
                currentStatus === "Verified" ? "Rejected" : "Pending";

        console.log(`🔄 Updating status for ${memberId} to ${nextStatus}...`);

        try {
            setUpdatingId(memberId);
            const res = await fetchWithAuth(`${API_BASE}/api/shopkeeper/member-kyc/${userId}/${memberId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus })
            });

            console.log("📡 Response Status:", res.status);

            if (res.ok) {
                const data = await res.json();
                console.log("✅ Success:", data);
                // Optimistic UI update or re-fetch
                setUser(prev => ({
                    ...prev,
                    memberDetails: prev.memberDetails.map(m =>
                        m._id === memberId ? { ...m, kycStatus: nextStatus } : m
                    )
                }));
                if (Platform.OS === 'web') window.alert(`Success: Status updated to ${nextStatus}.`);
                else Alert.alert("Success", `Status updated to ${nextStatus}. User notified.`);
            } else {
                const err = await res.json();
                console.log("❌ Error:", err);
                if (Platform.OS === 'web') window.alert("Failed: " + (err.message || "Could not update status."));
                else Alert.alert("Error", "Failed to update status.");
            }
        } catch (err) {
            console.error("❌ Patch Error:", err);
            Alert.alert("Error", "Connection error.");
        } finally {
            setUpdatingId(null);
        }
    };

    const updateHouseholdStatus = async (currentStatus) => {
        const nextStatus =
            currentStatus === "Pending" ? "Verified" :
                currentStatus === "Verified" ? "Rejected" : "Pending";

        console.log(`🔄 Updating household status for ${userId} to ${nextStatus}...`);

        try {
            setUpdatingId("household");
            const res = await fetchWithAuth(`${API_BASE}/api/shopkeeper/kyc/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus })
            });

            if (res.ok) {
                const data = await res.json();
                setUser(prev => ({ ...prev, kycStatus: nextStatus }));
                if (Platform.OS === 'web') window.alert(`Success: Household status updated to ${nextStatus}.`);
                else Alert.alert("Success", `Household status updated to ${nextStatus}. User notified.`);
            } else {
                const err = await res.json();
                if (Platform.OS === 'web') window.alert("Failed: " + (err.message || "Could not update status."));
                else Alert.alert("Error", "Failed to update status.");
            }
        } catch (err) {
            console.error("❌ Patch Error:", err);
            Alert.alert("Error", "Connection error.");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF9933" />
        </View>
    );

    if (!user) return (
        <View style={styles.center}>
            <Text>User not found.</Text>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ color: "#003366", marginTop: 10 }}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Member KYC Manager</Text>
            </View>

            <View style={styles.userCard}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.householdLabel}>Head of Household</Text>
                    <Text style={styles.userName}>{user.fullName}</Text>
                    <Text style={styles.userSub}>{user.email} • {user.phone}</Text>
                </View>

                <TouchableOpacity
                    onPress={() => updateHouseholdStatus(user.kycStatus || "Pending")}
                    style={[
                        styles.statusBadge,
                        user.kycStatus === "Verified" ? styles.verified :
                            user.kycStatus === "Rejected" ? styles.rejected : styles.pending
                    ]}
                    disabled={updatingId === "household"}
                >
                    {updatingId === "household" ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.statusText}>{user.kycStatus || "Pending"}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Family Members</Text>
            <Text style={styles.sectionSubtitle}>Tap status to cycle: Pending → Verified → Rejected</Text>

            {user.memberDetails.map((member) => (
                <View key={member._id} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberAge}>Age: {member.age}</Text>
                        {member.aadhaarNumber && (
                            <View style={styles.aadhaarRow}>
                                <MaterialCommunityIcons name="fingerprint" size={12} color="#666" />
                                <Text style={styles.aadhaarText}>{member.aadhaarNumber}</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => updateMemberStatus(member._id, member.kycStatus || "Pending")}
                        style={[
                            styles.statusBadge,
                            member.kycStatus === "Verified" ? styles.verified :
                                member.kycStatus === "Rejected" ? styles.rejected : styles.pending
                        ]}
                        disabled={updatingId === member._id}
                    >
                        {updatingId === member._id ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.statusText}>{member.kycStatus || "Pending"}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ))}

            <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                    Updating a member's status will automatically send a notification to the head of household.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F7FB" },
    content: { padding: 20 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    backBtn: { padding: 8, backgroundColor: "#fff", borderRadius: 12, marginRight: 16, elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366" },
    userCard: {
        backgroundColor: "white",
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#EEF2F6",
        marginBottom: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    householdLabel: { fontSize: 11, fontWeight: "900", color: "#666", textTransform: "uppercase", marginBottom: 8 },
    userName: { fontSize: 22, fontWeight: "900", color: "#003366" },
    userSub: { fontSize: 13, color: "#666", marginTop: 4 },
    sectionTitle: { fontSize: 16, fontWeight: "900", color: "#003366", marginBottom: 4 },
    sectionSubtitle: { fontSize: 11, color: "#999", marginBottom: 16, fontWeight: "700" },
    memberCard: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 16, fontWeight: "800", color: "#003366" },
    memberAge: { fontSize: 12, color: "#666", marginTop: 2 },
    aadhaarRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    aadhaarText: { fontSize: 11, color: "#666", marginLeft: 4, fontWeight: "600", letterSpacing: 1 },
    statusBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 100, alignItems: "center" },
    statusText: { color: "white", fontWeight: "900", fontSize: 12, textTransform: "uppercase" },
    verified: { backgroundColor: "#4CAF50" },
    rejected: { backgroundColor: "#D32F2F" },
    pending: { backgroundColor: "#FF9933" },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,51,102,0.05)",
        padding: 20,
        borderRadius: 20,
        marginTop: 20,
    },
    infoText: { flex: 1, marginLeft: 12, fontSize: 12, color: "#666", lineHeight: 18, fontWeight: "600" }
});
