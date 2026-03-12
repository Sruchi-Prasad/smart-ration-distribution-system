import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(true);

  const SettingItem = ({ icon, label, sublabel, value, onToggle, type = "link" }) => (
    <TouchableOpacity style={styles.settingCard} disabled={type === "switch"}>
      <View style={styles.iconWrapper}>
        <Feather name={icon} size={20} color="#003366" />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sublabel && <Text style={styles.settingSublabel}>{sublabel}</Text>}
      </View>
      {type === "switch" ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#DDD", true: "#FF9933" }}
          thumbColor={value ? "#003366" : "#f4f3f4"}
        />
      ) : (
        <MaterialIcons name="chevron-right" size={24} color="#CCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <SettingItem icon="user" label="Personal Information" sublabel="Update your name, email, and phone" />
        <SettingItem icon="lock" label="Security & Password" sublabel="Manage your account security" />
        <SettingItem icon="shield" label="Privacy Policy" />

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>App Preferences</Text>
        <SettingItem
          icon="bell"
          label="Push Notifications"
          type="switch"
          value={notifications}
          onToggle={setNotifications}
        />
        <SettingItem
          icon="moon"
          label="Dark Mode"
          type="switch"
          value={darkMode}
          onToggle={setDarkMode}
        />
        <SettingItem
          icon="cpu"
          label="Use Biometrics"
          sublabel="Login using Fingerprint/FaceID"
          type="switch"
          value={biometrics}
          onToggle={setBiometrics}
        />

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Support & Legal</Text>
        <SettingItem icon="help-circle" label="Help Center" />
        <SettingItem icon="file-text" label="Terms of Service" />
        <SettingItem icon="info" label="App Version" sublabel="v1.2.0 (Stable)" type="text" />

        <TouchableOpacity style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Log Out from All Devices</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#003366",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  settingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#003366",
  },
  settingSublabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: "#FFEBEB",
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#D32F2F",
    marginLeft: 12,
    textTransform: "uppercase",
  },
});
