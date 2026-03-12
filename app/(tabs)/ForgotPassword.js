import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import { API_BASE } from "../../utils/config";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleForgotPassword = async () => {
    if (!email || !role) {
      Toast.show({ type: 'error', text1: 'Email and role required ❌' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });
      const data = await res.json();

      if (res.status === 200 && data.success) {
        Toast.show({ type: 'success', text1: 'OTP Sent ✅', text2: 'Check your email' });
        setForgotPasswordStep(true);
      } else {
        Toast.show({ type: 'error', text1: 'Failed ❌', text2: data.message || 'Try again' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Server error ❌', text2: 'Backend not reachable' });
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Toast.show({ type: 'error', text1: 'OTP and new password required ❌' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, otp, newPassword })
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        Toast.show({ type: 'success', text1: 'Password reset successful ✅' });
        setForgotPasswordStep(false);
        setOtp(""); setNewPassword(""); setEmail(""); setRole("");
        router.push("/login");
      } else {
        Toast.show({ type: 'error', text1: 'Failed ❌', text2: data.message || 'Invalid OTP' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Server error ❌', text2: 'Backend not reachable' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#003366" />
            <Text style={styles.backText}>Return</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>STEP {forgotPasswordStep ? "02" : "01"}/02</Text>
          </View>

          <View style={styles.headerArea}>
            <View style={styles.iconBox}>
              <MaterialIcons name={forgotPasswordStep ? "security" : "lock-reset"} size={40} color="white" />
            </View>
            <Text style={styles.title}>Secure Recovery</Text>
            <Text style={styles.subtitle}>
              {forgotPasswordStep
                ? "Enter the verification code sent to your authorized email address."
                : "Provide your registered email and primary role to initiate the recovery protocol."}
            </Text>
          </View>

          {!forgotPasswordStep ? (
            <View style={styles.form}>
              <Text style={styles.label}>Electronic Mail Address</Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#003366" />
                <TextInput
                  placeholder="name@official.gov"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.label}>Administrative Role</Text>
              <View style={styles.inputContainer}>
                <Feather name="users" size={20} color="#003366" />
                <TextInput
                  placeholder="e.g., user, shopkeeper, admin"
                  value={role}
                  onChangeText={setRole}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity onPress={handleForgotPassword} style={styles.primaryBtn}>
                <Text style={styles.btnText}>INITIATE RECOVERY</Text>
                <MaterialIcons name="send" size={20} color="white" style={{ marginLeft: 12 }} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>OTP Verification Code</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="vpn-key" size={20} color="#003366" />
                <TextInput
                  placeholder="Enter 6-digit PIN"
                  value={otp}
                  onChangeText={setOtp}
                  style={styles.input}
                  keyboardType="number-pad"
                />
              </View>

              <Text style={styles.label}>New Access PIN</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#003366" />
                <TextInput
                  placeholder="Authorized characters only"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <TouchableOpacity onPress={handleResetPassword} style={styles.primaryBtn}>
                <Text style={styles.btnText}>VALIDATE & UPDATE</Text>
                <MaterialIcons name="done-all" size={20} color="white" style={{ marginLeft: 12 }} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setForgotPasswordStep(false)} style={styles.resendBtn}>
                <Text style={styles.resendText}>DIDN'T GET CODE? RESEND</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.footerNote}>
          <MaterialIcons name="info" size={16} color="#64748B" />
          <Text style={styles.footerText}>Secure end-to-end encrypted recovery system.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, flexGrow: 1, justifyContent: "center" },
  header: { position: "absolute", top: 20, left: 20, zIndex: 10 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  backText: { marginLeft: 4, fontWeight: "800", color: "#003366", fontSize: 13 },

  card: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 30,
    elevation: 12,
    shadowColor: "#003366",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginTop: 60,
  },
  stepIndicator: { alignSelf: "center", backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  stepText: { fontSize: 10, fontWeight: "900", color: "#64748B", letterSpacing: 2 },

  headerArea: { alignItems: "center", marginBottom: 30 },
  iconBox: { width: 80, height: 80, borderRadius: 24, backgroundColor: "#003366", justifyContent: "center", alignItems: "center", elevation: 6 },
  title: { fontSize: 24, fontWeight: "900", color: "#003366", marginTop: 20, textTransform: "uppercase", letterSpacing: 1 },
  subtitle: { fontSize: 13, color: "#64748B", textAlign: "center", marginTop: 12, lineHeight: 20, fontWeight: "600", paddingHorizontal: 10 },

  form: { marginTop: 10 },
  label: { fontSize: 10, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 20 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 18, borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 18 },
  input: { flex: 1, height: 56, marginLeft: 14, fontSize: 15, color: "#003366", fontWeight: "700" },

  primaryBtn: {
    flexDirection: "row",
    backgroundColor: "#FF9933",
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    elevation: 8,
    shadowColor: "#FF9933",
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  btnText: { color: "white", fontSize: 15, fontWeight: "900", letterSpacing: 1.5 },

  resendBtn: { marginTop: 24, alignItems: "center" },
  resendText: { fontSize: 11, fontWeight: "900", color: "#64748B", letterSpacing: 1 },

  footerNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 30 },
  footerText: { fontSize: 12, fontWeight: "600", color: "#94A3B8", marginLeft: 8 },
});
