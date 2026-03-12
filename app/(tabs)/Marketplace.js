import { Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const { width } = Dimensions.get("window");

export default function Marketplace() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/marketplace/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const updateCart = (pid, delta) => {
        setCart((prev) => {
            const current = prev[pid] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [pid]: next };
        });
    };

    const handlePurchase = async (product) => {
        const qty = cart[product._id];
        if (!qty) {
            Alert.alert("Select Quantity", "Please add at least 1 item to purchase.");
            return;
        }

        Alert.alert(
            "Confirm Purchase",
            `Buy ${qty} x ${product.name} for ₹${product.price * qty}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            console.log(`📡 Sending purchase request for ${product.name} (Qty: ${qty})`);
                            const res = await fetchWithAuth(`${API_BASE}/api/marketplace/purchase`, {
                                method: "POST",
                                body: JSON.stringify({ productId: product._id, quantity: qty }),
                            });

                            console.log(`📡 Purchase response status: ${res.status}`);
                            if (res.ok) {
                                const data = await res.json();
                                console.log("✅ Purchase success data:", data);
                                Alert.alert("Success", "Purchase completed successfully!");
                                setCart((prev) => ({ ...prev, [product._id]: 0 }));
                                fetchProducts(); // Refresh stock
                            } else {
                                const err = await res.json();
                                console.log("❌ Purchase error body:", err);
                                Alert.alert("Error", err.error || "Purchase failed.");
                            }
                        } catch (err) {
                            Alert.alert("Error", "Network error.");
                        }
                    },
                },
            ]
        );
    };

    const renderProduct = ({ item }) => (
        <View style={styles.productCard}>
            <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons
                    name={item.name.toLowerCase().includes("rice") ? "barley" :
                        item.name.toLowerCase().includes("oil") ? "oil" :
                            item.name.toLowerCase().includes("sugar") ? "shaker" : "package-variant"}
                    size={40} color="#003366"
                />
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.price}<Text style={styles.unitText}> / {item.unit || "unit"}</Text></Text>
                <Text style={[styles.stockText, item.quantity < 10 && { color: "#D32F2F" }]}>
                    {item.quantity > 0 ? `In Stock: ${item.quantity}` : "Out of Stock"}
                </Text>

                <View style={styles.actionRow}>
                    <View style={styles.qtyContainer}>
                        <TouchableOpacity onPress={() => updateCart(item._id, -1)} style={styles.qtyBtn}>
                            <Feather name="minus" size={16} color="#003366" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{cart[item._id] || 0}</Text>
                        <TouchableOpacity onPress={() => updateCart(item._id, 1)} style={styles.qtyBtn}>
                            <Feather name="plus" size={16} color="#003366" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.buyBtn, (!cart[item._id] || item.quantity <= 0) && styles.disabledBtn]}
                        onPress={() => handlePurchase(item)}
                        disabled={!cart[item._id] || item.quantity <= 0}
                    >
                        <Text style={styles.buyBtnText}>BUY</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Extra Buy Marketplace</Text>
                <TouchableOpacity style={styles.historyBtn} onPress={() => router.push("/(tabs)/marketplaceHistory")}>
                    <MaterialIcons name="receipt-long" size={24} color="#003366" />
                    <Text style={styles.historyBtnText}>HISTORY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cartIcon}>
                    <MaterialIcons name="shopping-cart" size={24} color="#003366" />
                    <View style={styles.cartBadge} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FF9933" />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={styles.listHeader}>
                            <Text style={styles.promoTitle}>Premium Staples & Essentials</Text>
                            <Text style={styles.promoSubtitle}>Purchase high-quality products directly from authorized centers at controlled prices.</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No products available at the moment.</Text>
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
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 0.5, flex: 1 },
    historyBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 12 },
    historyBtnText: { fontSize: 10, fontWeight: "900", color: "#003366", marginLeft: 4 },
    cartIcon: { position: "relative" },
    cartBadge: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FF9933",
        borderWidth: 1,
        borderColor: "white",
    },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    listContent: { padding: 16, paddingBottom: 40 },
    listHeader: { marginBottom: 24, paddingHorizontal: 8 },
    promoTitle: { fontSize: 24, fontWeight: "900", color: "#003366", marginBottom: 8 },
    promoSubtitle: { fontSize: 13, color: "#64748B", lineHeight: 18, fontWeight: "600" },
    productCard: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    imagePlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 20,
        backgroundColor: "#F0F4F8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    productInfo: { flex: 1 },
    productName: { fontSize: 17, fontWeight: "900", color: "#003366" },
    productPrice: { fontSize: 18, fontWeight: "900", color: "#FF9933", marginVertical: 4 },
    unitText: { fontSize: 12, color: "#64748B", fontWeight: "700" },
    stockText: { fontSize: 11, color: "#128807", fontWeight: "800", marginBottom: 12, textTransform: "uppercase" },
    actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    qtyContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        padding: 4,
    },
    qtyBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
    },
    qtyText: { fontSize: 16, fontWeight: "900", color: "#003366", marginHorizontal: 12 },
    buyBtn: {
        backgroundColor: "#003366",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        elevation: 4,
    },
    disabledBtn: { backgroundColor: "#CBD5E1", elevation: 0 },
    buyBtnText: { color: "white", fontWeight: "900", fontSize: 13 },
    emptyText: { textAlign: "center", marginTop: 40, color: "#64748B", fontWeight: "700" },
});
