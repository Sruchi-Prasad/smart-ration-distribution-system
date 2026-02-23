import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function FeedbackReviewPage() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetchAllFeedback();
  }, []);

  const fetchAllFeedback = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/feedback/all");
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error("Error loading feedback:", err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.type}>{item.type}</Text>

      <Text style={styles.message}>{item.message}</Text>

      <Text style={styles.info}>
        🏪 Shop: {item.shop?.shopName || "Unknown"}
      </Text>

      <Text style={styles.info}>
        👤 User: {item.user?.name || item.name || "Anonymous"}
      </Text>

      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Feedback (Admin)</Text>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No feedback yet
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  type: { fontSize: 16, fontWeight: "bold", color: "#1E88E5" },
  message: { marginVertical: 6 },
  info: { fontSize: 13, color: "#444" },
  date: { fontSize: 12, color: "#666", marginTop: 6 },
});