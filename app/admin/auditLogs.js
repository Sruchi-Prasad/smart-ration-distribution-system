import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

const API = `${API_BASE}/api`;

export default function AdminAuditLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);

  const loadLogs = async () => {
    try {
      const res = await fetchWithAuth(`${API}/audit`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.log("LOAD ERROR:", err);
    }
  };

  useEffect(() => { loadLogs(); }, []);

  const renderItem = ({ item }) => {
    const isDelete = item.action.includes("Deleted");
    const isEdit = item.action.includes("Updated");
    const isSecurity = item.action.includes("Password") || item.action.includes("Login");

    let iconName = "event-note";
    let iconColor = "#003366";
    let bgColor = "#F0F4F8";

    if (isDelete) {
      iconName = "delete-outline";
      iconColor = "#D32F2F";
      bgColor = "#FFEBEB";
    } else if (isEdit) {
      iconName = "edit";
      iconColor = "#FF9933";
      bgColor = "#FFF3E0";
    } else if (isSecurity) {
      iconName = "security";
      iconColor = "#128807";
      bgColor = "#E8F5E9";
    }

    return (
      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <MaterialIcons name={iconName} size={24} color={iconColor} />
        </View>

        <View style={styles.logInfo}>
          <Text style={[styles.action, { color: iconColor }]}>{item.action}</Text>

          <View style={styles.userRow}>
            <MaterialIcons name="account-circle" size={14} color="#999" />
            <Text style={styles.userText}>{item.user}</Text>
          </View>

          {item.details && (
            <Text style={styles.details}>{item.details}</Text>
          )}

          <View style={styles.dateRow}>
            <MaterialIcons name="schedule" size={12} color="#999" />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.pageHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#003366" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>System Audit</Text>
          <MaterialIcons name="verified-user" size={24} color="#003366" />
        </View>

        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="list-alt" size={64} color="#E2E8F0" />
              <Text style={styles.emptyText}>No Active Logs</Text>
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
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  logInfo: {
    flex: 1,
  },
  action: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
    color: "#003366",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "800",
    marginLeft: 6,
    textTransform: "uppercase",
  },
  details: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 18,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "700",
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
