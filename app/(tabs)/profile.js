import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const parsedUser = JSON.parse(storedUser);
        const res = await fetchWithAuth(`${API_BASE}/api/user/${parsedUser._id}`);

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(parsedUser);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  const profileFields = [
    user?.fullName, user?.email, user?.phone, user?.dateOfBirth,
    user?.aadhaarNumber, user?.rationCard, user?.members,
    user?.balance?.rice, user?.balance?.wheat,
  ];
  const completion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F7FB" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER SECTION */}
        <View style={styles.headerCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={50} color="white" />
            </View>
            <TouchableOpacity style={styles.editAvatar}>
              <MaterialIcons name="edit" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.fullName || "Guest User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "No email linked"}</Text>

          <View style={styles.completionContainer}>
            <View style={styles.completionLabelRow}>
              <Text style={styles.completionLabel}>Profile Integrity</Text>
              <Text style={styles.completionValue}>{completion}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completion}%` }]} />
            </View>
          </View>
        </View>

        {/* STATUS BANNER */}
        <View style={styles.statusBanner}>
          <MaterialIcons name="verified" size={20} color="white" />
          <Text style={styles.statusText}>VERIFIED RATION BENEFICIARY</Text>
        </View>

        {/* DETAILS SECTION */}
        <DetailSection title="Personal Identity" icon="badge">
          <DetailRow icon="cake" label="Birth Date" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"} />
          <DetailRow icon="phone" label="Contact" value={user?.phone || "N/A"} />
          <DetailRow icon="location-city" label="Residence" value={`${user?.city || "N/A"}, ${user?.country || "N/A"}`} />
          <DetailRow icon="history" label="Last Session" value={user?.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : "N/A"} />
        </DetailSection>

        <DetailSection title="Quota & Allocation" icon="shopping-basket">
          <DetailRow icon="inventory" label="Ration Card" value={user?.rationCard || "N/A"} />
          <DetailRow icon="fingerprint" label="Aadhaar" value={user?.aadhaarNumber ? user.aadhaarNumber.replace(/^(\d{4})\d{4}(\d{4})$/, "$1 **** $2") : "N/A"} />
          <DetailRow icon="groups" label="Household Size" value={`${user?.members || 0} Members`} />
          <DetailRow icon="scale" label="Current Balance" value={`Rice: ${user?.balance?.rice || 0}kg • Wheat: ${user?.balance?.wheat || 0}kg`} />
        </DetailSection>

        {/* MENU GRID */}
        <View style={styles.menuGrid}>
          <MenuTile icon="description" title="Documents" sub="ID & Residency" route="/documents" />
          <MenuTile icon="contact-support" title="Support" sub="Help & Grievance" route="/support" />
          <MenuTile icon="settings" title="Settings" sub="Privacy & UI" route="/settings" />
          <MenuTile icon="history" title="History" sub="Activity Log" route="/history" />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color="white" />
          <Text style={styles.logoutText}>Secure Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const DetailSection = ({ title, icon, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon} size={22} color="#003366" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <MaterialIcons name={icon} size={18} color="#64748B" />
    <View style={styles.detailTextWrapper}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const MenuTile = ({ icon, title, sub, route }) => {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.menuTile} onPress={() => router.push(route)}>
      <View style={styles.tileIconBox}>
        <MaterialIcons name={icon} size={24} color="#003366" />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      {sub && <Text style={styles.tileSub}>{sub}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FB" },
  loadingText: { fontSize: 16, fontWeight: "800", color: "#003366" },
  headerCard: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    borderBottomWidth: 6,
    borderBottomColor: "#FF9933",
    marginBottom: 20,
  },
  avatarWrapper: { marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    borderWidth: 4,
    borderColor: "#F1F5F9",
  },
  editAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF9933",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  userName: { fontSize: 24, fontWeight: "900", color: "#003366" },
  userEmail: { fontSize: 14, fontWeight: "600", color: "#64748B", marginTop: 4 },
  completionContainer: { width: "100%", marginTop: 24 },
  completionLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  completionLabel: { fontSize: 12, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
  completionValue: { fontSize: 12, fontWeight: "900", color: "#128807" },
  progressTrack: { height: 10, backgroundColor: "#E2E8F0", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#128807" },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#128807",
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  statusText: { color: "white", fontWeight: "900", fontSize: 12, marginLeft: 8, letterSpacing: 1 },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    borderLeftWidth: 6,
    borderLeftColor: "#003366",
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: "#003366", marginLeft: 12, textTransform: "uppercase" },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  detailTextWrapper: { marginLeft: 14 },
  detailLabel: { fontSize: 11, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
  detailValue: { fontSize: 15, fontWeight: "700", color: "#003366", marginTop: 2 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  menuTile: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    elevation: 4,
    borderBottomWidth: 4,
    borderBottomColor: "#EEF2F6",
  },
  tileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  tileTitle: { fontSize: 14, fontWeight: "900", color: "#003366" },
  tileSub: { fontSize: 10, fontWeight: "600", color: "#64748B", marginTop: 4, textAlign: "center" },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#D32F2F",
    padding: 18,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#D32F2F",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoutText: { color: "white", fontWeight: "900", fontSize: 16, marginLeft: 12, textTransform: "uppercase", letterSpacing: 1 }
});
