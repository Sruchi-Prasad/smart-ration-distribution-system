import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import Toast from 'react-native-toast-message';

export default function Login() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(false); // toggle forgot password view
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 🔹 Send forgot password email / OTP
  const handleForgotPassword = async () => {
    if (!email || !role) {
      Toast.show({ type: 'error', text1: 'Email and role required ❌' });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
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

  // 🔹 Verify OTP and reset password
  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Toast.show({ type: 'error', text1: 'OTP and new password required ❌' });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, otp, newPassword })
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        Toast.show({ type: 'success', text1: 'Password reset successful ✅' });
        setForgotPasswordStep(false);
        setOtp(""); setNewPassword(""); setEmail(""); setRole("");
      } else {
        Toast.show({ type: 'error', text1: 'Failed ❌', text2: data.message || 'Invalid OTP' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Server error ❌', text2: 'Backend not reachable' });
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" }}>
      {!forgotPasswordStep ? (
        <>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, marginBottom: 12 }}
          />
          <TextInput
            placeholder="Role (user / shopkeeper / admin)"
            value={role}
            onChangeText={setRole}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, marginBottom: 12 }}
          />
          <TouchableOpacity onPress={handleForgotPassword} style={{ backgroundColor: "#003366", padding: 14, borderRadius: 6 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>Forgot Password?</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, marginBottom: 12 }}
          />
          <TextInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6, marginBottom: 12 }}
          />
          <TouchableOpacity onPress={handleResetPassword} style={{ backgroundColor: "#003366", padding: 14, borderRadius: 6 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
const styles = {
  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#003366",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  }
};
