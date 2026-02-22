import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        let token = await AsyncStorage.getItem("accessToken");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!storedUser || !token) {
          console.warn("No stored user or token found");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const API_URL = "http://localhost:8000";

        let res = await fetch(`${API_URL}/api/auth/user/${parsedUser._id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.status === 401 && refreshToken) {
          const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            token = refreshData.accessToken;
            await AsyncStorage.setItem("accessToken", token);
            await AsyncStorage.setItem("refreshToken", refreshData.refreshToken);

            res = await fetch(`${API_URL}/api/auth/user/${parsedUser._id}`, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            });
          }
        }

        if (res.ok) {
          const data = await res.json();
          setMembers(data.memberDetails || []);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <FontAwesome name="users" size={18} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.sectionHeaderText}>Household Members</Text>
      </View>

      {/* Member Cards */}
      {members.map((m, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardRow}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{m.name[0].toUpperCase()}</Text>
            </View>

            {/* Details */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{m.name}</Text>
              <Text style={styles.detail}>Age: {m.age}</Text>
            </View>

            {/* Status Badge */}
            <View style={styles.statusBadge}>
              <FontAwesome name="check-circle" size={14} color="white" />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/add-member")}>
          <MaterialIcons name="person-add" size={20} color="white" />
          <Text style={styles.buttonText}>Add Member</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/update-member")}>
          <MaterialIcons name="edit" size={20} color="white" />
          <Text style={styles.buttonText}>Update Member Info</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#003366" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionHeaderText: { color: "white", fontSize: 16, fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardRow: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#003366", fontWeight: "bold", fontSize: 18 },

  name: { fontSize: 16, fontWeight: "bold", color: "#003366" },
  detail: { fontSize: 14, color: "#555", marginTop: 2 },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: { color: "white", fontWeight: "600", fontSize: 12, marginLeft: 4 },

  actions: { marginTop: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003366",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 10, fontSize: 16 },
});
