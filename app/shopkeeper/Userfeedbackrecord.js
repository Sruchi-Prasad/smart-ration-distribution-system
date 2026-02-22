import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function FeedbackListPage() {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/feedback"); // change IP
                const data = await res.json();

                console.log("API RESPONSE:", data);

                setFeedbacks(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error loading feedback:", err);
            }
        };

        fetchFeedbacks();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.type}>{item.type}</Text>
            <Text>{item.message}</Text>

            {item.name && <Text>👤 {item.name}</Text>}
            {item.email && <Text>📧 {item.email}</Text>}

            <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleString()}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Feedback</Text>

            <FlatList
                data={feedbacks}
                keyExtractor={(item) => item._id?.toString()}
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  type: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E88E5",
  },
  date: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
});