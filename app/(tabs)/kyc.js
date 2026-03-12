import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function KYC() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  const kycVerified = user?.kycStatus === "Verified";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification Status</Text>
        </View>

        {/* STATUS BANNER */}
        <View style={[styles.statusCard, kycVerified ? styles.verifiedBg : styles.pendingBg]}>
          <MaterialIcons name={kycVerified ? "verified" : "pending"} size={48} color="white" />
          <Text style={styles.statusTitle}>{kycVerified ? "IDENTITY VERIFIED" : "VERIFICATION PENDING"}</Text>
          <Text style={styles.statusSub}>
            {kycVerified
              ? "Your digital identity has been authenticated against Aadhaar and PDS records."
              : "Please ensure all documents are uploaded to avoid distribution delays."}
          </Text>
          {kycVerified && <View style={styles.certifiedSeal}><Text style={styles.sealText}>CERTIFIED</Text></View>}
        </View>

        {/* PERSONAL DOSSIER */}
        <KYCSection title="Personal Dossier" icon="assignment-ind">
          <InfoRow label="Full Name" value={user?.fullName || "N/A"} icon="person" />
          <InfoRow label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB') : "N/A"} icon="event" />
          <InfoRow label="Gender" value={"Male"} icon="wc" />
        </KYCSection>

        {/* CONTACT & SECURITY */}
        <KYCSection title="Contact & Security" icon="security">
          <InfoRow label="Phone Number" value={user?.phone || "N/A"} icon="phone-android" />
          <InfoRow label="Email Address" value={user?.email || "N/A"} icon="alternate-email" />
          <InfoRow label="Residential Address" value={`${user?.city || ""}, ${user?.country || ""}`} icon="map" />
        </KYCSection>

        {/* DOCUMENT METADATA */}
        <KYCSection title="Document Metadata" icon="file-present">
          <InfoRow label="Ration Card ID" value={user?.rationCard || "N/A"} icon="badge" />
          <InfoRow label="Aadhaar Reference" value={user?.aadhaarNumber ? user.aadhaarNumber.replace(/^(\d{4})\d{4}(\d{4})$/, "$1 **** $2") : "N/A"} icon="fingerprint" />
          <InfoRow label="Link Status" value="Securely Linked" icon="link" color="#128807" />
        </KYCSection>

        {/* RE-VERIFICATION ACTION */}
        {!kycVerified && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(tabs)/kycForm")}
          >
            <Text style={styles.actionText}>RE-UPLOAD DOCUMENTS</Text>
            <MaterialIcons name="file-upload" size={20} color="white" />
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const KYCSection = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon} size={20} color="#FF9933" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>
      {children}
    </View>
  </View>
);

const InfoRow = ({ label, value, icon, color = "#003366" }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconCircle}>
      <MaterialIcons name={icon} size={18} color="#64748B" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  backText: { marginLeft: 4, fontWeight: "800", color: "#003366", fontSize: 14 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", marginLeft: 20, textTransform: "uppercase", letterSpacing: 0.5 },

  statusCard: {
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  verifiedBg: { backgroundColor: "#128807" },
  pendingBg: { backgroundColor: "#FF9933" },
  statusTitle: { color: "white", fontSize: 22, fontWeight: "900", marginTop: 16, letterSpacing: 1 },
  statusSub: { color: "rgba(255,255,255,0.8)", textAlign: "center", fontSize: 13, fontWeight: "600", marginTop: 12, lineHeight: 20 },
  certifiedSeal: { position: "absolute", top: 20, right: 20, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sealText: { color: "white", fontSize: 9, fontWeight: "900", letterSpacing: 1 },

  section: {
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 20,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#003366", marginLeft: 12, textTransform: "uppercase", letterSpacing: 1 },
  sectionBody: { padding: 20 },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  infoContent: { marginLeft: 16 },
  infoLabel: { fontSize: 10, fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: "700", marginTop: 2 },

  actionBtn: {
    backgroundColor: "#003366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    elevation: 4,
  },
  actionText: { color: "white", fontWeight: "900", fontSize: 14, marginRight: 12, letterSpacing: 1 },
});
