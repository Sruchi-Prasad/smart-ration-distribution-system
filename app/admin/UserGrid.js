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
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedUser(item)}
            >
              <View style={styles.profileRow}>
                <MaterialCommunityIcons
                  name="account"
                  size={36}
                  color="#1565C0"
                />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{item.role}</Text>
                  </View>
                </View>
              </View>

            </TouchableOpacity>
            <Text style={styles.detail}>📧 {item.email}</Text>
            <Text style={styles.detail}>📞 {item.phone}</Text>
            <Text style={styles.detail}>📍 {item.city}, {item.state}</Text>
            <View style={styles.divider} />
            <View style={styles.actions}>

              {item.kycStatus === "incomplete" && (
                <TouchableOpacity
                  style={[styles.button, styles.fullButton]}
                  onPress={() => approveKYC(item._id)}
                >
                  <Text style={styles.buttonText}>Approve KYC</Text>
                </TouchableOpacity>
              )}

              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => editUser(item._id)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => resetPassword(item._id)}
                >
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, styles.deactivate, styles.fullButton]}
                onPress={() => deactivateUser(item._id)}
              >
                <Text style={styles.deactivateText}>Deactivate</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 18,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  avatar: {
    backgroundColor: "#DBEAFE",
    borderRadius: 50,
    padding: 10,
    marginRight: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  role: {
    fontSize: 13,
    color: "#1E88E5",
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },

  roleText: {
    color: "#1565C0",
    fontSize: 12,
    fontWeight: "600",
  },

  detail: {
    fontSize: 13,
    color: "#475569",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    width: "48%",
    backgroundColor: "#1E3A8A",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  deactivate: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  deactivateText: {
    color: "#DC2626",
    fontWeight: "700",
  },
  backButton: { marginBottom: 12 },
  backText: { color: "#1E88E5", fontSize: 16, fontWeight: "600" },
  actions: {
    marginTop: 10,
  },

  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  button: {
    flex: 1,
    backgroundColor: "#1E3A8A",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  fullButton: {
    width: "100%",
    marginTop: 8,
  },

  rowButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
});
