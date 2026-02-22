import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function RecentLoginsScreen() {
  const { logins } = useLocalSearchParams();
  const parsedLogins = logins ? JSON.parse(logins) : [];

  if (parsedLogins.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No recent logins found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={parsedLogins}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16,
    color: "#666"
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E88E5"
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginTop: 4
  }
});
