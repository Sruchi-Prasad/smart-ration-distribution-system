import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
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

export default function ShopLocator() {
    const router = useRouter();
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            // Fetching all users with role 'shopkeeper' as they represent shops
            const res = await fetchWithAuth(`${API_BASE}/api/shopkeeper/list`);
            if (res.ok) {
                const data = await res.json();
                setShops(data);
            }
        } catch (err) {
            console.error("Fetch shops error", err);
        } finally {
            setLoading(false);
        }
    };

    const renderShop = ({ item }) => (
        <View style={styles.shopCard}>
            <View style={styles.cardHeader}>
                <View style={styles.shopIcon}>
                    <FontAwesome5 name="store" size={20} color="#003366" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.shopName}>{item.shopName || item.fullName}</Text>
                    <Text style={styles.shopLocation}>{item.city}, {item.state}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: "#F0FDF4" }]}>
                    <Text style={[styles.statusText, { color: "#16A34A" }]}>OPEN</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.shopInfo}>
                <View style={styles.infoRow}>
                    <Feather name="phone" size={14} color="#64748B" />
                    <Text style={styles.infoText}>{item.phone || "No contact"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Feather name="clock" size={14} color="#64748B" />
                    <Text style={styles.infoText}>09:00 AM - 06:00 PM</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.directionBtn}>
                <MaterialIcons name="directions" size={18} color="white" />
                <Text style={styles.directionBtnText}>GET DIRECTIONS</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fair Price Shops</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FF9933" />
                </View>
            ) : (
                <FlatList
                    data={shops}
                    renderItem={renderShop}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={styles.title}>Shop Locator</Text>
                            <Text style={styles.subtitle}>Find your assigned authorized distribution center or nearby fair price shops.</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Feather name="map-pin" size={60} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No registered shops found in your area.</Text>
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
    shopCard: {
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
    shopIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: "#F0F4F8",
        justifyContent: "center",
        alignItems: "center",
    },
    shopName: { fontSize: 17, fontWeight: "900", color: "#1E293B" },
    shopLocation: { fontSize: 12, color: "#64748B", fontWeight: "700", marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 9, fontWeight: "900" },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 },
    shopInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
    infoRow: { flexDirection: "row", alignItems: "center" },
    infoText: { fontSize: 12, color: "#475569", fontWeight: "700", marginLeft: 8 },
    directionBtn: {
        backgroundColor: "#003366",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 16,
        elevation: 4,
        shadowColor: "#003366",
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    directionBtnText: { color: "white", fontWeight: "900", fontSize: 12, letterSpacing: 1, marginLeft: 8 },
    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyText: { marginTop: 16, fontSize: 14, color: "#64748B", fontWeight: "700" },
});
