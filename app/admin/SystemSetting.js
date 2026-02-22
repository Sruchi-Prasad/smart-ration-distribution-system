import { useState } from "react";

export default function SystemSettings() {

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
        <div style={styles.page}>
            <div style={styles.wrapper}>

                <h1 style={styles.heading}>⚙️ System Settings</h1>

                {/* GENERAL */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>General</div>

                    <label style={styles.label}>Application Name</label>
                    <input
                        style={styles.input}
                        value={settings.appName}
                        onChange={(e) =>
                            setSettings({ ...settings, appName: e.target.value })
                        }
                    />
                </div>

                {/* SECURITY */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>Security</div>

                    <SettingRow
                        title="Enable Two-Factor Authentication"
                        checked={settings.enable2FA}
                        onChange={() => toggle("enable2FA")}
                    />
                </div>

                {/* FEATURES */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>Features</div>

                    <SettingRow
                        title="Maintenance Mode"
                        checked={settings.maintenanceMode}
                        onChange={() => toggle("maintenanceMode")}
                    />

                    <SettingRow
                        title="Allow User Registration"
                        checked={settings.allowRegistration}
                        onChange={() => toggle("allowRegistration")}
                    />
                </div>

                <button
                    style={styles.saveBtn}
                    onMouseOver={e => e.target.style.transform = "translateY(-2px)"}
                    onMouseOut={e => e.target.style.transform = "translateY(0)"}
                >
                    Save Settings
                </button>

            </div>
        </div>
    );
}


/* ---------- Toggle Row Component ---------- */
function SettingRow({ title, checked, onChange }) {
    return (
        <div style={styles.row}>
            <span>{title}</span>

            <div
                onClick={onChange}
                style={{
                    width: 48,
                    height: 26,
                    borderRadius: 20,
                    backgroundColor: checked ? "#2563eb" : "#cbd5e1",
                    position: "relative",
                    cursor: "pointer",
                    transition: "0.25s"
                }}
            >
                <div
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: 3,
                        left: checked ? 24 : 3,
                        transition: "0.25s",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
                    }}
                />
            </div>
        </div>
    );
}
const styles = {
    page: {
        background: "linear-gradient(135deg,#eef2ff,#f8fafc)",
        minHeight: "100vh",
        padding: 40,
        display: "flex",
        justifyContent: "center"
    },

    wrapper: {
        width: "100%",
        maxWidth: 750
    },

    heading: {
        marginBottom: 25,
        color: "#0f172a"
    },

    card: {
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
    },

    cardHeader: {
        fontWeight: 600,
        fontSize: 18,
        marginBottom: 18,
        color: "#1e293b"
    },

    label: {
        fontSize: 14,
        color: "#64748b"
    },

    input: {
        width: "100%",
        marginTop: 8,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #e2e8f0",
        fontSize: 15
    },

    row: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0"
    },

    saveBtn: {
        width: "100%",
        padding: 14,
        borderRadius: 12,
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        transition: "0.25s",
        boxShadow: "0 6px 14px rgba(37,99,235,.3)"
    }
};