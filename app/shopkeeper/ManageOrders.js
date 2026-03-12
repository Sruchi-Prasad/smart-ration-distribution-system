import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function ManageOrders() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/marketplace/all-orders`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (err) {
            console.error("Fetch orders error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFulfill = async (orderId) => {
        Alert.alert(
            "Confirm Fulfillment",
            "Mark this order as complete?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            const res = await fetchWithAuth(`${API_BASE}/api/marketplace/order/${orderId}/fulfill`, {
                                method: "PATCH"
                            });
                            if (res.ok) {
                                Alert.alert("Success", "Order marked as fulfilled.");
                                fetchOrders();
                            } else {
                                Alert.alert("Error", "Action failed.");
                            }
                        } catch (err) {
                            Alert.alert("Error", "Network error.");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.user?.fullName || "Unknown User"}</Text>
                    <Text style={styles.userCard}>Card: {item.user?.rationCard || "N/A"}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === "Completed" ? styles.successBadge : styles.pendingBadge]}>
                    <Text style={[styles.statusText, item.status === "Completed" ? styles.successText : styles.pendingText]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                    <Feather name="package" size={14} color="#64748B" />
                    <Text style={styles.productText}>{item.productName} (x{item.quantity})</Text>
                </View>
                <Text style={styles.totalPrice}>₹{item.totalPrice}</Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
                {item.status === "Pending" && (
                    <TouchableOpacity style={styles.fulfillBtn} onPress={() => handleFulfill(item._id)}>
                        <Text style={styles.fulfillBtnText}>MARK COMPLETE</Text>
                        <MaterialIcons name="done-all" size={16} color="white" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Marketplace Fulfillment</Text>
                <TouchableOpacity onPress={fetchOrders} style={styles.refreshBtn}>
                    <Feather name="refresh-cw" size={20} color="#003366" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FF9933" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={styles.title}>Pending Distributions</Text>
                            <Text style={styles.subtitle}>Verify user identity and ration card before fulfilling premium marketplace orders.</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="box" size={60} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No pending marketplace orders.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F7FB" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 24,
        backgroundColor: "white",
        elevation: 4,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
    },
    refreshBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: { fontSize: 16, fontWeight: "900", color: "#003366", textTransform: "uppercase" },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    listContent: { padding: 20, paddingBottom: 40 },
    listHeader: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: "900", color: "#003366", marginBottom: 8 },
    subtitle: { fontSize: 13, color: "#64748B", fontWeight: "600", lineHeight: 20 },
    orderCard: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: "900", color: "#1E293B" },
    userCard: { fontSize: 12, color: "#64748B", fontWeight: "700", marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pendingBadge: { backgroundColor: "#FFF7ED" },
    successBadge: { backgroundColor: "#F0FDF4" },
    statusText: { fontSize: 9, fontWeight: "900" },
    pendingText: { color: "#EA580C" },
    successText: { color: "#16A34A" },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16, borderStyle: "solid" },
    orderDetails: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    detailRow: { flexDirection: "row", alignItems: "center" },
    productText: { fontSize: 14, fontWeight: "800", color: "#003366", marginLeft: 8 },
    totalPrice: { fontSize: 18, fontWeight: "900", color: "#003366" },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    dateText: { fontSize: 11, color: "#94A3B8", fontWeight: "700" },
    fulfillBtn: {
        backgroundColor: "#128807",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        elevation: 4,
    },
    fulfillBtnText: { color: "white", fontWeight: "900", fontSize: 11 },
    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyText: { marginTop: 16, fontSize: 14, color: "#64748B", fontWeight: "700" },
});
