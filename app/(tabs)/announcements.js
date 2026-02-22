import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FooterNav from "./myFooter";

export default function AnnouncementPage() {
    const announcements = [
        {
            id: 1,
            title: "Emergency Distribution: Additional Rice Quota Released",
            tags: ["Urgent", "Emergency"],
            description: "Due to the recent natural disaster, an additional 5kg rice quota has been approved for all beneficiaries.",
            date: "Feb 6, 2026 10:30 AM",
        },
        {
            id: 2,
            title: "New Distribution Schedule for March 2026",
            tags: ["Important", "Schedule"],
            description: "Token holders with numbers 1-500 can collect their rations in the first week. Please check your assigned slot.",
            date: "Feb 5, 2026 09:00 AM",
        },
        {
            id: 3,
            title: "New Distribution Center Opened in Sector 15",
            tags: ["Update", "Distribution"],
            description: "Residents of sectors 13-17 can now collect their monthly rations from the new Sector 15 center.",
            date: "Feb 3, 2026 09:15 AM",
        },
    ];

    const metrics = [
        { label: "Beneficiaries", value: "2.4M", change: "+12%", color: "#4daaa0" },
        { label: "Rations Distributed", value: "850K", change: "+8%", color: "#4daaa0" },
        { label: "Centers", value: "1,240", change: "+5%", color: "#4daaa0" },
    ];

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Top Navigation */}
                <View style={styles.navbar}>
                    <Text style={styles.logo}>Smart Ration Distribution System</Text>

                    <View style={styles.navLinks}>
                        <Text style={styles.navLink}>Dashboard</Text>
                        <Text style={styles.navLink}>Announcements</Text>
                        <Text style={styles.navLink}>Distribution</Text>
                        <Text style={styles.navLink}>Reports</Text>
                    </View>

                    <MaterialIcons name="notifications" size={22} color="white" />
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>AD</Text>
                    </View>
                </View>


                {/* Hero Section */}
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.liveBadge}>
                        <Text style={styles.liveDot}>●</Text>
                        <Text style={styles.liveText}>Live Updates Available</Text>
                    </View>

                    <Text style={styles.heroTitle}>System Announcements</Text>

                    <View style={styles.underline} />

                    <Text style={styles.heroSubtitle}>
                        Stay informed with the latest updates on ration distribution schedules,
                        policy changes, and important notifications for your community.
                    </Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.primaryBtn}>
                            <Text style={styles.primaryText}>View All Announcements →</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn}>
                            <Text style={styles.secondaryText}>Subscribe to Alerts</Text>
                        </TouchableOpacity>
                    </View>


                    {/* Metrics */}
                    <View style={styles.metricsWrapper}>
                        {metrics.map((m, i) => (
                            <View key={i} style={styles.metricCard}>
                                <Text style={styles.metricValue}>{m.value}</Text>
                                <Text style={styles.metricLabel}>{m.label}</Text>
                                <Text style={styles.metricChange}>↗ {m.change}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ================= Latest Announcements ================= */}

                <View style={styles.latestWrapper}>

                    {/* Header */}
                    <View style={styles.latestHeader}>
                        <View>
                            <Text style={styles.latestTitle}>Latest Announcements</Text>
                            <Text style={styles.latestSubtitle}>
                                Stay updated with the latest news and notifications
                            </Text>
                        </View>

                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>6 announcements</Text>
                        </View>
                    </View>
                    <View style={styles.announceCard}>
                        {/* Search Box */}
                        <View style={styles.searchBox}>
                            <MaterialIcons name="search" size={20} color="#c9c8c8" />
                            <Text style={styles.searchPlaceholder}>Search announcements...</Text>
                        </View>

                        {/* Filter Pills */}
                        <View style={styles.filterRow}>
                            {["All", "Schedule", "Policy", "Distribution", "Emergency"].map((f, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.filterPill,
                                        f === "All" && styles.filterActive
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.filterText2,
                                            f === "All" && styles.filterActiveText
                                        ]}
                                    >
                                        {f}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Announcement Cards */}
                    {announcements.map((a, i) => (
                        <View key={i} style={styles.announceCard}>

                            <Text style={styles.announceTitle}>{a.title}</Text>

                            {/* Tags */}
                            <View style={styles.tagRow}>
                                {a.tags.map((t, idx) => (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.tagChip,
                                            t === "Urgent" && styles.urgentChip
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.tagChipText,
                                                t === "Urgent" && styles.urgentText
                                            ]}
                                        >
                                            {t}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Date */}
                            <View style={styles.dateRow}>
                                <MaterialIcons name="calendar-today" size={16} color="#4daaa0" />
                                <Text style={styles.dateText}>{a.date}</Text>
                            </View>

                            {/* Description */}
                            <Text style={styles.announceDesc}>{a.description}</Text>

                            {/* Read More */}
                            <TouchableOpacity>
                                <Text style={styles.readMore2}>Read More →</Text>
                            </TouchableOpacity>

                        </View>
                    ))}

                </View>



                {/* Filters */}

                {/* Content + Sidebar */}
                <View style={styles.mainRow}>
                    {/* Announcements */}
                    <View style={styles.leftCol}>
                        {announcements.map((a) => (
                            <View key={a.id} style={styles.card}>
                                <Text style={styles.cardTitle}>{a.title}</Text>
                                <View style={styles.tagRow}>
                                    {a.tags.map((tag, i) => (
                                        <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                                    ))}
                                </View>
                                <Text style={styles.date}>📅 {a.date}</Text>
                                <Text style={styles.description}>{a.description}</Text>
                                <TouchableOpacity style={styles.readMore}><Text style={{ color: "#00796B", fontWeight: "600" }}>Read More →</Text></TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* Metrics Sidebar */}

                </View>
            </ScrollView>

            <FooterNav />
        </View>
    );
}

const styles = StyleSheet.create({

    /* Page */
    container: {
        padding: 0,
        backgroundColor: "#f4f6f8"
    },

    /* NAVBAR */
    navbar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0b2f55",
        paddingHorizontal: 20,
        paddingVertical: 14
    },
    logo: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold"
    },
    navLinks: {
        flexDirection: "row",
        marginLeft: 30,
        flex: 1
    },
    navLink: {
        color: "white",
        marginRight: 20,
        fontWeight: "600"
    },
    avatar: {
        backgroundColor: "#0aa18f",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginLeft: 10
    },
    avatarText: {
        color: "white",
        fontWeight: "bold"
    },

    /* HERO */
    hero: {
        backgroundColor: "#0f7f78",
        padding: 30,
        borderRadius: 16,
        margin: 20
    },

    liveBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 14
    },
    liveDot: { color: "#ffb703", marginRight: 6 },
    liveText: { color: "white", fontSize: 12 },

    heroTitle: {
        fontSize: 34,
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },

    underline: {
        height: 4,
        width: 160,
        backgroundColor: "#ffb703",
        borderRadius: 5,
        alignSelf: "center",
        marginVertical: 12
    },

    heroSubtitle: {
        color: "#e8f6f5",
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 20
    },

    /* BUTTONS */
    actions: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 26
    },
    primaryBtn: {
        backgroundColor: "white",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        marginRight: 12
    },
    primaryText: {
        color: "#0f7f78",
        fontWeight: "700"
    },

    secondaryBtn: {
        backgroundColor: "rgba(255,255,255,0.25)",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10
    },
    secondaryText: {
        color: "white",
        fontWeight: "600"
    },

    /* METRICS */
    metricsWrapper: {
        marginTop: 10
    },

    metricCard: {
        backgroundColor: "#4daaa0",
        padding: 18,
        borderRadius: 14,
        marginBottom: 14
    },

    metricValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white"
    },

    metricLabel: {
        fontSize: 14,
        color: "white",
        marginTop: 4
    },

    metricChange: {
        fontSize: 13,
        color: "#d4fff7",
        marginTop: 2
    },

    /* FILTERS */
    filters: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 20,
        marginBottom: 12
    },
    filterButton: {
        backgroundColor: "#e8e8e8",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8
    },
    filterText: {
        fontSize: 12,
        color: "#333"
    },

    /* CARDS */
    leftCol: {
        paddingHorizontal: 20
    },
    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 14,
        marginBottom: 16,
        elevation: 2
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0b2f55"
    },
    tagRow: {
        flexDirection: "row",
        marginTop: 8
    },
    tag: {
        backgroundColor: "#eef2f3",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6
    },
    tagText: {
        fontSize: 12
    },
    date: {
        marginTop: 8,
        color: "#777"
    },
    description: {
        marginTop: 6,
        fontSize: 14
    },
    readMore: {
        marginTop: 10
    },
    /* ================= Latest Announcements ================= */

    latestWrapper: {
        paddingHorizontal: 20,
        paddingTop: 10
    },

    latestHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
    },

    latestTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0b2f55"
    },

    latestSubtitle: {
        color: "#6b8f8c",
        fontSize:14,
        marginTop: 4,
        fontWeight:20
    },

    countBadge: {
        backgroundColor: "#eef4f3",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20
    },

    countText: {
        color: "#6b8f8c",
        fontWeight: "600"
    },

    /* Search */

    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#c9c8c8",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
        elevation: 1
    },

    searchPlaceholder: {
        marginLeft: 10,
        color: "#4a4141"
    },

    /* Filters */

    filterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20
    },

    filterPill: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10
    },

    filterActive: {
        backgroundColor: "#0aa18f"
    },

    filterText2: {
        color: "#333",
        fontWeight: "600"
    },

    filterActiveText: {
        color: "#fff"
    },

    /* Cards */

    announceCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2
    },

    announceTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0b2f55"
    },

    tagChip: {
        backgroundColor: "#eef4f3",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginRight: 8
    },

    urgentChip: {
        backgroundColor: "#ffe6e6"
    },

    tagChipText: {
        fontSize: 12,
        color: "#4daaa0",
        fontWeight: "600"
    },

    urgentText: {
        color: "#ff3b3b"
    },

    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8
    },

    dateText: {
        marginLeft: 6,
        color: "#6b8f8c"
    },

    announceDesc: {
        marginTop: 10,
        color: "#333",
        lineHeight: 20
    },

    readMore2: {
        marginTop: 12,
        color: "#0aa18f",
        fontWeight: "700"
    }


});
