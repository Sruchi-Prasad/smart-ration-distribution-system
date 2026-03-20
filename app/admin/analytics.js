import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BarChart,
  LineChart,
  PieChart,
} from "react-native-chart-kit";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const screenWidth = Dimensions.get("window").width;

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/analytics`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData({
          totals: { totalUsers: 0, totalShops: 0, totalProducts: 0, totalFeedback: 0, totalComplaints: 0 },
          feedbackStats: [],
          topComplaintShops: []
        });
      }
    } catch (err) {
      console.error("Analytics fetch fail:", err);
    }
  };

  if (!data) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF9933" />
      <Text style={styles.loadingText}>Syncing Data...</Text>
    </View>
  );

  const totals = data.totals || { totalUsers: 0, totalShops: 0, totalProducts: 0, totalFeedback: 0, totalComplaints: 0 };
  const feedbackStats = data.feedbackStats || [];
  const topComplaintShops = data.topComplaintShops || [];
  const distributionTrends = data.distributionTrends || [];

  /* DONUT DATA */
  const pieData = feedbackStats.map((item, index) => ({
    name: item._id,
    population: item.count,
    color: ["#003366", "#FF9933", "#128807", "#D32F2F"][index % 4],
    legendFontColor: "#666",
    legendFontSize: 12,
  }));

  /* BAR DATA */
  const barData = {
    labels: topComplaintShops.map((s) => s.shopName.substring(0, 6)),
    datasets: [{ data: topComplaintShops.map((s) => s.complaints) }],
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendLabels = distributionTrends?.length > 0
    ? distributionTrends.map(t => monthNames[t._id - 1])
    : ["No Data"];
  const trendData = distributionTrends?.length > 0
    ? distributionTrends.map(t => t.count)
    : [0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>System Analytics</Text>
          <MaterialIcons name="insights" size={24} color="#FF9933" />
        </View>
        <Text style={styles.subtitle}>Intelligence Overview — Real-time Governance</Text>
      </View>

      {/* STATS GRID */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard icon="people" title="Users" value={totals.totalUsers} color="#003366" />
          <StatCard icon="storefront" title="Shops" value={totals.totalShops} color="#FF9933" />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="inventory-2" title="Products" value={totals.totalProducts} color="#128807" />
          <StatCard icon="forum" title="Feedback" value={totals.totalFeedback} color="#003366" />
        </View>
        <StatCard icon="warning" title="Critical Complaints" value={totals.totalComplaints} color="#D32F2F" full />
      </View>

      {/* CHARTS */}
      <View style={styles.chartSection}>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialIcons name="pie-chart" size={20} color="#003366" />
            <Text style={styles.chartTitle}>Sentiment Spectrum</Text>
          </View>
          <DonutChart data={pieData} total={totals.totalFeedback} />
          <TouchableOpacity 
            style={styles.detailBtn}
            onPress={() => router.push("/admin/reportReview")}
          >
            <Text style={styles.detailBtnText}>View Detailed Reports</Text>
            <MaterialIcons name="chevron-right" size={18} color="#003366" />
          </TouchableOpacity>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialIcons name="bar-chart" size={20} color="#003366" />
            <Text style={styles.chartTitle}>Shop Performance (Complaints)</Text>
          </View>
          <BarChart
            data={barData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
          />
        </View>

        <View style={[styles.chartCard, { marginBottom: 40 }]}>
          <View style={styles.chartHeader}>
            <MaterialIcons name="trending-up" size={20} color="#003366" />
            <Text style={styles.chartTitle}>Governance Thresholds</Text>
          </View>
          <LineChart
            data={{
              labels: trendLabels,
              datasets: [{ data: trendData }]
            }}
            width={screenWidth - 64}
            height={200}
            chartConfig={lineChartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const StatCard = ({ icon, title, value, color, full }) => (
  <View style={[styles.statCard, full && { width: "100%" }]}>
    <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
      <MaterialIcons name={icon} size={20} color={color} />
    </View>
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  </View>
);

const DonutChart = ({ data, total }) => (
  <View style={{ alignItems: "center", paddingVertical: 20 }}>
    <View style={{ position: "relative" }}>
      <PieChart
        data={data}
        width={screenWidth - 64}
        height={200}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        hasLegend={true}
        center={[10, 0]}
        absolute
      />
    </View>
  </View>
);

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
};

const lineChartConfig = {
  ...chartConfig,
  backgroundGradientFrom: "#003366",
  backgroundGradientTo: "#005599",
  color: (opacity = 1) => `rgba(255, 153, 51, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#003366", fontWeight: "900", letterSpacing: 1 },
  header: {
    backgroundColor: "#003366",
    padding: 24,
    paddingTop: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 10,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  subtitle: {
    color: "#BBDEFB",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    padding: 16,
    marginTop: -20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#003366",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#999",
    textTransform: "uppercase",
  },
  chartSection: {
    padding: 16,
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#003366",
    marginLeft: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  detailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#F0F4F8",
    borderRadius: 12,
    marginTop: 10,
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#003366",
    textTransform: "uppercase",
    marginRight: 4,
  }
});
