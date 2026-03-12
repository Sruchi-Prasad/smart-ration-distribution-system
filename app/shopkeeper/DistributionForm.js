import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

/**
 * DistributionForm Screen
 * Allows shopkeepers to record a ration distribution for a specific household.
 */
export default function DistributionForm() {
    const router = useRouter();

    // ✅ Form States
    const [loading, setLoading] = useState(false);
    const [households, setHouseholds] = useState([]);
    const [selectedHousehold, setSelectedHousehold] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        productId: "",
        quantity: "",
    });
    const [distributionStatus, setDistributionStatus] = useState(null); // Pending or Distributed

    // ✅ Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resUsers, resProducts] = await Promise.all([
                    fetchWithAuth(`${API_BASE}/api/shopkeeper/users`),
                    fetchWithAuth(`${API_BASE}/api/products`) // FIXED: was /api/product
                ]);

                if (resUsers.ok) {
                    setHouseholds(await resUsers.json());
                } else {
                    const errData = await resUsers.json();
                    console.error("Users Fetch Failed:", errData);
                    Alert.alert("Error Loading Users", errData.message || errData.error || "Server error");
                }

                if (resProducts.ok) {
                    const prodData = await resProducts.json();
                    setProducts(prodData);
                    if (prodData.length > 0) {
                        setForm(f => ({ ...f, productId: prodData[0]._id }));
                    }
                } else {
                    const errData = await resProducts.json();
                    console.error("Products Fetch Failed:", errData);
                    Alert.alert("Error Loading Products", errData.message || errData.error || "Server error");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                Alert.alert("Connection Issue", err.message || "Failed to connect to the backend.");
            }
        };
        fetchData();
    }, []);

    // ✅ Fetch distribution status when household changes
    useEffect(() => {
        if (selectedHousehold) {
            const fetchStatus = async () => {
                try {
                    const res = await fetchWithAuth(`${API_BASE}/api/distribution/status/${selectedHousehold._id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setDistributionStatus(data.status);
                    }
                } catch (err) {
                    console.error("Status fetch error:", err);
                }
            };
            fetchStatus();
        } else {
            setDistributionStatus(null);
        }
    }, [selectedHousehold]);

    // ✅ Filtered Households for Search
    const filteredHouseholds = households.filter(h =>
        h.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.rationCard && h.rationCard.includes(searchQuery))
    );

    // ✅ Submit Record
    const handleSubmit = async () => {
        if (!selectedHousehold) return Alert.alert("Error", "Please select a household");
        if (!form.productId) return Alert.alert("Error", "Please select a product");
        if (!form.quantity || isNaN(form.quantity)) return Alert.alert("Error", "Please enter a valid quantity");

        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/distribution`, {
                method: "POST",
                body: JSON.stringify({
                    household: selectedHousehold._id,
                    product: form.productId,
                    quantity: Number(form.quantity),
                    date: new Date()
                })
            });

            if (res.ok) {
                alert("Distribution recorded successfully!");
                router.back();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to record distribution");
            }
        } catch (err) {
            alert("Connection failed");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Refill Quota (for demo/testing or monthly reset)
    const restoreQuota = async () => {
        console.log("Attempting to restore quota for:", selectedHousehold?._id);
        if (!selectedHousehold) return;
        setLoading(true);
        try {
            const url = `${API_BASE}/api/shopkeeper/reset-balance/${selectedHousehold._id}`;
            console.log("Calling URL:", url);
            const res = await fetchWithAuth(url, {
                method: "POST"
            });
            console.log("Response status:", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("Quota restored successfully:", data.balance);
                setSelectedHousehold({ ...selectedHousehold, balance: data.balance });
                Alert.alert("Success", "Monthly quota has been restored for this household.");
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("Failed to restore quota:", errData);
                alert("Failed to restore quota: " + (errData.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Quota restore request error:", err);
            alert("Connection issue: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.pageHeader}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ padding: 10, marginLeft: -10 }}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <MaterialIcons name="arrow-back" size={28} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Record Distribution</Text>
                <View style={{ width: 38 }} />
            </View>

            {/* Select Household Section */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>1. Select Household</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                {selectedHousehold ? (
                    <View style={styles.selectedCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.selectedName}>{selectedHousehold.fullName}</Text>
                            <Text style={styles.selectedEmail}>{selectedHousehold.email}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { setSelectedHousehold(null); setDistributionStatus(null); }}>
                            <MaterialIcons name="cancel" size={24} color="#D32F2F" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {filteredHouseholds.slice(0, 5).map(h => (
                            <TouchableOpacity
                                key={h._id}
                                style={styles.userItem}
                                onPress={() => setSelectedHousehold(h)}
                            >
                                <Text style={styles.userName}>{h.fullName}</Text>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={styles.userSub}>{h.email}</Text>
                                    <Text style={styles.userRation}>{h.rationCard}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        {filteredHouseholds.length === 0 && <Text style={styles.emptyText}>No users found</Text>}
                    </View>
                )}
            </View>

            {/* 2. Customer Verification & Status Section */}
            {selectedHousehold && (
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>2. Customer Verification & Status</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ration Card No:</Text>
                        <Text style={styles.infoValue}>{selectedHousehold.rationCard}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Current Month Status:</Text>
                        {distributionStatus ? (
                            <View style={[
                                styles.statusBadge,
                                distributionStatus === "Distributed" ? styles.statusBadgeDone : styles.statusBadgePending
                            ]}>
                                <Text style={[
                                    styles.statusBadgeText,
                                    { color: distributionStatus === "Distributed" ? "#1B5E20" : "#E65100" }
                                ]}>
                                    {distributionStatus}
                                </Text>
                            </View>
                        ) : (
                            <ActivityIndicator size="small" color="#003366" />
                        )}
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.infoLabel}>Available Quota (Current Balance)</Text>
                    <View style={styles.balanceGrid}>
                        <View style={styles.balanceItem}>
                            <MaterialIcons name="inventory" size={18} color="#FF9933" />
                            <Text style={styles.balanceText}>Rice: {selectedHousehold.balance?.rice || 0} kg</Text>
                        </View>
                        <View style={styles.balanceItem}>
                            <MaterialIcons name="inventory" size={18} color="#FF9933" />
                            <Text style={styles.balanceText}>Wheat: {selectedHousehold.balance?.wheat || 0} kg</Text>
                        </View>
                    </View>
                    <View style={[styles.balanceGrid, { marginTop: 12 }]}>
                        <View style={styles.balanceItem}>
                            <MaterialIcons name="inventory" size={18} color="#FF9933" />
                            <Text style={styles.balanceText}>Sugar: {selectedHousehold.balance?.sugar || 0} kg</Text>
                        </View>
                        <View style={styles.balanceItem}>
                            <MaterialIcons name="inventory" size={18} color="#FF9933" />
                            <Text style={styles.balanceText}>Oil: {selectedHousehold.balance?.oil || 0} L</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={restoreQuota} style={styles.refillBtn}>
                        <MaterialIcons name="refresh" size={18} color="#003366" />
                        <Text style={styles.refillBtnText}>Restore Monthly Quota</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* 3. Record Transaction Section */}
            <View style={[styles.section, !selectedHousehold && styles.disabledSection]}>
                <Text style={styles.sectionLabel}>3. Record Transaction</Text>

                <Text style={styles.inputLabel}>Select Product To Distribute</Text>
                {products.length > 0 ? (
                    <View style={styles.productGrid}>
                        {products.map(p => (
                            <TouchableOpacity
                                key={p._id}
                                style={[styles.productBtn, form.productId === p._id && styles.productBtnActive]}
                                onPress={() => setForm({ ...form, productId: p._id })}
                            >
                                <Text style={[styles.productBtnText, form.productId === p._id && styles.productBtnTextActive]}>
                                    {p.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>No products available. Please check backend.</Text>
                )}

                <Text style={styles.inputLabel}>Quantity ({products.find(p => p._id === form.productId)?.unit || "Units"})</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter quantity"
                    keyboardType="numeric"
                    value={form.quantity}
                    onChangeText={(t) => setForm({ ...form, quantity: t })}
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <MaterialIcons name="check-circle" size={20} color="white" />
                        <Text style={styles.submitBtnText}>Submit Record</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F7FB" },
    content: { padding: 20 },
    pageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase" },
    section: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    sectionLabel: { fontSize: 13, fontWeight: "900", color: "#FF9933", marginBottom: 16, textTransform: "uppercase" },
    inputLabel: { fontSize: 11, fontWeight: "800", color: "#666", marginBottom: 8, textTransform: "uppercase" },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#EEF2F6",
        padding: 16,
        borderRadius: 16,
        fontSize: 15,
        fontWeight: "600",
        color: "#003366",
        marginBottom: 12,
    },
    listContainer: { marginTop: 8 },
    userItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#F0F4F8",
    },
    userName: { fontSize: 14, fontWeight: "800", color: "#003366" },
    userSub: { fontSize: 12, color: "#666" },
    selectedCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3F2FD",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#BBDEFB",
    },
    selectedName: { fontSize: 15, fontWeight: "900", color: "#003366" },
    selectedEmail: { fontSize: 12, color: "#003366", opacity: 0.7 },
    productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    productBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#EEF2F6",
        backgroundColor: "#F8FAFC",
    },
    productBtnActive: { backgroundColor: "#003366", borderColor: "#003366" },
    productBtnText: { fontSize: 13, fontWeight: "700", color: "#666" },
    productBtnTextActive: { color: "white" },
    submitBtn: {
        backgroundColor: "#128807",
        padding: 18,
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        marginTop: 10,
    },
    submitBtnText: { color: "white", fontWeight: "900", fontSize: 15, textTransform: "uppercase", marginLeft: 8 },
    disabledBtn: { opacity: 0.6 },
    emptyText: { textAlign: "center", color: "#999", marginVertical: 10 },
    userRation: { fontSize: 12, fontWeight: "700", color: "#FF9933" },
    infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    infoLabel: { fontSize: 13, fontWeight: "800", color: "#666" },
    infoValue: { fontSize: 14, fontWeight: "900", color: "#003366" },
    divider: { height: 1, backgroundColor: "#F0F4F8", marginVertical: 16 },
    balanceGrid: { flexDirection: "row", gap: 12, marginTop: 8 },
    balanceItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F8E9",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#C8E6C9",
        gap: 8
    },
    balanceText: { fontSize: 13, fontWeight: "900", color: "#2E7D32" },
    disabledSection: { opacity: 0.5 },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgePending: { backgroundColor: "#FFF3E0", borderWidth: 1, borderColor: "#FFB74D" },
    statusBadgeDone: { backgroundColor: "#E8F5E9", borderWidth: 1, borderColor: "#81C784" },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    refillBtn: {
        marginTop: 20,
        backgroundColor: "#F0F4F8",
        padding: 12,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#D1D9E6",
        borderStyle: "dashed",
    },
    refillBtnText: {
        color: "#003366",
        fontWeight: "900",
        fontSize: 12,
        textTransform: "uppercase",
        marginLeft: 8,
        letterSpacing: 0.5,
    },
});
