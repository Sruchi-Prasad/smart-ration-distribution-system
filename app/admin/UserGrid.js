import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import ManageUser from "./manageUser";

export default function UserGrid({ onBack }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // 🔧 Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/users`);
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
    const res = await fetchWithAuth(`${API_BASE}/api/admin/users/${id}/approveKYC`, {
      method: "POST"
    });
    if (res.ok) {
      alert("KYC approved!");
      fetchUsers();
    }
  };
  const editUser = (id) => { alert(`Edit user ${id} clicked`); };
  const resetPassword = async (id) => {
    const res = await fetchWithAuth(`${API_BASE}/api/admin/users/${id}/resetPassword`, {
      method: "POST"
    });
    if (res.ok) alert("Password reset!");
  };
  const deactivateUser = async (id) => {
    const res = await fetchWithAuth(`${API_BASE}/api/admin/users/${id}/deactivate`, {
      method: "POST"
    });
    if (res.ok) {
      alert("User deactivated!");
      fetchUsers();
    }
  };

  const assignStock = async (id) => {
    const rice = prompt("Enter Rice quantity to add (kg):", "50");
    const wheat = prompt("Enter Wheat quantity to add (kg):", "50");
    const sugar = prompt("Enter Sugar quantity to add (kg):", "20");
    const oil = prompt("Enter Oil quantity to add (L):", "10");

    if (rice === null || wheat === null || sugar === null || oil === null) return;

    try {
      const res = await fetchWithAuth(`${API_BASE}/api/admin/assign-stock`, {
        method: "POST",
        body: JSON.stringify({
          shopkeeperId: id,
          rice: Number(rice),
          wheat: Number(wheat),
          sugar: Number(sugar),
          oil: Number(oil)
        })
      });

      if (res.ok) {
        alert("✅ Stock assigned successfully!");
        fetchUsers();
      } else {
        const data = await res.json();
        alert(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("❌ Error assigning stock");
    }
  };

  // ✅ Now you can use these in JSX
  if (selectedUser) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedUser(null)}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#003366" />
            <Text style={styles.backText}>All Profiles</Text>
          </TouchableOpacity>
          <ManageUser
            user={selectedUser}
            onApproveKYC={() => approveKYC(selectedUser._id)}
            onEditUser={() => editUser(selectedUser._id)}
            onResetPassword={() => resetPassword(selectedUser._id)}
            onDeactivate={() => deactivateUser(selectedUser._id)}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="view-dashboard-outline" size={20} color="#003366" />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.pageHeader}>
          <Text style={styles.header}>Registry</Text>
          <View style={styles.headerUnderline} />
        </View>

        <View style={styles.grid}>
          {users.map(item => (
            <View key={item._id} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedUser(item)}
              >
                <View style={styles.profileRow}>
                  <View style={styles.avatarWrapper}>
                    <MaterialCommunityIcons
                      name="account-tie"
                      size={24}
                      color="#003366"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{item.fullName}</Text>
                    <View style={[styles.roleBadge, item.role === 'shopkeeper' && styles.shopBadge]}>
                      <Text style={[styles.roleText, item.role === 'shopkeeper' && styles.shopText]}>{item.role}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="email-outline" size={14} color="#999" />
                <Text style={styles.detail} numberOfLines={1}>{item.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="phone-outline" size={14} color="#999" />
                <Text style={styles.detail}>{item.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color="#999" />
                <Text style={styles.detail} numberOfLines={1}>{item.city}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.actions}>
                {item.kycStatus === "incomplete" && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => approveKYC(item._id)}
                  >
                    <Text style={[styles.buttonText, { color: "white" }]}>Verify KYC</Text>
                  </TouchableOpacity>
                )}

                {item.role === 'shopkeeper' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.successButton]}
                    onPress={() => assignStock(item._id)}
                  >
                    <MaterialCommunityIcons name="plus-circle-outline" size={14} color="white" />
                    <Text style={[styles.buttonText, { color: "white", marginLeft: 4 }]}>Add Stock</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.rowButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.accentButton, styles.halfButton]}
                    onPress={() => editUser(item._id)}
                  >
                    <Text style={[styles.buttonText, { color: "#003366" }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.accentButton, styles.halfButton]}
                    onPress={() => resetPassword(item._id)}
                  >
                    <Text style={[styles.buttonText, { color: "#003366" }]}>Pass</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, styles.destructiveButton]}
                  onPress={() => deactivateUser(item._id)}
                >
                  <Text style={[styles.buttonText, { color: "#DC2626" }]}>Deactivate</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 60,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
  avatarWrapper: {
    backgroundColor: "#E3F2FD",
    borderRadius: 50,
    padding: 8,
    marginRight: 10,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  shopBadge: {
    backgroundColor: "#FFF3E0",
  },
  roleText: {
    color: "#1565C0",
    fontSize: 12,
    fontWeight: "600",
  },
  shopText: {
    color: "#E65100",
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8
  },
  detail: {
    fontSize: 13,
    color: "#475569",
    flex: 1
  },
  actions: {
    marginTop: 10,
    gap: 8
  },
  actionButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: "#003366",
    borderColor: "#003366",
  },
  successButton: {
    backgroundColor: "#128807",
    borderColor: "#128807",
  },
  accentButton: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  destructiveButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
  },
  halfButton: {
    flex: 1,
  },
  rowButtons: {
    flexDirection: "row",
    gap: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 4
  },
  backText: { color: "#003366", fontSize: 16, fontWeight: "700" },
  pageHeader: { marginBottom: 20 },
  headerUnderline: { height: 4, width: 30, backgroundColor: "#FF9933", borderRadius: 2, marginTop: 4 },
  emptyText: { textAlign: "center", color: "#64748B", marginVertical: 40, fontWeight: "600" }
});
