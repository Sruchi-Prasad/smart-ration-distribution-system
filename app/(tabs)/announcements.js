import { MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function AnnouncementPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const loadNotifications = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/auth/notifications`);
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map(n => ({
                    id: n._id,
                    title: n.title,
                    tags: [n.type === "kycReminder" ? "Urgent" : "Update"],
                    description: n.body,
                    date: new Date(n.createdAt).toLocaleString(),
                    type: n.type,
                    read: n.read
                }));
                setAnnouncements(mapped);
                setFilteredAnnouncements(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Handle Refresh
    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications(false);
    };

    // Handle Search & Filter
    useEffect(() => {
        let result = announcements;

        if (activeFilter !== "All") {
            result = result.filter(a => {
                if (activeFilter === "Urgent") return a.tags.includes("Urgent");
                if (activeFilter === "Updates") return a.tags.includes("Update");
                if (activeFilter === "Unread") return !a.read;
                return true;
            });
        }

        if (searchQuery) {
            result = result.filter(a =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredAnnouncements(result);
    }, [searchQuery, activeFilter, announcements]);

    // Mark as Read
    const handleMarkAsRead = async (id) => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/auth/notifications/${id}/read`, {
                method: "PATCH"
            });
            if (res.ok) {
                setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
            }
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    // Delete Notification
    const handleDelete = async (id) => {
        Alert.alert(
            "Delete Notification",
            "Are you sure you want to delete this notification?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetchWithAuth(`${API_BASE}/api/auth/notifications/${id}`, {
                                method: "DELETE"
                            });
                            if (res.ok) {
                                setAnnouncements(prev => prev.filter(a => a.id !== id));
                            }
                        } catch (err) {
                            console.error("Error deleting notification:", err);
                        }
                    }
                }
            ]
        );
    };

    // Clear All
    const handleClearAll = () => {
        Alert.alert(
            "Clear All",
            "Delete all notifications permanently?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetchWithAuth(`${API_BASE}/api/auth/notifications`, {
                                method: "DELETE"
                            });
                            if (res.ok) {
                                setAnnouncements([]);
                            }
                        } catch (err) {
                            console.error("Error clearing notifications:", err);
                        }
                    }
                }
            ]
        );
    };

    const metrics = [
        { label: "Beneficiaries", value: "2.4M", change: "+12%", color: "#4daaa0" },
        { label: "Distributions", value: "850k", change: "+5.4%", color: "#0aa18f" },
        { label: "Approval Rate", value: "94.2%", change: "+0.8%", color: "#0b2f55" },
    ];

    const filters = ["All", "Unread", "Urgent", "Updates"];

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0f7f78"]} />
                }
            >
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.liveBadge}>
                        <Text style={styles.liveDot}>●</Text>
                        <Text style={styles.liveText}>SYSTEM UPDATES LIVE</Text>
                    </View>
                    <Text style={styles.heroTitle}>Smart Ration Announcements</Text>
                    <View style={styles.underline} />
                    <Text style={styles.heroSubtitle}>
                        Stay updated with real-time distribution alerts, policy changes, and important KYC reminders.
                    </Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.primaryBtn}>
                            <Text style={styles.primaryText}>Help Center</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryBtn}>
                            <Text style={styles.secondaryText}>Contact Admin</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.metricsWrapper}>
                        {metrics.map((m, i) => (
                            <View key={i} style={styles.metricCard}>
                                <Text style={styles.metricValue}>{m.value}</Text>
                                <Text style={styles.metricLabel}>{m.label}</Text>
                                <Text style={styles.metricChange}>{m.change} this month</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Latest Announcements */}
                <View style={styles.latestWrapper}>
                    <View style={styles.latestHeader}>
                        <View>
                            <Text style={styles.latestTitle}>Notifications</Text>
                            <Text style={styles.latestSubtitle}>Real-time updates for your account</Text>
                        </View>
                        {announcements.length > 0 && (
                            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllBtn}>
                                <Text style={styles.clearAllText}>Clear All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Search Box */}
                    <View style={styles.searchBox}>
                        <MaterialIcons name="search" size={24} color="#6b8f8c" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search notifications..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery !== "" && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <MaterialIcons name="close" size={20} color="#6b8f8c" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Pills */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                        {filters.map((f, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => setActiveFilter(f)}
                                style={[styles.filterPill, f === activeFilter && styles.filterActive]}
                            >
                                <Text style={[
                                    styles.filterText2,
                                    f === activeFilter && styles.filterActiveText
                                ]}>
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Announcement Cards */}
                    {loading && !refreshing ? (
                        <View style={{ padding: 40, alignItems: "center" }}>
                            <ActivityIndicator size="large" color="#0aa18f" />
                            <Text style={{ marginTop: 10, color: "#6b8f8c" }}>Loading notifications...</Text>
                        </View>
                    ) : filteredAnnouncements.length === 0 ? (
                        <View style={{ padding: 40, alignItems: "center" }}>
                            <MaterialIcons name="notifications-none" size={48} color="#ccc" />
                            <Text style={{ marginTop: 10, color: "#6b8f8c" }}>No notifications found</Text>
                        </View>
                    ) : filteredAnnouncements.map((a) => (
                        <View key={a.id} style={[styles.announceCard, !a.read && styles.unreadCard]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.announceTitle}>{a.title}</Text>
                                <TouchableOpacity onPress={() => handleDelete(a.id)}>
                                    <MaterialIcons name="delete-outline" size={20} color="#ff3b3b" />
                                </TouchableOpacity>
                            </View>

                            {/* Tags */}
                            <View style={styles.tagRow}>
                                {!a.read && (
                                    <View style={styles.newBadge}>
                                        <View style={styles.unreadDot} />
                                        <Text style={styles.newBadgeText}>NEW</Text>
                                    </View>
                                )}
                                {a.tags.map((t, idx) => (
                                    <View key={idx} style={[styles.tagChip, t === "Urgent" && styles.urgentChip]}>
                                        <Text style={[styles.tagChipText, t === "Urgent" && styles.urgentText]}>
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
                            <Text style={[styles.announceDesc, !a.read && styles.unreadDesc]}>{a.description}</Text>

                            {/* Action Row */}
                            <View style={styles.cardFooter}>
                                <TouchableOpacity onPress={() => handleMarkAsRead(a.id)}>
                                    <Text style={styles.readMore2}>{a.read ? "View Details →" : "Mark as Read"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F7FB"
    },
    hero: {
        backgroundColor: "#003366", // Navy
        padding: 32,
        borderRadius: 24,
        margin: 16,
        elevation: 10,
        shadowColor: "#003366",
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    liveBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    liveDot: { color: "#FF9933", marginRight: 8, fontSize: 14 },
    liveText: { color: "white", fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
    heroTitle: {
        fontSize: 32,
        color: "white",
        fontWeight: "900",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    underline: {
        height: 4,
        width: 80,
        backgroundColor: "#FF9933", // Saffron
        borderRadius: 2,
        alignSelf: "center",
        marginVertical: 16
    },
    heroSubtitle: {
        color: "#E0E0E0",
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
        fontWeight: "500",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10
    },
    primaryBtn: {
        backgroundColor: "#FF9933",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginRight: 12,
        elevation: 4,
    },
    primaryText: {
        color: "white",
        fontWeight: "900",
        textTransform: "uppercase",
        fontSize: 13,
    },
    secondaryBtn: {
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    secondaryText: {
        color: "white",
        fontWeight: "800",
        textTransform: "uppercase",
        fontSize: 13,
    },
    metricsWrapper: {
        marginTop: 20
    },
    metricCard: {
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },
    metricValue: {
        fontSize: 26,
        fontWeight: "900",
        color: "white"
    },
    metricLabel: {
        fontSize: 13,
        color: "#E0E0E0",
        marginTop: 4,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    metricChange: {
        fontSize: 12,
        color: "#FF9933",
        marginTop: 4,
        fontWeight: "600",
    },
    latestWrapper: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 40
    },
    latestHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },
    latestTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: "#003366",
        textTransform: "uppercase",
    },
    latestSubtitle: {
        color: "#666",
        fontSize: 13,
        marginTop: 2,
        fontWeight: "600",
    },
    clearAllBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: "#FFEBEB"
    },
    clearAllText: {
        color: "#D32F2F",
        fontSize: 12,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: "#EEF2F6",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        color: "#003366",
        fontSize: 15,
        fontWeight: "600",
    },
    filterRow: {
        flexDirection: "row",
        marginBottom: 24,
    },
    filterPill: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 1.5,
        borderColor: "#EEF2F6",
        elevation: 2,
    },
    filterActive: {
        backgroundColor: "#003366",
        borderColor: "#003366",
    },
    filterText2: {
        color: "#003366",
        fontWeight: "800",
        fontSize: 13,
        textTransform: "uppercase",
    },
    filterActiveText: {
        color: "#fff"
    },
    announceCard: {
        backgroundColor: "#fff",
        padding: 22,
        borderRadius: 20,
        marginBottom: 16,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: "#EEF2F6",
        borderLeftWidth: 6,
        borderLeftColor: "#FF9933", // Saffron accent
    },
    unreadCard: {
        borderLeftColor: "#003366", // Navy for unread
        backgroundColor: "#F9FBFF"
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },
    announceTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#003366",
        flex: 1,
        marginRight: 10,
        lineHeight: 24,
    },
    tagRow: {
        flexDirection: "row",
        marginTop: 12,
        alignItems: "center"
    },
    newBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#003366",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 10
    },
    unreadDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#FF9933",
        marginRight: 6
    },
    newBadgeText: {
        fontSize: 10,
        color: "#fff",
        fontWeight: "900",
        letterSpacing: 0.5,
    },
    tagChip: {
        backgroundColor: "#F0F4F8",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10
    },
    urgentChip: {
        backgroundColor: "#FFEBEB"
    },
    tagChipText: {
        fontSize: 11,
        color: "#003366",
        fontWeight: "800",
        textTransform: "uppercase"
    },
    urgentText: {
        color: "#D32F2F"
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14
    },
    dateText: {
        marginLeft: 8,
        color: "#666",
        fontSize: 13,
        fontWeight: "600",
    },
    announceDesc: {
        marginTop: 14,
        color: "#444",
        lineHeight: 22,
        fontSize: 15,
        fontWeight: "500",
    },
    unreadDesc: {
        color: "#003366",
        fontWeight: "600"
    },
    cardFooter: {
        marginTop: 18,
        borderTopWidth: 1,
        borderTopColor: "#EEF2F6",
        paddingTop: 14
    },
    readMore2: {
        color: "#FF9933",
        fontWeight: "900",
        fontSize: 14,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    }
});
