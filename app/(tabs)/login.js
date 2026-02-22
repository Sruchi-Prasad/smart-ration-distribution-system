import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from 'react-native-toast-message';

export default function Login() {
  const router = useRouter();

  // States
  const [loginMethod, setLoginMethod] = useState("password"); // "password" or "otp"
  const [step, setStep] = useState(1); // OTP step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("");

  const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ✅ PASSWORD LOGIN
  const handleLogin = async () => {
    if (!email || !password || !role) {
      Toast.show({ type: "error", text1: "Email, password & role required ❌" });
      return;
    }

    try {
      const payload = { email, password, role };
      console.log("🚀 Sending login request:", payload);

      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("📡 Login response status:", res.status);
      console.log("📡 Login response body:", data);

      if (res.status === 200 && data.user) {
        Toast.show({ type: "success", text1: "Login Successful ✅" });
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("accessToken", data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);

        setTimeout(() => {
          if (data.user.role === "admin") router.push("/admin/AdminPanel");
          else if (data.user.role === "shopkeeper") router.push("/shopkeeper/ShopPanel");
          else router.push("/(tabs)/profile");
        }, 500);
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed ❌",
          text2: data.message || "Invalid credentials",
        });
      }
    } catch (err) {
      console.log("❌ Login error:", err);
      Toast.show({
        type: "error",
        text1: "Server error ❌",
        text2: "Backend not reachable",
      });
    }
  };

  // ✅ OTP LOGIN: SEND OTP
  const handleSendOtp = async () => {
    if (!aadhaar && !email) {
      Toast.show({ type: "error", text1: "Email or Aadhaar required ❌" });
      return;
    }
    if (!role) {
      Toast.show({ type: "error", text1: "Role required ❌" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, aadhaar, role })
      });
      const data = await res.json();

      if (res.status === 200 && data.success) {
        Toast.show({ type: "success", text1: "OTP Sent ✅", text2: "Check email/console" });
        setStep(2);
      } else {
        Toast.show({ type: "error", text1: "OTP Failed ❌", text2: data.message || "Could not send OTP" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Server error ❌", text2: "Backend not reachable" });
    }
  };

  // ✅ OTP LOGIN: VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      Toast.show({ type: "error", text1: "OTP required ❌" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, aadhaar, role, otp })
      });
      const data = await res.json();

      if (data.success) {
        Alert.alert("Login Successful ✅", "OTP verified!");
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("accessToken", data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);

        setTimeout(() => {
          if (data.user.role === "admin") router.push("/admin/AdminPanel");
          else if (data.user.role === "shopkeeper") router.push("/shopkeeper/ShopPanel");
          else router.push("/(tabs)/profile");
        }, 500);
      } else {
        Alert.alert("Error ❌", data.message || "Invalid OTP");
      }
    } catch (err) {
      Alert.alert("Error ❌", "Backend not reachable");
    }
  };

  // ✅ FORGOT PASSWORD: SEND OTP
  const handleForgotPassword = async () => {
    if (!email || !role) {
      Toast.show({ type: "error", text1: "Email & role required ❌" });
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
        Toast.show({ type: "success", text1: "OTP Sent ✅" });
        setForgotPasswordStep(true);
      } else {
        Toast.show({ type: "error", text1: "Failed ❌", text2: data.message || "Try again" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Server error ❌", text2: "Backend not reachable" });
    }
  };

  // ✅ FORGOT PASSWORD: RESET PASSWORD
  const handleResetPassword = async () => {
    if (!forgotOtp || !newPassword) {
      Toast.show({ type: "error", text1: "OTP & new password required ❌" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, otp: forgotOtp, newPassword })
      });
      const data = await res.json();

      if (res.status === 200 && data.success) {
        Toast.show({ type: "success", text1: "Password reset successful ✅" });
        setForgotPasswordStep(false);
        setForgotOtp(""); setNewPassword(""); setEmail(""); setRole("");
      } else {
        Toast.show({ type: "error", text1: "Failed ❌", text2: data.message || "Invalid OTP" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Server error ❌", text2: "Backend not reachable" });
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
        <View style={{
          width: 450,
          backgroundColor: "#E3F2FD",
          borderRadius: 10,
          elevation: 5,
          padding: 24,
          alignItems: "center"
        }}>
          {/* Logo */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
            <Image source={require("../../assets/images/emblem.png")} style={{ width: 40, height: 40, marginRight: 10 }} />
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#003366" }}>
              SMART RATION DISTRIBUTION SYSTEM
            </Text>
          </View>

          <MaterialCommunityIcons name="sack" size={64} color="#003366" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#003366", marginBottom: 20 }}>Login</Text>

          {/* Toggle Login Method */}
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <TouchableOpacity onPress={() => { setLoginMethod("password"); setStep(1); }} style={{ marginRight: 20 }}>
              <Text style={{ color: loginMethod === "password" ? "#003366" : "#777", fontWeight: "bold" }}>Password Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setLoginMethod("otp"); setStep(1); }}>
              <Text style={{ color: loginMethod === "otp" ? "#003366" : "#777", fontWeight: "bold" }}>OTP Login</Text>
            </TouchableOpacity>
          </View>

          {/* PASSWORD LOGIN */}
          {loginMethod === "password" && !forgotPasswordStep && (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
              <Text style={styles.label}>Role</Text>
              <Picker selectedValue={role} onValueChange={setRole} style={styles.input}>
                <Picker.Item label="Select Role" value="" />
                <Picker.Item label="User" value="user" />
                <Picker.Item label="Shopkeeper" value="shopkeeper" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>

              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                <Text style={styles.buttonText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          )}

          {/* OTP LOGIN */}
          {loginMethod === "otp" && !forgotPasswordStep && (
            <>
              {step === 1 ? (
                <>
                  {/** Aadhaar + Email + Role inputs */}
                  <Text style={styles.label}>Aadhaar (optional)</Text>
                  <TextInput style={styles.input} placeholder="Enter Aadhaar" keyboardType="numeric" value={aadhaar} onChangeText={setAadhaar} />
                  <Text style={styles.label}>Email</Text>
                  <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
                  <Text style={styles.label}>Role</Text>
                  <Picker selectedValue={role} onValueChange={setRole} style={styles.input}>
                    <Picker.Item label="Select Role" value="" />
                    <Picker.Item label="User" value="user" />
                    <Picker.Item label="Shopkeeper" value="shopkeeper" />
                    <Picker.Item label="Admin" value="admin" />
                  </Picker>

                  <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                    <Text style={styles.buttonText}>Send OTP</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Enter OTP</Text>
                  <TextInput style={styles.input} placeholder="OTP" keyboardType="numeric" value={otp} onChangeText={setOtp} />
                  <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* FORGOT PASSWORD */}
          {forgotPasswordStep && (
            <>
              <Text style={styles.label}>Enter OTP</Text>
              <TextInput style={styles.input} placeholder="OTP" keyboardType="numeric" value={forgotOtp} onChangeText={setForgotOtp} />
              <Text style={styles.label}>New Password</Text>
              <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
              <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
              </TouchableOpacity>
            </>
          )}
          {/* Registration Link */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/Registration")} style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 14, color: "#00796B", fontWeight: "600" }}>
              Registration before login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
