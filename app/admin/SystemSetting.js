import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function SystemSettings() {
    const router = useRouter();
    const [settings, setSettings] = useState({
        appName: "Smart Ration Distribution System",
        enable2FA: true,
        maintenanceMode: false,
        allowRegistration: true
    });

    const toggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <View style={styles.pageHeader}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="#003366" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>System Configuration</Text>
                    <MaterialIcons name="settings" size={24} color="#003366" />
                </View>

                {/* GENERAL */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="dns" size={20} color="#FF9933" />
                        <Text style={styles.sectionTitle}>General Parameters</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Registry Designation</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.appName}
                            onChangeText={(t) => setSettings({ ...settings, appName: t })}
                        />
                    </View>
                </View>

                {/* SECURITY */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="security" size={20} color="#128807" />
                        <Text style={styles.sectionTitle}>Security Protocols</Text>
                    </View>

                    <SettingRow
                        icon="fingerprint"
                        title="Two-Factor Authentication"
                        description="Require secondary verification for admin access"
                        checked={settings.enable2FA}
                        onToggle={() => toggle("enable2FA")}
                    />
                </View>

                {/* FEATURES */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="extension" size={20} color="#003366" />
                        <Text style={styles.sectionTitle}>Operational Modules</Text>
                    </View>

                    <SettingRow
                        icon="construction"
                        title="Maintenance Mode"
                        description="Restrict public access for system upgrades"
                        checked={settings.maintenanceMode}
                        onToggle={() => toggle("maintenanceMode")}
                    />

                    <View style={styles.divider} />

                    <SettingRow
                        icon="person-add"
                        title="User Registration"
                        description="Enable new beneficiary self-enrollment"
                        checked={settings.allowRegistration}
                        onToggle={() => toggle("allowRegistration")}
                    />
                </View>

                <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8}>
                    <MaterialIcons name="save" size={20} color="white" />
                    <Text style={styles.saveBtnText}>Commit Changes</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>System Version 2.0.4-LTS</Text>
                    <Text style={styles.syncText}>Last synchronized: 2 minutes ago</Text>
                </View>
            </View>
        </ScrollView>
    );
}

function SettingRow({ icon, title, description, checked, onToggle }) {
    return (
        <View style={styles.row}>
            <View style={styles.rowLead}>
                <View style={styles.iconHole}>
                    <MaterialIcons name={icon} size={18} color="#003366" />
                </View>
                <View style={styles.rowText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingDesc}>{description}</Text>
                </View>
            </View>
            <Switch
                value={checked}
                onValueChange={onToggle}
                trackColor={{ false: "#E2E8F0", true: "#003366" }}
                thumbColor={checked ? "#FF9933" : "#F8FAFC"}
            />
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
    sectionCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: "#EEF2F6",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "900",
        color: "#003366",
        marginLeft: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    inputGroup: {
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: "800",
        color: "#999",
        marginBottom: 8,
        textTransform: "uppercase",
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#EEF2F6",
        padding: 16,
        borderRadius: 16,
        fontSize: 15,
        fontWeight: "600",
        color: "#003366",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    rowLead: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconHole: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#F0F4F8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    rowText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#003366",
        marginBottom: 2,
    },
    settingDesc: {
        fontSize: 11,
        color: "#999",
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginVertical: 16,
    },
    saveBtn: {
        backgroundColor: "#003366",
        padding: 18,
        borderRadius: 20,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        borderWidth: 2,
        borderColor: "#FF9933",
    },
    saveBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "900",
        marginLeft: 10,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    footer: {
        marginTop: 32,
        alignItems: "center",
    },
    versionText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#CBD5E1",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    syncText: {
        fontSize: 10,
        color: "#94A3B8",
        marginTop: 4,
        fontWeight: "600",
    }
});
