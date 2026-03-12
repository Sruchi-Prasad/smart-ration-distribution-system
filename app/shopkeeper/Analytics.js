import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    PieChart
} from "react-native-chart-kit";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const screenWidth = Dimensions.get("window").width;

export default function ShopkeeperAnalytics() {
    const router = useRouter();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/analytics/stats`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("Analytics load error:", err);
        }
    };

    if (!data) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF9933" />
            <Text style={styles.loadingText}>Syncing Analysis...</Text>
        </View>
    );

    const { stockStats, summary, distributionTrends } = data;

    const pieData = (stockStats || []).map((stat, index) => ({
        name: stat.name.split(' ')[0],
        population: stat.current,
        color: ["#003366", "#4CAF50", "#FF9933", "#E91E63"][index % 4],
        legendFontColor: "#666",
        legendFontSize: 12,
    }));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const barData = {
        labels: distributionTrends?.length > 0
            ? distributionTrends.map(t => monthNames[t._id - 1])
            : ["No Data"],
        datasets: [{
            data: distributionTrends?.length > 0
                ? distributionTrends.map(t => t.count)
                : [0]
        }]
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.pageHeader}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Shop Insights</Text>
                    <MaterialCommunityIcons name="finance" size={24} color="#FF9933" />
                </View>
                <Text style={styles.subtitle}>Performance Metrics & Performance Over View</Text>
            </View>

            <View style={styles.content}>
                {/* QUICK STATS */}
                <View style={styles.statsRow}>
                    <StatCard
                        icon="account-group"
                        title="Beneficiaries"
                        value={summary.totalBeneficiaries}
                        color="#003366"
                    />
                    <StatCard
                        icon="alert-decagram"
                        title="Pending KYC"
                        value={summary.pendingKyc}
                        color="#D32F2F"
                    />
                </View>

                {/* STOCK DISTRIBUTION PIE */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <MaterialCommunityIcons name="chart-pie" size={20} color="#003366" />
                        <Text style={styles.chartTitle}>Resource Inventory Mix</Text>
                    </View>
                    <PieChart
                        data={pieData}
                        width={screenWidth - 64}
                        height={200}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                </View>

                {/* DISTRIBUTION TRENDS BAR */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <MaterialCommunityIcons name="chart-bar" size={20} color="#003366" />
                        <Text style={styles.chartTitle}>Distribution Velocity</Text>
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

                <View style={styles.summaryBox}>
                    <Text style={styles.summaryValue}>{summary.monthlyDistributions}</Text>
                    <Text style={styles.summaryLabel}>Total Provisions Distributed This Month</Text>
                    <View style={styles.growthBadge}>
                        <MaterialCommunityIcons name="arrow-up" size={12} color="#128807" />
                        <Text style={styles.growthText}>Steady Performance</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const StatCard = ({ icon, title, value, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <View style={{ marginLeft: 12 }}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{title}</Text>
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
    decimalPlaces: 0,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F7FB" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { color: "#003366", fontWeight: "900", letterSpacing: 1, marginTop: 16 },
    header: {
        backgroundColor: "#003366",
        padding: 24,
        paddingTop: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 10,
    },
    pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    backBtn: { padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12 },
    title: { color: "white", fontSize: 22, fontWeight: "900", textTransform: "uppercase" },
    subtitle: { color: "#BBDEFB", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    content: { padding: 16, marginTop: -20 },
    statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
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
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    statValue: { fontSize: 20, fontWeight: "900", color: "#003366" },
    statLabel: { fontSize: 9, fontWeight: "800", color: "#999", textTransform: "uppercase" },
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
    chartHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    chartTitle: { fontSize: 14, fontWeight: "900", color: "#003366", marginLeft: 10, textTransform: "uppercase", letterSpacing: 0.5 },
    chart: { borderRadius: 16, marginVertical: 8 },
    summaryBox: {
        backgroundColor: "#E3F2FD",
        borderRadius: 24,
        padding: 30,
        alignItems: "center",
        marginBottom: 40,
        borderWidth: 1,
        borderColor: "#BBDEFB",
    },
    summaryValue: { fontSize: 48, fontWeight: "900", color: "#003366" },
    summaryLabel: { fontSize: 13, fontWeight: "800", color: "#666", textTransform: "uppercase", textAlign: "center", marginTop: 8 },
    growthBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 16,
    },
    growthText: { color: "#128807", fontSize: 11, fontWeight: "800", marginLeft: 6, textTransform: "uppercase" },
});
