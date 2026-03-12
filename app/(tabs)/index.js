import { Entypo, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import RationCard from "../(tabs)/RationCard";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const Index = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [expandedSections, setExpandedSections] = useState(["info"]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notificationsData, setNotificationsData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const scrollX = useState(new Animated.Value(0))[0];

  const pdsImages = [
    {
      source: require("../../assets/images/distributionCenter.jpg"),
      caption: "Streamlined Grain Distribution",
    },
    {
      source: require("../../assets/images/newCard.jpg"),
      caption: "Modern Counter Operations",
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [notifRes, statsRes] = await Promise.all([
          fetchWithAuth(`${API_BASE}/api/auth/notifications`),
          fetchWithAuth(`${API_BASE}/api/analytics/stats`)
        ]);

        if (notifRes.ok) {
          const data = await notifRes.json();
          if (data.length > 0) setNotificationsData(data.map(n => n.body));
        }

        if (statsRes.ok) {
          setStatsData(await statsRes.json());
        }
      } catch (err) {
        console.log("Dashboard data fetch error");
      } finally {
        setLoadingStats(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % pdsImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const screenWidth = Dimensions.get("window").width;
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: -screenWidth,
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(scrollX, {
          toValue: screenWidth,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const tickerText = (notificationsData.length > 0 ? notificationsData : [
    "Next distribution starts on 20 Jan 2026",
    "New ration policy update released",
    "KYC verification deadline: 25 Jan 2026",
    "Rice stock available from tomorrow"
  ]).join("   ✦   ") + "   ✦   ";

  const DropdownSection = ({ title, sectionKey, items, expandedSections, setExpandedSections }) => {
    const isExpanded = expandedSections.includes(sectionKey);
    const toggleSection = () => {
      setExpandedSections(isExpanded ? expandedSections.filter(k => k !== sectionKey) : [...expandedSections, sectionKey]);
    };

    return (
      <View style={styles.dropdownCard}>
        <TouchableOpacity onPress={toggleSection} style={styles.dropdownHeader}>
          <Text style={styles.dropdownTitle}>{title}</Text>
          <Entypo name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#003366" />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.dropdownContent}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.portalButton}
                onPress={() => router.push(item.route)}
              >
                <View style={[styles.portalIconBox, { backgroundColor: `${item.color}15` }]}>
                  {item.icon}
                </View>
                <Text style={styles.portalText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* TICKER */}
        <View style={styles.tickerBanner}>
          <MaterialIcons name="campaign" size={20} color="white" />
          <View style={styles.tickerOverflow}>
            <Animated.View style={{ flexDirection: "row", flexWrap: "nowrap", transform: [{ translateX: scrollX }] }}>
              <Text style={styles.tickerText}>{tickerText}</Text>
              <Text style={styles.tickerText}>{tickerText}</Text>
            </Animated.View>
          </View>
        </View>

        <RationCard />

        <View style={[styles.mainLayout, { flexDirection: isMobile ? "column" : "row" }]}>

          {/* LEFT: NAVIGATION */}
          <View style={[styles.sideColumn, { width: isMobile ? "100%" : "30%" }]}>
            <DropdownSection
              title="Identity & Entitlements"
              sectionKey="info"
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              items={[
                { label: "Ration Balance", icon: <MaterialCommunityIcons name="scale-balance" size={20} color="#003366" />, color: "#003366", route: "/balance" },
                { label: "History Log", icon: <MaterialIcons name="history" size={20} color="#003366" />, color: "#003366", route: "/history" },
              ]}
            />
            <DropdownSection
              title="Citizen Services"
              sectionKey="actions"
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              items={[
                { label: "Submit Feedback", icon: <MaterialIcons name="rate-review" size={20} color="#FF9933" />, color: "#FF9933", route: "/feedback" },
                { label: "KYC Verification", icon: <MaterialIcons name="verified-user" size={20} color="#128807" />, color: "#128807", route: "/kyc" },
                { label: "Marketplace", icon: <MaterialIcons name="shopping-bag" size={20} color="#003366" />, color: "#003366", route: "/Marketplace" },
                { label: "Shop Locator", icon: <MaterialIcons name="map" size={20} color="#003366" />, color: "#003366", route: "/ShopLocator" },
              ]}
            />
            <DropdownSection
              title="Household Intelligence"
              sectionKey="household"
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              items={[
                { label: "Family Directory", icon: <MaterialIcons name="groups" size={20} color="#003366" />, color: "#003366", route: "/members" },
                { label: "Product Catalog", icon: <MaterialIcons name="inventory-2" size={20} color="#003366" />, color: "#003366", route: "/productDetail" },
                { label: "Global Alerts", icon: <MaterialIcons name="notifications-active" size={20} color="#D32F2F" />, color: "#D32F2F", route: "/announcements" },
              ]}
            />
          </View>

          {/* CENTER: ANALYTICS & GALLERY */}
          <View style={[styles.centerColumn, { width: isMobile ? "100%" : "40%" }]}>
            {statsData && statsData.type === "user" && (
              <View style={styles.premiumCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="trending-up" size={20} color="#003366" />
                  <Text style={styles.cardTitle}>Monthly Consumption</Text>
                </View>
                <LineChart
                  data={statsData.consumptionTrend}
                  width={width * (isMobile ? 0.85 : 0.36)}
                  height={200}
                  chartConfig={lineChartConfig}
                  bezier
                  style={styles.chart}
                />
                <View style={styles.statsSummary}>
                  <View style={styles.statChip}>
                    <Text style={styles.chipValue}>₹{statsData.summary.totalSaved}</Text>
                    <Text style={styles.chipLabel}>Subsidies Saved</Text>
                  </View>
                  <View style={[styles.statChip, { backgroundColor: "#FFEBEB" }]}>
                    <Text style={[styles.chipValue, { color: "#D32F2F" }]}>{statsData.summary.activeReminders}</Text>
                    <Text style={styles.chipLabel}>Alerts</Text>
                  </View>
                </View>
              </View>
            )}

            {statsData && statsData.type === "user" && (
              <View style={styles.premiumCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="pie-chart" size={20} color="#003366" />
                  <Text style={styles.cardTitle}>Entitlement Usage</Text>
                </View>
                <View style={styles.progressRow}>
                  {statsData.entitlementStats.map((stat, i) => (
                    <View key={i} style={styles.progressItem}>
                      <ProgressChart
                        data={[stat.current / stat.total]}
                        width={80}
                        height={80}
                        strokeWidth={6}
                        radius={28}
                        chartConfig={{
                          backgroundColor: "#fff",
                          backgroundGradientFrom: "#fff",
                          backgroundGradientTo: "#fff",
                          color: (opacity = 1) => stat.color,
                        }}
                        hideLegend={true}
                      />
                      <Text style={styles.statName}>{stat.name}</Text>
                      <Text style={styles.statValue}>{stat.current}/{stat.total} kg</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.galleryCard}>
              <Image
                source={pdsImages[currentIndex].source}
                style={[styles.galleryImage, { height: isMobile ? 220 : 280 }]}
              />
              <View style={styles.galleryOverlay}>
                <Text style={styles.galleryCaption}>{pdsImages[currentIndex].caption}</Text>
              </View>
            </View>
          </View>

          {/* RIGHT: INFO TILES */}
          <View style={[styles.sideColumn, { width: isMobile ? "100%" : "30%" }]}>
            <InfoTile
              icon="qr-code"
              title="Digital Ration Card"
              details={["ID: MH-2026-00123", "Members: 4 Individuals"]}
              action="Download PDF"
            />
            <InfoTile
              icon="event-available"
              title="Next Pickup Cycle"
              details={["20 Jan 2026 - 25 Jan 2026", "Status: Scheduled"]}
              color="#128807"
            />
            <InfoTile
              icon="contact-support"
              title="Institutional Support"
              details={["Toll Free: 1800-456-789", "Email: help@ration.gov"]}
              action="Open Ticket"
              color="#003366"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoTile = ({ icon, title, details, action, color = "#FF9933" }) => (
  <View style={[styles.infoTile, { borderLeftColor: color }]}>
    <View style={styles.tileLead}>
      <MaterialIcons name={icon} size={24} color="#003366" />
      <Text style={styles.tileTitle}>{title}</Text>
    </View>
    <View style={styles.tileDetails}>
      {details.map((d, i) => <Text key={i} style={styles.tileDetailText}>{d}</Text>)}
    </View>
    {action && (
      <TouchableOpacity style={styles.tileAction}>
        <Text style={styles.tileActionText}>{action} →</Text>
      </TouchableOpacity>
    )}
  </View>
);

const lineChartConfig = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#F8FAFC",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "5", strokeWidth: "2", stroke: "#FF9933" }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  tickerBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
  },
  tickerOverflow: { flex: 1, overflow: "hidden", marginLeft: 12 },
  tickerText: {
    color: "white",
    fontWeight: "900",
    fontSize: 13,
    marginRight: 40,
    textTransform: "uppercase",
    whiteSpace: "nowrap", // For web
  },
  mainLayout: { gap: 24, marginTop: 16 },
  sideColumn: { gap: 16 },
  centerColumn: { gap: 20 },
  dropdownCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: "#003366",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#003366",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dropdownContent: {
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#EEF2F6",
  },
  portalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  portalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  portalText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#003366",
  },
  premiumCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#003366",
    marginLeft: 10,
    textTransform: "uppercase",
  },
  chart: { borderRadius: 16, marginVertical: 8 },
  statsSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  statChip: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  chipValue: { fontSize: 16, fontWeight: "900", color: "#003366" },
  chipLabel: { fontSize: 9, fontWeight: "800", color: "#64748B", textTransform: "uppercase", marginTop: 2 },
  progressRow: { flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap", gap: 10 },
  progressItem: { alignItems: "center", minWidth: 100 },
  statName: { fontSize: 11, fontWeight: "900", color: "#003366", marginTop: 4, textTransform: "uppercase" },
  statValue: { fontSize: 10, color: "#64748B", fontWeight: "700" },
  galleryCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
  },
  galleryImage: { width: "100%", resizeMode: "cover" },
  galleryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 51, 102, 0.7)",
    padding: 12,
  },
  galleryCaption: { color: "white", fontWeight: "800", fontSize: 14, textAlign: "center" },
  infoTile: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 6,
    elevation: 4,
  },
  tileLead: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  tileTitle: { fontSize: 15, fontWeight: "900", color: "#003366", marginLeft: 10 },
  tileDetails: { marginBottom: 12 },
  tileDetailText: { fontSize: 13, color: "#64748B", fontWeight: "600", marginBottom: 4 },
  tileAction: { borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 },
  tileActionText: { fontSize: 12, fontWeight: "900", color: "#003366", textTransform: "uppercase" }
});

export default Index;
