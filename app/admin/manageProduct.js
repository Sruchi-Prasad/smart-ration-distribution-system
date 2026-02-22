import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { fetchWithAuth } from "../utils/fetchWithAuth";

const API = "http://localhost:8000/api";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: ""
  });

  // ✅ LOAD PRODUCTS
  const loadProducts = async () => {
    try {
      const res = await fetchWithAuth(`${API}/products`);
      const data = await res.json();
      setProducts(data.products || data);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ✅ SAVE PRODUCT
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
          name: form.name,
          price: Number(form.price),
          quantity: Number(form.quantity)
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save product");
      }

      Alert.alert("Success", editingProduct ? "Product updated!" : "Product added!");
      setModalVisible(false);
      setEditingProduct(null);
      setForm({ name: "", price: "", quantity: "" });
      loadProducts();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // DELETE PRODUCT
  const deleteProduct = (id) => {
    console.log("Attempting to delete product with ID:", id); // 👈 log ID
    Alert.alert("Delete", "Are you sure?", [
      {
        text: "Yes",
        onPress: async () => {
          try {
            const res = await fetchWithAuth(`${API}/products/${id}`, { method: "DELETE" });
            const data = await res.json();   // 👈 parse JSON
            console.log("DELETE RESPONSE:", data);

            if (!res.ok) throw new Error(data.error || `Delete failed with status ${res.status}`);

            Alert.alert("Success", "Product deleted!");
            loadProducts();
          } catch (err) {
            Alert.alert("Error", err.message);
            console.log("DELETE ERROR:", err);
          }
        }
      },
      { text: "Cancel" }
    ]);
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setForm(product);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text>Price: ₹{item.price}</Text>
        <Text>Stock: {item.quantity} kg</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => editProduct(item)}>
          <MaterialIcons name="edit" size={24} color="#1E88E5" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteProduct(item._id)}>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Products</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="inventory" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No products available</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingProduct(null);
                setModalVisible(true);
              }}
            >
              <Text style={styles.emptySubText}>Tap + to add your first product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => {
          setEditingProduct(null);
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.title}>
            {editingProduct ? "Edit Product" : "Add Product"}
          </Text>

          <TextInput
            placeholder="Product Name"
            style={styles.input}
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />

          <TextInput
            placeholder="Price"
            keyboardType="numeric"
            style={styles.input}
            value={form.price}
            onChangeText={(t) => setForm({ ...form, price: t })}
          />

          <TextInput
            placeholder="Quantity"
            keyboardType="numeric"
            style={styles.input}
            value={form.quantity}
            onChangeText={(t) => setForm({ ...form, quantity: t })}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveProduct}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={{ textAlign: "center", marginTop: 10 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2
  },
  name: { fontSize: 16, fontWeight: "bold" },
  actions: { flexDirection: "row", gap: 15 },
  addBtn: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#1E88E5",
    padding: 15,
    borderRadius: 50
  },
  modal: { flex: 1, padding: 20, justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8
  },
  saveBtn: {
    backgroundColor: "#1E88E5",
    padding: 15,
    alignItems: "center",
    borderRadius: 8
  },
  empty: { alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#666", marginTop: 10 },
  emptySubText: { fontSize: 14, color: "#999", marginTop: 5 }
});
