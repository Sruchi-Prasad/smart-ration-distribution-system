import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function DistributionHistory() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE}/api/distribution/history`);
            if (res.ok) {
                setHistory(await res.json());
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item =>
        item.household?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.household?.rationCard.includes(searchQuery) ||
        item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.household?.fullName || "Unknown User"}</Text>
                    <Text style={styles.userRation}>{item.household?.rationCard || "N/A"}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
                <View style={styles.productBadge}>
                    <MaterialCommunityIcons name="package-variant" size={16} color="#003366" />
                    <Text style={styles.productName}>{item.product?.name || "Product"}</Text>
                </View>
                <View style={styles.qtyContainer}>
                    <Text style={styles.qtyLabel}>Quantity:</Text>
                    <Text style={styles.qtyValue}>{item.quantity} {item.product?.unit || "kg"}</Text>
                </View>
            </View>

            <View style={styles.statusRow}>
                <View style={styles.successBadge}>
                    <MaterialIcons name="check-circle" size={14} color="#128807" />
                    <Text style={styles.successText}>Successfully Distributed</Text>
                </View>
                <Text style={styles.time}>{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Distribution History</Text>
                <TouchableOpacity onPress={fetchHistory} style={styles.refreshBtn}>
                    <MaterialIcons name="refresh" size={24} color="#003366" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, ration card, or product..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF9933" />
                    <Text style={styles.loadingText}>Fetching Records...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="history" size={64} color="#CCC" />
                            <Text style={styles.emptyText}>No distribution records found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F7FB" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: "white",
        elevation: 2,
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase" },
    backBtn: { padding: 8 },
    refreshBtn: { padding: 8 },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        margin: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: "600", color: "#003366" },
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderLeftWidth: 5,
        borderLeftColor: "#128807",
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: "800", color: "#003366" },
    userRation: { fontSize: 12, color: "#FF9933", fontWeight: "700", marginTop: 2 },
    date: { fontSize: 12, fontWeight: "700", color: "#666" },
    divider: { height: 1, backgroundColor: "#F0F4F8", marginVertical: 12 },
    detailsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    productBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6
    },
    productName: { fontSize: 13, fontWeight: "800", color: "#003366" },
    qtyContainer: { alignItems: "flex-end" },
    qtyLabel: { fontSize: 10, color: "#999", fontWeight: "700", textTransform: "uppercase" },
    qtyValue: { fontSize: 15, fontWeight: "900", color: "#003366" },
    statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
    successBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    successText: { fontSize: 11, fontWeight: "800", color: "#128807" },
    time: { fontSize: 11, color: "#999", fontWeight: "600" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 16, fontWeight: "800", color: "#003366" },
    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyText: { marginTop: 16, fontSize: 16, color: "#999", fontWeight: "600" }
});
