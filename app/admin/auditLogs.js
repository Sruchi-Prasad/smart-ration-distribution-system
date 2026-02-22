import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const API = "http://localhost:8000/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);

  const loadLogs = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${API}/audit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.action}>{item.action}</Text>
      <Text>User: {item.user}</Text>
      {item.details && <Text>Details: {item.details}</Text>}
      <Text>Date: {new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audit Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No logs yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: { backgroundColor: "white", padding: 15, borderRadius: 10, marginBottom: 12, elevation: 2 },
  action: { fontSize: 16, fontWeight: "bold", color: "#1E88E5" }
});
