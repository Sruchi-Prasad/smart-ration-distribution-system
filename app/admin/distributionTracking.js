import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const API = `${API_BASE}/api`;

export default function AdminDistribution() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ household: "", product: "", quantity: "" });

  const loadRecords = async () => {
    try {
      const res = await fetchWithAuth(`${API}/distribution`);
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const saveRecord = async () => {
    try {
      const res = await fetchWithAuth(`${API}/distribution`, {
        method: "POST",
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
      <Text style={styles.name}>{item.household?.fullName || "Unregistered Household"}</Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Beneficiary</Text>
        <Text style={styles.detailText}>{item.household?.fullName || "N/A"}</Text>
        <MaterialIcons name="person-outline" size={16} color="#FF9933" />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Shop</Text>
        <Text style={styles.detailText}>{item.shopkeeper?.shopName || item.shopkeeper?.fullName || "N/A"}</Text>
        <MaterialIcons name="storefront" size={16} color="#FF9933" />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Product</Text>
        <Text style={styles.detailText}>{item.product?.name || "N/A"}</Text>
        <MaterialIcons name="shopping-bag" size={16} color="#FF9933" />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Quantity</Text>
        <Text style={styles.detailText}>{item.quantity} {item.product?.unit || "Units"}</Text>
        <MaterialIcons name="balance" size={16} color="#FF9933" />
      </View>

      <View style={styles.divider} />
      <Text style={styles.dateText}>
        {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#003366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Distribution Ledger</Text>
          <MaterialIcons name="history" size={24} color="#003366" />
        </View>

        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="assignment-late" size={64} color="#E2E8F0" />
              <Text style={styles.emptyText}>No Active Records</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add-circle" size={24} color="white" />
        <Text style={styles.addBtnText}>Log Dispatch</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Dispatch Record</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Household Reference</Text>
                <TextInput
                  placeholder="Registration ID"
                  style={styles.input}
                  value={form.household}
                  onChangeText={(t) => setForm({ ...form, household: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Protocol</Text>
                <TextInput
                  placeholder="Product SKU / ID"
                  style={styles.input}
                  value={form.product}
                  onChangeText={(t) => setForm({ ...form, product: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Verified Quantity</Text>
                <TextInput
                  placeholder="0.00"
                  keyboardType="numeric"
                  style={styles.input}
                  value={form.quantity}
                  onChangeText={(t) => setForm({ ...form, quantity: t })}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.buttonText, { color: "#666" }]}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveRecord}>
                  <Text style={[styles.buttonText, { color: "white" }]}>Authorize</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    flex: 1,
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
  },
  name: {
    fontSize: 17,
    fontWeight: "900",
    color: "#003366",
    marginBottom: 12
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#999",
    textTransform: "uppercase",
    width: 80,
  },
  detailText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "700",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  dateText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "700",
    textAlign: "right",
  },
  addBtn: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: "#003366",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: "#FF9933",
  },
  addBtnText: {
    color: "white",
    fontWeight: "900",
    textTransform: "uppercase",
    marginLeft: 8,
    letterSpacing: 1,
    fontSize: 12,
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
    maxHeight: "90%",
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
  buttonText: {
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#003366",
    marginTop: 16,
    textTransform: "uppercase",
  }
});
