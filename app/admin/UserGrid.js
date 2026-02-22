import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ManageUser from "./manageUser";

export default function UserGrid({ onBack }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // 🔧 Fetch users
  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch("http://localhost:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
      else console.error("Fetch failed:", res.status, data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔧 Action handlers (outside useEffect!)
  const approveKYC = async (id) => {
    const token = await AsyncStorage.getItem("accessToken");
    const res = await fetch(`http://localhost:8000/api/admin/users/${id}/approveKYC`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert("KYC approved!");
      fetchUsers();
    }
  };
  const editUser = (id) => { alert(`Edit user ${id} clicked`); };
  const resetPassword = async (id) => {
    const token = await AsyncStorage.getItem("accessToken");
    const res = await fetch(`http://localhost:8000/api/admin/users/${id}/resetPassword`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) alert("Password reset!");
  };
  const deactivateUser = async (id) => {
    const token = await AsyncStorage.getItem("accessToken");
    const res = await fetch(`http://localhost:8000/api/admin/users/${id}/deactivate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert("User deactivated!");
      fetchUsers();
    }
  };

  // ✅ Now you can use these in JSX
  if (selectedUser) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedUser(null)}>
          <Text style={styles.backText}>← Back to Users</Text>
        </TouchableOpacity>
        <ManageUser
          user={selectedUser}
          onApproveKYC={() => approveKYC(selectedUser._id)}
          onEditUser={() => editUser(selectedUser._id)}
          onResetPassword={() => resetPassword(selectedUser._id)}
          onDeactivate={() => deactivateUser(selectedUser._id)}
        />
      </View>
    );
  }




  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </TouchableOpacity>
      <Text style={styles.header}>All Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setSelectedUser(item)} style={styles.profileRow}>
              <MaterialCommunityIcons name="account-circle" size={40} color="#003366" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.role}>{item.role}</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.detail}>📧 {item.email}</Text>
            <Text style={styles.detail}>📞 {item.phone}</Text>
            <Text style={styles.detail}>📍 {item.city}, {item.state}</Text>

            <View style={styles.actions}>
              {item.kycStatus === "incomplete" && (
                <TouchableOpacity style={styles.button} onPress={() => approveKYC(item._id)}>
                  <Text style={styles.buttonText}>Approve KYC</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.button} onPress={() => editUser(item._id)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => resetPassword(item._id)}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.deactivate]} onPress={() => deactivateUser(item._id)}>
                <Text style={styles.buttonText}>Deactivate</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", color: "#003366", marginBottom: 16 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  name: { fontSize: 18, fontWeight: "600" },
  role: { fontSize: 14, color: "#003366", marginBottom: 8 },
  detail: { fontSize: 12, color: "#444" },
  actions: { marginTop: 12 },
  button: {
    backgroundColor: "#003366",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  deactivate: { backgroundColor: "#B71C1C" },
  backButton: { marginBottom: 12 },
  backText: { color: "#1E88E5", fontSize: 16, fontWeight: "600" }
});
