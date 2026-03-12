import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function FeedbackReviewPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetchAllFeedback();
  }, []);

  const fetchAllFeedback = async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/feedback/all`);
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error("Error loading feedback:", err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.message}>{item.message}</Text>

      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <MaterialIcons name="storefront" size={16} color="#FF9933" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.shop?.shopName || "Public"}
          </Text>
        </View>

        <View style={[styles.infoItem, { marginLeft: 12 }]}>
          <MaterialIcons name="account-circle" size={16} color="#FF9933" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.user?.fullName || item.name || "Anon"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#003366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Public Sentiment</Text>
          <MaterialIcons name="forum" size={24} color="#003366" />
        </View>

        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="speaker-notes-off" size={64} color="#E2E8F0" />
              <Text style={styles.emptyText}>No Active Feedback</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: "#FF9933",
  },
  headerTitle: {
    fontWeight: "900",
    color: "#003366",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
  },
  typeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#003366",
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 10,
    color: "#999",
    fontWeight: "700",
  },
  message: {
    fontSize: 15,
    color: "#003366",
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "800",
    marginLeft: 6,
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#003366",
    marginTop: 16,
    textTransform: "uppercase",
  }
});
