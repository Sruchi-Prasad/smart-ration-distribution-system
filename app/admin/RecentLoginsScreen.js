import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RecentLoginsScreen() {
  const router = useRouter();
  const { logins } = useLocalSearchParams();
  const parsedLogins = logins ? JSON.parse(logins) : [];

  if (parsedLogins.length === 0) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="cloud-off" size={64} color="#E2E8F0" />
        <Text style={styles.emptyText}>No recent login activity found.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialIcons name="account-circle" size={24} color="#003366" />
      </View>
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.dateRow}>
          <MaterialIcons name="schedule" size={14} color="#999" />
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        </View>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Verified</Text>
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
          <Text style={styles.headerTitle}>Access History</Text>
          <MaterialIcons name="history" size={24} color="#003366" />
        </View>

        <FlatList
          data={parsedLogins}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FB"
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#003366",
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "900",
    color: "#003366",
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: "#999",
    fontWeight: "700",
    marginLeft: 6,
  },
  badge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#128807",
    textTransform: "uppercase",
  }
});
