import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const API = "http://localhost:8000/api";

export default function AdminDistribution() {
  const [records, setRecords] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ household: "", product: "", quantity: "" });

  const loadRecords = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${API}/distribution`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const saveRecord = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${API}/distribution`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          household: form.household,
          product: form.product,
          quantity: Number(form.quantity)
        })
      });
      if (!res.ok) throw new Error("Failed to save record");
      Alert.alert("Success", "Distribution recorded!");
      setModalVisible(false);
      setForm({ household: "", product: "", quantity: "" });
      loadRecords();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>Household: {item.household?.name}</Text>
      <Text>Product: {item.product?.name}</Text>
      <Text>Quantity: {item.quantity}</Text>
      <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distribution Records</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No records yet</Text>}
      />

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={{ color: "white", fontWeight: "bold" }}>+ Add Record</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.title}>Add Distribution Record</Text>
          <TextInput placeholder="Household ID" style={styles.input} value={form.household}
            onChangeText={(t) => setForm({ ...form, household: t })} />
          <TextInput placeholder="Product ID" style={styles.input} value={form.product}
            onChangeText={(t) => setForm({ ...form, product: t })} />
          <TextInput placeholder="Quantity" keyboardType="numeric" style={styles.input} value={form.quantity}
            onChangeText={(t) => setForm({ ...form, quantity: t })} />

          <TouchableOpacity style={styles.saveBtn} onPress={saveRecord}>
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
  card: { backgroundColor: "white", padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2 },
  name: { fontSize: 16, fontWeight: "bold" },
  addBtn: { position: "absolute", right: 20, bottom: 20, backgroundColor: "#1E88E5", padding: 15, borderRadius: 50 },
  modal: { flex: 1, padding: 20, justifyContent: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 12, borderRadius: 8 },
  saveBtn: { backgroundColor: "#1E88E5", padding: 15, alignItems: "center", borderRadius: 8 }
});
