import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/auth/notifications`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetchWithAuth(`${API_BASE}/api/auth/notifications/${id}/read`, { method: "PATCH" });
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error("Error marking as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetchWithAuth(`${API_BASE}/api/auth/notifications/read-all`, { method: "PATCH" });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Error marking all as read:", err);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const typeIcon = (type) => {
        switch (type) {
            case "kycReminder": return { name: "verified-user", color: "#D32F2F" };
            case "distribution": return { name: "local-shipping", color: "#003366" };
            case "announcement": return { name: "campaign", color: "#FF9933" };
            default: return { name: "notifications", color: "#666" };
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#003366" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor="#FF9933" />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <Text style={styles.headerSub}>{unreadCount} unread</Text>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity style={styles.markAllBtn} onPress={markAllAsRead}>
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Notification List */}
            {notifications.length === 0 ? (
                <View style={styles.empty}>
                    <MaterialIcons name="notifications-none" size={64} color="#E2E8F0" />
                    <Text style={styles.emptyText}>No Notifications</Text>
                    <Text style={styles.emptySub}>You're all caught up!</Text>
                </View>
            ) : (
                notifications.map(item => {
                    const icon = typeIcon(item.type);
                    return (
                        <TouchableOpacity
                            key={item._id}
                            style={[styles.card, !item.read && styles.unreadCard]}
                            onPress={() => markAsRead(item._id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconBox, { backgroundColor: icon.color + "18" }]}>
                                <MaterialIcons name={icon.name} size={24} color={icon.color} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 14 }}>
                                <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
                                <Text style={styles.body}>{item.body}</Text>
                                <Text style={styles.date}>
                                    {new Date(item.createdAt).toLocaleDateString()} · {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </Text>
                            </View>
                            {!item.read && <View style={styles.dot} />}
                        </TouchableOpacity>
                    );
                })
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F7FB" },
    content: { padding: 16, paddingBottom: 60 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "white",
        padding: 16,
        borderRadius: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        borderBottomWidth: 3,
        borderBottomColor: "#FF9933",
    },
    headerTitle: { fontSize: 18, fontWeight: "900", color: "#003366", textTransform: "uppercase" },
    headerSub: { fontSize: 12, color: "#FF9933", fontWeight: "700", marginTop: 2 },
    markAllBtn: {
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    markAllText: { color: "#003366", fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
    card: {
        backgroundColor: "white",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    unreadCard: {
        borderColor: "#BBDEFB",
        borderWidth: 1.5,
        backgroundColor: "#F8FAFF",
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    title: { fontSize: 14, fontWeight: "700", color: "#444" },
    unreadTitle: { color: "#003366", fontWeight: "900" },
    body: { fontSize: 12, color: "#777", marginTop: 3, lineHeight: 18 },
    date: { fontSize: 11, color: "#BBB", marginTop: 6, fontWeight: "600" },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#003366", marginLeft: 8 },
    empty: { alignItems: "center", marginTop: 80 },
    emptyText: { fontSize: 18, fontWeight: "900", color: "#003366", marginTop: 16, textTransform: "uppercase" },
    emptySub: { color: "#999", marginTop: 6, fontWeight: "600" },
});
