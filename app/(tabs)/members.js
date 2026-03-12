import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const res = await fetchWithAuth(`${API_BASE}/api/auth/user/${parsedUser._id}`);

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

  if (loading) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Verifying Household...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Household Registry</Text>
        </View>

        {/* SUMMARY HERO */}
        <View style={styles.heroSummary}>
          <View style={styles.heroTop}>
            <MaterialIcons name="family-restroom" size={32} color="white" />
            <View style={styles.heroText}>
              <Text style={styles.heroLabel}>LINKED MEMBERS</Text>
              <Text style={styles.heroValue}>{members.length} INDIVIDUALS</Text>
            </View>
          </View>
          <View style={styles.heroBadge}>
            <MaterialIcons name="verified" size={14} color="#128807" />
            <Text style={styles.badgeText}>ELIBILITY VERIFIED</Text>
          </View>
        </View>

        {/* MEMBER LIST */}
        <Text style={styles.sectionLabel}>REGISTERED MEMBERS</Text>
        {members.map((m, index) => (
          <View key={index} style={styles.memberCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatarBox, { backgroundColor: index % 2 === 0 ? "#003366" : "#FF9933" }]}>
                <Text style={styles.avatarText}>{m.name[0].toUpperCase()}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.memberName}>{m.name}</Text>
                <View style={styles.metaRow}>
                  <MaterialIcons name="cake" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{m.age} Years Old</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (m.kycStatus !== "Verified") {
                    router.push({ pathname: "/(tabs)/kycForm", params: { memberId: m._id, memberName: m.name, memberAge: m.age, memberAadhaar: m.aadhaarNumber } });
                  }
                }}
                style={[
                  styles.statusBox,
                  { backgroundColor: m.kycStatus === "Verified" ? "#F0FDF4" : m.kycStatus === "Rejected" ? "#FEF2F2" : "#FFFBEB" }
                ]}
              >
                <View style={[
                  styles.statusDot,
                  { backgroundColor: m.kycStatus === "Verified" ? "#128807" : m.kycStatus === "Rejected" ? "#DC2626" : "#D97706" }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: m.kycStatus === "Verified" ? "#166534" : m.kycStatus === "Rejected" ? "#991B1B" : "#92400E" }
                ]}>
                  {m.kycStatus || "PENDING"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dashedLine} />

            <View style={styles.cardFooter}>
              <View style={styles.tag}>
                <MaterialIcons name="qr-code" size={12} color="#003366" />
                <Text style={styles.tagText}>AADHAAR LINKED</Text>
              </View>
              <TouchableOpacity style={styles.actionLink}>
                <Text style={styles.linkText}>DETAILS</Text>
                <MaterialIcons name="chevron-right" size={16} color="#FF9933" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ACTIONS */}
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => router.push("/add-member")}>
            <MaterialIcons name="person-add" size={24} color="white" />
            <View style={styles.btnTextWrapper}>
              <Text style={styles.btnMain}>ADD NEW MEMBER</Text>
              <Text style={styles.btnSub}>Expand household eligibility</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction} onPress={() => router.push("/update-member")}>
            <MaterialIcons name="edit" size={22} color="#003366" />
            <Text style={styles.secondaryBtnText}>MODIFY RECORD</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FB" },
  loadingText: { fontSize: 16, fontWeight: "900", color: "#003366" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  backText: { marginLeft: 4, fontWeight: "800", color: "#003366", fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", marginLeft: 20, textTransform: "uppercase", letterSpacing: 0.5 },

  heroSummary: {
    backgroundColor: "#003366",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    borderBottomWidth: 4,
    borderBottomColor: "#FF9933",
  },
  heroTop: { flexDirection: "row", alignItems: "center" },
  heroText: { marginLeft: 16 },
  heroLabel: { color: "#FF9933", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  heroValue: { color: "white", fontSize: 24, fontWeight: "900", marginTop: 4 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 16,
  },
  badgeText: { color: "white", fontSize: 9, fontWeight: "900", marginLeft: 6, letterSpacing: 1 },

  sectionLabel: { fontSize: 11, fontWeight: "900", color: "#64748B", marginBottom: 16, letterSpacing: 1.5, textTransform: "uppercase" },

  memberCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatarBox: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", elevation: 4 },
  avatarText: { color: "white", fontSize: 20, fontWeight: "900" },
  infoBox: { flex: 1, marginLeft: 16 },
  memberName: { fontSize: 16, fontWeight: "900", color: "#003366" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  metaText: { fontSize: 12, fontWeight: "700", color: "#64748B", marginLeft: 4 },
  statusBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0FDF4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#128807", marginRight: 6 },
  statusText: { fontSize: 9, fontWeight: "900", color: "#166534" },

  dashedLine: { height: 1, borderStyle: "dashed", borderWidth: 1, borderColor: "#E2E8F0", marginVertical: 16 },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 9, fontWeight: "900", color: "#64748B", marginLeft: 4 },
  actionLink: { flexDirection: "row", alignItems: "center" },
  linkText: { fontSize: 10, fontWeight: "900", color: "#FF9933", marginRight: 4 },

  actionsBox: { marginTop: 10, marginBottom: 20 },
  primaryAction: {
    backgroundColor: "#003366",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 4,
  },
  btnTextWrapper: { marginLeft: 16 },
  btnMain: { color: "white", fontSize: 15, fontWeight: "900", letterSpacing: 0.5 },
  btnSub: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "600", marginTop: 2 },

  secondaryAction: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    elevation: 2,
  },
  secondaryBtnText: { color: "#003366", fontSize: 12, fontWeight: "900", marginLeft: 10, letterSpacing: 1 },
});
