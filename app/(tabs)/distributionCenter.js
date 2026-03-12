import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DistributionCenterPage = () => {
  const centers = [
    { name: "Fair Price Shop-124 (West)", distance: "0.8 km", status: "Open", hours: "09:00 AM - 06:00 PM", stock: "High" },
    { name: "Government Grain Outlet-A", distance: "1.5 km", status: "Closing Soon", hours: "10:00 AM - 04:00 PM", stock: "Medium" },
    { name: "Suman Ration Center", distance: "2.3 km", status: "Closed", hours: "09:00 AM - 05:00 PM", stock: "Low" },
    { name: "City Ration Hub (South)", distance: "3.1 km", status: "Open", hours: "08:00 AM - 08:00 PM", stock: "High" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Distribution Centers</Text>
        <TouchableOpacity style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" />
          <Text style={styles.placeholderText}>Search by area or pincode...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Map Placeholder */}
        <View style={styles.mapCard}>
          <MaterialIcons name="map" size={50} color="#003366" />
          <Text style={styles.mapText}>Interactive Map View Integration</Text>
          <TouchableOpacity style={styles.mapBtn}>
            <Text style={styles.mapBtnText}>Near Me</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Centers Near You</Text>
        {centers.map((center, index) => (
          <TouchableOpacity key={index} style={styles.centerCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.centerName}>{center.name}</Text>
                <View style={styles.row}>
                  <MaterialIcons name="location-pin" size={14} color="#FF9933" />
                  <Text style={styles.distance}>{center.distance}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, center.status === "Open" ? styles.bgSuccess : center.status === "Closed" ? styles.bgDanger : styles.bgWarning]}>
                <Text style={styles.statusText}>{center.status}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Hours</Text>
                <Text style={styles.infoValue}>{center.hours}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Stock</Text>
                <Text style={[styles.infoValue, { color: center.stock === "High" ? "#128807" : "#FF9933" }]}>{center.stock}</Text>
              </View>
              <TouchableOpacity style={styles.navBtn}>
                <FontAwesome name="send" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DistributionCenterPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  header: {
    backgroundColor: "#003366",
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#003366",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "white", textTransform: "uppercase", letterSpacing: 1 },
  searchBar: {
    backgroundColor: "white",
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  placeholderText: { marginLeft: 10, color: "#999", fontWeight: "600" },
  mapCard: {
    backgroundColor: "#E1F5FE",
    height: 180,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#003366",
    borderStyle: "dashed",
  },
  mapText: { marginTop: 10, fontSize: 13, color: "#003366", fontWeight: "700" },
  mapBtn: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "#003366",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  mapBtnText: { color: "white", fontWeight: "800", fontSize: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  centerCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  centerName: { fontSize: 16, fontWeight: "800", color: "#003366" },
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  distance: { fontSize: 12, color: "#666", marginLeft: 4, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "900", color: "white", textTransform: "uppercase" },
  bgSuccess: { backgroundColor: "#128807" },
  bgDanger: { backgroundColor: "#D32F2F" },
  bgWarning: { backgroundColor: "#FF9933" },
  divider: { height: 1, backgroundColor: "#EEF2F6", marginVertical: 14 },
  cardFooter: { flexDirection: "row", alignItems: "center" },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: "800", color: "#999", textTransform: "uppercase" },
  infoValue: { fontSize: 12, fontWeight: "700", color: "#444", marginTop: 2 },
  navBtn: { backgroundColor: "#FF9933", width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", elevation: 4 },
});
