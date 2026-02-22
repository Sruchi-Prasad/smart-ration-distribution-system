import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileFields = [
    user?.fullName,
    user?.email,
    user?.phone,
    user?.dateOfBirth,
    user?.aadhaarNumber,
    user?.rationCard,
    user?.members,
    user?.balance?.rice,
    user?.balance?.wheat,
  ];

  const filledCount = profileFields.filter(Boolean).length;
  const completion = Math.round((filledCount / profileFields.length) * 100);
  // 🔹 Fetch user + family members from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        const token = await AsyncStorage.getItem("accessToken");
        if (!storedUser || !token) return;

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const res = await fetch(`http://localhost:8000/api/user/${parsedUser._id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        useEffect(() => {
          const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            console.log("Loaded user from AsyncStorage:", storedUser);
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          };
          loadUser();
        }, []);

        if (res.ok) {
          const data = await res.json();
          setUser(data); // ✅ includes members array
        } else {
          console.error("Failed to fetch user:", res.status);
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
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("accessToken");
    router.replace("/login");
  };

  if (loading) {
    return <Text style={{ textAlign: "center", marginTop: 20 }}>Loading profile...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.card}>
          {/* Emblem + Portal Title */}
          <View style={styles.headerRow}>
            <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
            <Text style={styles.portalTitle}>SMART RATION DISTRIBUTION SYSTEM</Text>
          </View>

          {/* Status Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerText}>✅ Eligible for January Distribution</Text>

          </View>

          {/* Avatar + Name + Email */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <FontAwesome name="user" size={40} color="#fff" />
            </View>
            <Text style={styles.name}>{user?.fullName || "Name not available"}</Text>
            <Text style={styles.email}>{user?.email || "Email not available"}</Text>
          </View>

          <View style={{ marginBottom: 20, alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Profile Completion: {completion}%
            </Text>
            <View style={{
              height: 10,
              width: "80%",
              backgroundColor: "#ddd",
              borderRadius: 5,
              marginTop: 8,
              overflow: "hidden"
            }}>
              <View style={{
                height: "100%",
                width: `${completion}%`,
                backgroundColor: "#4CAF50",
              }} />
            </View>
          </View>


          {/* Header */}
          {/* Personal Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="user" size={20} color="#030356" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={18} color="#555" />
              <Text style={styles.detail}>Date-Of-Birth :
                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={18} color="#555" />
              <Text style={styles.detail}>Phone-no :  {user?.phone || "Not provided"}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={18} color="#555" />
              <Text style={styles.detail}>Country :
                {user?.city || "Not provided"}, {user?.country || "Not provided"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={18} color="#555" />
              <Text style={styles.detail}>Last Login :
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Not available"}
              </Text>
            </View>

          </View>

          {/* Document Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="id-card" size={20} color="#030356" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Document Information</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="credit-card" size={18} color="#555" />
              <Text style={styles.detail}> Ration Card no. : {user?.rationCard || "Not provided"}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="fingerprint" size={18} color="#555" />
              <Text style={styles.detail}>Aadhaar card no. : {user?.aadhaarNumber
                ? user.aadhaarNumber.replace(/^(\d{4})\d{4}(\d{4})$/, "$1 **** $2")
                : "Not provided"}
              </Text>

            </View>
          </View>

          {/* Household Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="users" size={20} color="#030356" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Household Information</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome name="users" size={18} color="#555" />
              <Text style={styles.detail}>Members:  {user?.members || "Not provided"} members</Text>
            </View>
          </View>

          {/* Distribution Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="inventory" size={20} color="#030356" style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>Distribution Information</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="inventory" size={18} color="#555" />
              <Text style={styles.detail}>
                Rice: {user?.balance?.rice || 0}kg, Wheat: {user?.balance?.wheat || 0}kg
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="event" size={18} color="#555" />
              <Text style={styles.detail}>Last Distribution: {user?.lastDistribution
                ? new Date(user.lastDistribution).toLocaleDateString()
                : "Not distributed yet"}
              </Text>
            </View>
          </View>
        </View>
        {/* Family Members Section */}
        {Array.isArray(user?.memberDetails) && user.memberDetails.map(
          (member, index) => (
            <View key={index} style={styles.memberRow}>
              <View style={styles.avatarCircle}>
                <FontAwesome name="user" size={22} color="#fff" />
                <Text style={styles.avatarText}>{member.initials}</Text>
              </View>
              <View>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberDetail}>
                  {member.relation} • {member.age} yrs
                </Text>
              </View>
            </View>
          ))}

        {/* Navigation Tiles */}
        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuTile} onPress={() => router.push("/documents")}>
            <MaterialIcons name="description" size={24} color="#030356" />
            <Text style={styles.tileText}>Documents</Text>
            <Text style={styles.tileSubText}>View & upload documents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuTile} onPress={() => router.push("/support")}>
            <Feather name="help-circle" size={24} color="#030356" />
            <Text style={styles.tileText}>Help & Support</Text>
            <Text style={styles.tileSubText}>FAQs and grievance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuTile} onPress={() => router.push("/settings")}>
            <MaterialIcons name="settings" size={24} color="#030356" />
            <Text style={styles.tileText}>Settings</Text>
            <Text style={styles.tileSubText}>App preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuTile} onPress={() => router.push("/")}>
            <Feather name="home" size={24} color="#030356" />
            <Text style={styles.tileText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuTile} onPress={() => router.push("/history")}>
            <MaterialIcons name="history" size={24} color="#030356" />
            <Text style={styles.tileText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuTile} onPress={() => router.push("/update-info")}>
            <Feather name="edit" size={24} color="#030356" />
            <Text style={styles.tileText}>Update Info</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 15 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 20, elevation: 4 },

  memberRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#030356", justifyContent: "center", alignItems: "center",
    marginRight: 10
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  memberName: { fontSize: 16, fontWeight: "600", color: "#222" },
  memberDetail: { fontSize: 14, color: "#555" },

  menuGrid: { marginTop: 20 },
  menuTile: { backgroundColor: "#E3F2FD", borderRadius: 10, padding: 15, marginBottom: 15 },
  tileText: { fontSize: 16, fontWeight: "600", color: "#030356" },
  tileSubText: { fontSize: 12, color: "#555", marginTop: 4 },

  logoutButton: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    backgroundColor: "#E53935", borderRadius: 10, padding: 15, marginTop: 20
  },
  logoutText: { color: "white", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 15 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  portalTitle: { fontSize: 16, fontWeight: "bold", color: "#003366" },
  banner: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 8, marginBottom: 10 },
  bannerText: { color: "white", fontWeight: "600", textAlign: "center" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 15, color: "#030356" },
  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatar: { backgroundColor: "#030356", width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold" },
  email: { fontSize: 14, color: "#555" },
  section: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: "#ddd" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#030356" },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  detail: { fontSize: 16, color: "#222", marginLeft: 6 },
  divider: { height: 1, backgroundColor: "#ccc", marginVertical: 10 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 10, paddingBottom: 20 },
  menuTile: { width: "48%", backgroundColor: "#E3F2FD", borderRadius: 10, paddingVertical: 15, paddingHorizontal: 10, marginBottom: 10, alignItems: "center", elevation: 2 },
  tileText: { marginTop: 5, fontSize: 14, fontWeight: "600", color: "#030356" },
});
