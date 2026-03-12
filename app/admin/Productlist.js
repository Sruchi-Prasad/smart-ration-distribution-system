import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

import { API_BASE } from "../../utils/config";
const API = `${API_BASE}/api`;

export default function AdminManageProducts() {
    const [products, setProducts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        category: "",
        price: "",
        quantity: "",
        unit: "kg",
        minStock: ""
    });

    // ✅ LOAD PRODUCTS
    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${API}/products`);
            const data = await res.json();
            setProducts(data.products || data);
        } catch (err) {
            console.log("LOAD ERROR:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // SAVE PRODUCT
    const saveProduct = async () => {
        try {
            const url = editingProduct
                ? `${API}/products/${editingProduct._id}`
                : `${API}/products`;
            const method = editingProduct ? "PUT" : "POST";

            const res = await fetchWithAuth(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    quantity: Number(form.quantity),
                    minStock: Number(form.minStock)
                })
            });

            const data = await res.json();   // 👈 always parse JSON
            console.log("SAVE RESPONSE:", data);

            if (!res.ok) throw new Error(data.error || "Failed to save product");

            Alert.alert("Success", editingProduct ? "Product updated!" : "Product added!");
            setModalVisible(false);
            setEditingProduct(null);
            setForm({ name: "", category: "", price: "", quantity: "", unit: "kg", minStock: "" });
            loadProducts();
        } catch (err) {
            Alert.alert("Error", err.message);
        }
    };

    // DELETE PRODUCT
    const deleteProduct = (id) => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to remove this product from the inventory permanently?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetchWithAuth(`${API}/products/${id}`, { method: "DELETE" });
                            if (res.ok) {
                                Alert.alert("Success", "Product removed");
                                loadProducts();
                            }
                        } catch (err) {
                            console.log("Delete error:", err);
                        }
                    }
                }
            ]
        );
    };


    const editProduct = (product) => {
        setEditingProduct(product);
        setForm(product);
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.productInfo}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.name}>{item.name}</Text>

                <View style={styles.detailRow}>
                    <MaterialIcons name="payments" size={16} color="#FF9933" />
                    <Text style={styles.detailText}>₹{item.price} / {item.unit}</Text>
                </View>

                <View style={styles.detailRow}>
                    <MaterialIcons name="inventory-2" size={16} color="#FF9933" />
                    <Text style={[styles.detailText, item.quantity <= item.minStock && styles.stockAlert]}>
                        Stock: {item.quantity} {item.unit}
                    </Text>
                </View>

                {item.quantity <= item.minStock && (
                    <View style={styles.detailRow}>
                        <MaterialIcons name="warning" size={16} color="#D32F2F" />
                        <Text style={[styles.detailText, styles.stockAlert]}>Critical Level Alert</Text>
                    </View>
                )}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => editProduct(item)}>
                    <MaterialIcons name="edit" size={20} color="#003366" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#FFEBEB" }]} onPress={() => deleteProduct(item._id)}>
                    <MaterialIcons name="delete-outline" size={20} color="#D32F2F" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.pageHeader}>
                    <Text style={styles.headerTitle}>Inventory Management</Text>
                    <MaterialIcons name="filter-list" size={24} color="#003366" />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#FF9933" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <MaterialIcons name="inventory" size={64} color="#E2E8F0" />
                                <Text style={styles.emptyText}>Empty Warehouse</Text>
                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <Text style={styles.emptySubText}>Add Supply Item</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )}
            </View>

            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                    setEditingProduct(null);
                    setForm({ name: "", category: "", price: "", quantity: "", unit: "kg", minStock: "" });
                    setModalVisible(true);
                }}
            >
                <MaterialIcons name="add" size={32} color="white" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingProduct ? "Revise Item" : "New Provision"}
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Product Name</Text>
                            <TextInput
                                placeholder="e.g. Premium Basmati"
                                style={styles.input}
                                value={form.name}
                                onChangeText={(t) => setForm({ ...form, name: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Category</Text>
                            <TextInput
                                placeholder="e.g. Grains"
                                style={styles.input}
                                value={form.category}
                                onChangeText={(t) => setForm({ ...form, category: t })}
                            />
                        </View>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Unit Price (₹)</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    style={styles.input}
                                    value={form.price.toString()}
                                    onChangeText={(t) => setForm({ ...form, price: t })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Unit</Text>
                                <TextInput
                                    placeholder="kg"
                                    style={styles.input}
                                    value={form.unit}
                                    onChangeText={(t) => setForm({ ...form, unit: t })}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Stock Level</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    style={styles.input}
                                    value={form.quantity.toString()}
                                    onChangeText={(t) => setForm({ ...form, quantity: t })}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Min Alert</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    style={styles.input}
                                    value={form.minStock.toString()}
                                    onChangeText={(t) => setForm({ ...form, minStock: t })}
                                />
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.buttonText, { color: "#666" }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={saveProduct}>
                                <Text style={[styles.buttonText, { color: "white" }]}>Save Record</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F7FB"
    },
    content: {
        padding: 16,
        paddingBottom: 100,
    },
    pageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 20,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        marginBottom: 24,
        borderBottomWidth: 3,
        borderBottomColor: "#FF9933",
    },
    headerTitle: {
        fontWeight: "900",
        color: "#003366",
        fontSize: 14,
        textTransform: "uppercase",
        letterSpacing: 1
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: "#EEF2F6",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    productInfo: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "900",
        color: "#003366",
        marginBottom: 4
    },
    categoryBadge: {
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: "flex-start",
        marginBottom: 12,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#003366",
        textTransform: "uppercase",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    detailText: {
        fontSize: 13,
        color: "#666",
        fontWeight: "700",
        marginLeft: 8,
    },
    stockAlert: {
        color: "#D32F2F",
    },
    actions: {
        flexDirection: "column",
        gap: 12
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    addBtn: {
        position: "absolute",
        right: 24,
        bottom: 24,
        backgroundColor: "#003366",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        borderWidth: 2,
        borderColor: "#FF9933",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 32,
        padding: 30,
        elevation: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: "#003366",
        textAlign: "center",
        marginBottom: 24,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: "800",
        color: "#666",
        marginBottom: 8,
        textTransform: "uppercase",
        marginLeft: 4,
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#EEF2F6",
        padding: 16,
        borderRadius: 16,
        fontSize: 15,
        fontWeight: "600",
        color: "#003366",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    saveBtn: {
        flex: 2,
        backgroundColor: "#003366",
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 16,
        elevation: 4,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: "#F1F5F9",
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 16,
    },
    empty: {
        alignItems: "center",
        marginTop: 100
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "900",
        color: "#003366",
        marginTop: 16
    },
    emptySubText: {
        fontSize: 14,
        color: "#FF9933",
        marginTop: 8,
        fontWeight: "800",
        textTransform: "uppercase",
    }
});
