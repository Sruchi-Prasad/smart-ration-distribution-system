import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const API = "http://localhost:8000/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);

  const loadLogs = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    const res = await fetch(`${API}/audit`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => { loadLogs(); }, []);

  const renderItem = ({ item }) => {
    const isDelete = item.action.includes("Deleted");

    return (
      <View style={styles.card}>
        {/* LEFT ICON */}
        <View style={[
          styles.iconBox,
          { backgroundColor: isDelete ? "#fdecea" : "#e8f5e9" }
        ]}>
          <MaterialIcons
            name={isDelete ? "delete" : "add-circle"}
            size={24}
            color={isDelete ? "#e53935" : "#2e7d32"}
          />
        </View>

        {/* RIGHT CONTENT */}
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.action,
            { color: isDelete ? "#e53935" : "#2e7d32" }
          ]}>
            {item.action}
          </Text>

          <Text style={styles.user}>👤 {item.user}</Text>

          {item.details && (
            <Text style={styles.details}>{item.details}</Text>
          )}

          <Text style={styles.date}>
            🕒 {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Audit Logs</Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No activity recorded</Text>
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#f4f6f8"
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1a237e"
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: "flex-start",

    // web + mobile shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },

  action: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4
  },

  user: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3
  },

  details: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5
  },

  date: {
    fontSize: 12,
    color: "#888"
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777"
  }
});