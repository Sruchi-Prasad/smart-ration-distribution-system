import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function MarketplaceHistory() {
    const router = useRouter();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/marketplace/my-purchases`);
            if (res.ok) {
                const data = await res.json();
                setPurchases(data);
            }
        } catch (err) {
            console.error("Fetch history error", err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                    <Feather name="shopping-bag" size={20} color="#003366" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === "Completed" ? styles.successBadge : styles.pendingBadge]}>
                    <Text style={[styles.statusText, item.status === "Completed" ? styles.successText : styles.pendingText]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.infoLabel}>QUANTITY</Text>
                    <Text style={styles.infoValue}>{item.quantity} units</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.infoLabel}>TOTAL AMOUNT</Text>
                    <Text style={styles.priceValue}>₹{item.totalPrice}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Purchase Receipts</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FF9933" />
                </View>
            ) : (
                <FlatList
                    data={purchases}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={styles.title}>Marketplace History</Text>
                            <Text style={styles.subtitle}>Track your premium essential purchases and digital distribution receipts.</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="file-text" size={60} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No purchases found yet.</Text>
                            <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push("/(tabs)/Marketplace")}>
                                <Text style={styles.shopNowText}>VISIT MARKETPLACE</Text>
                            </TouchableOpacity>
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
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase" },
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
    cardHeader: { flexDirection: "row", alignItems: "center" },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },
    productName: { fontSize: 16, fontWeight: "900", color: "#1E293B" },
    orderDate: { fontSize: 11, color: "#94A3B8", fontWeight: "700", marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pendingBadge: { backgroundColor: "#FFF7ED" },
    successBadge: { backgroundColor: "#F0FDF4" },
    statusText: { fontSize: 9, fontWeight: "900" },
    pendingText: { color: "#EA580C" },
    successText: { color: "#16A34A" },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16, borderStyle: "dashed", borderRadius: 1 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    infoLabel: { fontSize: 9, fontWeight: "800", color: "#94A3B8", letterSpacing: 0.5, marginBottom: 4 },
    infoValue: { fontSize: 14, fontWeight: "700", color: "#003366" },
    priceValue: { fontSize: 20, fontWeight: "900", color: "#003366" },
    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyText: { marginTop: 16, fontSize: 15, color: "#64748B", fontWeight: "700" },
    shopNowBtn: {
        marginTop: 24,
        backgroundColor: "#003366",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    shopNowText: { color: "white", fontWeight: "900", fontSize: 12, letterSpacing: 1 },
});
