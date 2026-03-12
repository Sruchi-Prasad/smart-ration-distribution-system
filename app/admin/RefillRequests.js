import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function RefillRequests() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE}/api/admin/refill-requests`);
            if (res.ok) {
                setRequests(await res.json());
            } else {
                Alert.alert("Error", "Failed to fetch refill requests");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            Alert.alert("Error", "Connection failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/admin/refill-requests/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                Alert.alert("Success", `Request ${status.toLowerCase()} successfully`);
                fetchRequests();
            } else {
                Alert.alert("Error", "Failed to update status");
            }
        } catch (err) {
            console.error("Update error:", err);
            Alert.alert("Error", "Communication failure");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.shopInfo}>
                    <Text style={styles.shopName}>{item.shopkeeper?.shopName || "Unknown Shop"}</Text>
                    <Text style={styles.keeperName}>{item.shopkeeper?.fullName}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.status === "Pending" ? styles.pendingBadge :
                        item.status === "Approved" ? styles.approvedBadge : styles.rejectedBadge
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.status === "Pending" ? styles.pendingText :
                            item.status === "Approved" ? styles.approvedText : styles.rejectedText
                    ]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemsSection}>
                <Text style={styles.sectionLabel}>Requested Items:</Text>
                <View style={styles.itemsList}>
                    {item.items.map((prod, idx) => (
                        <View key={idx} style={styles.itemBadge}>
                            <MaterialCommunityIcons name="package-variant-closed" size={14} color="#003366" />
                            <Text style={styles.itemText}>{prod}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                    <MaterialIcons name="event" size={14} color="#666" />
                    <Text style={styles.footerText}>{new Date(item.requestedAt || item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.footerInfo}>
                    <MaterialIcons name="phone" size={14} color="#666" />
                    <Text style={styles.footerText}>{item.shopkeeper?.phone || "N/A"}</Text>
                </View>
            </View>

            {item.status === "Pending" && (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.smallBtn, styles.approveBtn]}
                        onPress={() => updateStatus(item._id, "Approved")}
                    >
                        <MaterialIcons name="check" size={16} color="white" />
                        <Text style={styles.smallBtnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.smallBtn, styles.rejectBtn]}
                        onPress={() => updateStatus(item._id, "Rejected")}
                    >
                        <MaterialIcons name="close" size={16} color="white" />
                        <Text style={styles.smallBtnText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refill Requests</Text>
                <TouchableOpacity onPress={fetchRequests} style={styles.refreshBtn}>
                    <MaterialIcons name="refresh" size={24} color="#003366" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF9933" />
                    <Text style={styles.loadingText}>Loading Requests...</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="truck-delivery-outline" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>No refill requests yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: "white",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase" },
    backBtn: { padding: 8 },
    refreshBtn: { padding: 8 },
    listContent: { padding: 20, paddingBottom: 40 },
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    shopInfo: { flex: 1 },
    shopName: { fontSize: 16, fontWeight: "900", color: "#003366" },
    keeperName: { fontSize: 13, color: "#666", fontWeight: "600", marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pendingBadge: { backgroundColor: "#FFF3E0" },
    approvedBadge: { backgroundColor: "#E8F5E9" },
    rejectedBadge: { backgroundColor: "#FFEBEB" },
    statusText: { fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
    pendingText: { color: "#E65100" },
    approvedText: { color: "#2E7D32" },
    rejectedText: { color: "#D32F2F" },
    divider: { height: 1, backgroundColor: "#F0F4F8", marginVertical: 12 },
    sectionLabel: { fontSize: 11, fontWeight: "800", color: "#999", textTransform: "uppercase", marginBottom: 8 },
    itemsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    itemBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F4F8",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: "#E2E8F0"
    },
    itemText: { fontSize: 12, fontWeight: "800", color: "#003366" },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, borderTopWidth: 1, borderTopColor: "#F8FAFC", paddingTop: 12 },
    footerInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
    footerText: { fontSize: 12, color: "#666", fontWeight: "600" },
    actionRow: {
        flexDirection: "row",
        marginTop: 16,
        gap: 12,
    },
    smallBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    approveBtn: {
        backgroundColor: "#2E7D32",
    },
    rejectBtn: {
        backgroundColor: "#D32F2F",
    },
    smallBtnText: {
        color: "white",
        fontWeight: "900",
        textTransform: "uppercase",
        fontSize: 12,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 16, fontWeight: "800", color: "#003366" },
    emptyContainer: { alignItems: "center", marginTop: 80 },
    emptyText: { marginTop: 16, fontSize: 16, color: "#999", fontWeight: "600" }
});
