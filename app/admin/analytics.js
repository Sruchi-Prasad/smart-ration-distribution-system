import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    BarChart,
    LineChart,
    PieChart,
} from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = await AsyncStorage.getItem("accessToken");

    const res = await fetch("http://localhost:8000/api/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    setData(json);
  };

  if (!data) return <Text style={{ margin: 20 }}>Loading Dashboard...</Text>;

  const { totals, feedbackStats, topComplaintShops } = data;

  /* DONUT DATA */
  const pieData = feedbackStats.map((item, index) => ({
    name: item._id,
    population: item.count,
    color: ["#4CAF50", "#FF9800", "#F44336", "#2196F3"][index % 4],
    legendFontColor: "#333",
    legendFontSize: 14,
  }));

  /* BAR DATA */
  const barData = {
    labels: topComplaintShops.map((s) => s.shopName),
    datasets: [{ data: topComplaintShops.map((s) => s.complaints) }],
  };

  /* TREND LINE (dummy auto generate) */
  const trendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [3, 5, 4, 6, 7, 3, 5],
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Analytics Dashboard</Text>
        <Text style={styles.subtitle}>System Overview — Last 30 Days</Text>
      </View>

      {/* STAT CARDS */}
      <View style={styles.grid}>
        <StatCard title="Users" value={totals.totalUsers} />
        <StatCard title="Shops" value={totals.totalShops} />
        <StatCard title="Products" value={totals.totalProducts} />
        <StatCard title="Feedback" value={totals.totalFeedback} />
        <StatCard title="Complaints" value={totals.totalComplaints} full />
      </View>

      {/* DONUT CHART */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Feedback Distribution</Text>
        <DonutChart data={pieData} total={totals.totalFeedback} />
      </View>

      {/* BAR CHART */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Top Complaint Shops</Text>
        <BarChart
          data={barData}
          width={screenWidth - 40}
          height={260}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
        />
      </View>

      {/* TREND LINE */}
      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Complaint Trend</Text>
        <LineChart
          data={trendData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    </ScrollView>
  );
}

/* DONUT COMPONENT */
const DonutChart = ({ data, total }) => (
  <View style={{ alignItems: "center" }}>
    <View style={{ position: "relative" }}>
      <PieChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        hasLegend={false}
        doughnut
        absolute
      />

      <View style={styles.donutCenter}>
        <Text style={styles.donutText}>{total}</Text>
      </View>
    </View>
  </View>
);

/* STAT CARD */
const StatCard = ({ title, value, full }) => (
  <View style={[styles.card, full && { width: "100%" }]}>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

/* CHART CONFIG */
const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(40,40,40,${opacity})`,
  labelColor: () => "#555",
};

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f5f7" },

  header: {
    backgroundColor: "#1f2d3d",
    padding: 25,
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#cbd5e1",
    marginTop: 5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 15,
  },

  card: {
    width: "48%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 4,
  },

  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2d3d",
  },

  cardTitle: {
    marginTop: 6,
    color: "#666",
  },

  chartCard: {
    backgroundColor: "white",
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },

  donutCenter: {
    position: "absolute",
    top: "42%",
    alignSelf: "center",
  },

  donutText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2d3d",
  },
});