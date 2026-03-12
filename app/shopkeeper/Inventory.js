import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import * as Progress from "react-native-progress";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function ShopkeeperInventory() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [stock, setStock] = useState({ rice: 0, wheat: 0, sugar: 0, oil: 0 });
    const [refillItems, setRefillItems] = useState({ rice: "", wheat: "", sugar: "", oil: "" });

    useEffect(() => {
        loadStock();
    }, []);

    const loadStock = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API_BASE}/api/shopkeeper/stock`);
            if (res.ok) {
                const data = await res.json();
                setStock({
                    rice: data.rice || 0,
                    wheat: data.wheat || 0,
                    sugar: data.sugar || 0,
                    oil: data.oil || 0
                });
            }
        } catch (err) {
            console.error("Stock load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefillRequest = async () => {
        const items = Object.entries(refillItems)
            .filter(([_, qty]) => qty && Number(qty) > 0)
            .map(([name, quantity]) => ({ name, quantity: Number(quantity) }));

        if (items.length === 0) {
            Alert.alert("Error", "Please specify at least one item quantity.");
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetchWithAuth(`${API_BASE}/api/shopkeeper/request-refill`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items })
            });

            if (res.ok) {
                Alert.alert("Success", "Refill request submitted to administrator.");
                setRefillItems({ rice: "", wheat: "", sugar: "", oil: "" });
            } else {
                const data = await res.json();
                Alert.alert("Error", data.message || "Failed to submit request.");
            }
        } catch (err) {
            Alert.alert("Error", "Connection failed.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF9933" />
                <Text style={styles.loadingText}>Loading Inventory...</Text>
            </View>
        );
    }

    const products = [
        { key: "rice", label: "Rice", unit: "kg", icon: "barley", color: "#003366", max: 500 },
        { key: "wheat", label: "Wheat", unit: "kg", icon: "shuck", color: "#4CAF50", max: 300 },
        { key: "sugar", label: "Sugar", unit: "kg", icon: "cube-outline", color: "#FF9933", max: 100 },
        { key: "oil", label: "Oil", unit: "L", icon: "oil", color: "#E91E63", max: 100 },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#003366" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inventory Center</Text>
                <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#FF9933" />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Current Assigned Stock</Text>
                {products.map((item) => (
                    <View key={item.key} style={styles.itemRow}>
                        <View style={styles.itemHeader}>
                            <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                            </View>
                            <Text style={styles.itemLabel}>{item.label}</Text>
                            <Text style={styles.itemQty}>{stock[item.key]} / {item.max} {item.unit}</Text>
                        </View>
                        <Progress.Bar
                            progress={stock[item.key] / item.max}
                            width={null}
                            height={8}
                            color={item.color}
                            unfilledColor="#F0F4F8"
                            borderWidth={0}
                            borderRadius={4}
                        />
                    </View>
                ))}
            </View>

            <View style={styles.refillCard}>
                <Text style={styles.cardTitle}>Request Stock Refill</Text>
                <Text style={styles.subtitle}>Specify quantities needed for restoration.</Text>

                <View style={styles.refillGrid}>
                    {products.map((item) => (
                        <View key={item.key} style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{item.label} ({item.unit})</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={refillItems[item.key]}
                                onChangeText={(val) => setRefillItems({ ...refillItems, [item.key]: val })}
                            />
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                    onPress={handleRefillRequest}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="send-clock" size={20} color="white" />
                            <Text style={styles.submitBtnText}>Submit Refill Request</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F7FB" },
    content: { padding: 20 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 16, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderBottomWidth: 3,
        borderBottomColor: "#FF9933",
    },
    backBtn: { padding: 8, backgroundColor: "#F0F4F8", borderRadius: 12 },
    headerTitle: { fontSize: 16, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1 },
    card: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    cardTitle: { fontSize: 18, fontWeight: "900", color: "#003366", marginBottom: 20, textTransform: "uppercase", letterSpacing: 0.5 },
    itemRow: { marginBottom: 20 },
    itemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
    itemLabel: { flex: 1, fontSize: 14, fontWeight: "800", color: "#444" },
    itemQty: { fontSize: 13, fontWeight: "900", color: "#003366" },
    refillCard: {
        backgroundColor: "#003366",
        borderRadius: 24,
        padding: 24,
        elevation: 8,
        shadowColor: "#003366",
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    subtitle: { color: "#BBDEFB", fontSize: 12, fontWeight: "700", marginBottom: 24, textTransform: "uppercase" },
    refillGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    inputGroup: { width: "48%", marginBottom: 16 },
    inputLabel: { color: "#fff", fontSize: 11, fontWeight: "800", marginBottom: 8, textTransform: "uppercase", opacity: 0.8 },
    input: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: 14,
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    submitBtn: {
        backgroundColor: "#FF9933",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        borderRadius: 16,
        marginTop: 10,
        elevation: 4,
    },
    submitBtnText: { color: "white", fontWeight: "900", textTransform: "uppercase", fontSize: 14, marginLeft: 10, letterSpacing: 1 },
});
