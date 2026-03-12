import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function FeedbackListPage() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [shopId, setShopId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadId = async () => {
            const userData = await AsyncStorage.getItem("user");

            if (userData) {
                const parsed = JSON.parse(userData);
                setShopId(parsed._id);
            }
        };
        loadId();
    }, []);

    useEffect(() => {
        if (!shopId) return;

        const fetchFeedbacks = async () => {
            setLoading(true);
            try {
                const res = await fetchWithAuth(`${API_BASE}/api/feedback/shop/${shopId}`);
                const data = await res.json();
                setFeedbacks(data);
            } catch (err) {
                console.error("Feedback fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [shopId]);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type}</Text>
                </View>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>

            <Text style={styles.message}>{item.message}</Text>

            <View style={styles.footer}>
                <View style={styles.userInfo}>
                    <MaterialCommunityIcons name="account-circle-outline" size={16} color="#666" />
                    <Text style={styles.userText}>{item.name || "Anonymous User"}</Text>
                </View>
                {item.email && (
                    <View style={[styles.userInfo, { marginLeft: 16 }]}>
                        <MaterialCommunityIcons name="email-outline" size={16} color="#666" />
                        <Text style={styles.userText}>{item.email}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Text style={styles.title}>Consumer Reviews</Text>
                <View style={styles.titleUnderline} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF9933" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={feedbacks}
                    keyExtractor={(item) => item._id?.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="message-off-outline" size={48} color="#CBD5E0" />
                            <Text style={styles.emptyText}>No feedback received yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F7FB",
    },
    pageHeader: {
        padding: 24,
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "900",
        color: "#003366",
        textTransform: "uppercase",
        letterSpacing: 1.5,
    },
    titleUnderline: {
        height: 4,
        width: 40,
        backgroundColor: "#FF9933",
        borderRadius: 2,
        marginTop: 8,
    },
    card: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    typeBadge: {
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#BBDEFB",
    },
    typeText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#003366",
        textTransform: "uppercase",
    },
    date: {
        fontSize: 11,
        color: "#999",
        fontWeight: "700",
    },
    message: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
        fontWeight: "600",
        marginBottom: 16,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 14,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    userText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "700",
        marginLeft: 6,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: "#999",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
    }
});
