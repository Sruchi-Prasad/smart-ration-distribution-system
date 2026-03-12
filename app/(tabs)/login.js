import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/config";

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    console.log("Skipping push notification registration on web");
    return null;
  }

  if (!Device.isDevice) {
    alert("Must use physical device for notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Notification permission not granted!");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  // states remain the same
  const [loginMethod, setLoginMethod] = useState("password");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rationCard, setRationCard] = useState("");
  // ✅ PASSWORD LOGIN
  const handleLogin = async () => {
    const isUser = role.toLowerCase() === "user";
    if ((!isUser && (!email || !password)) || (isUser && !rationCard) || !role) {
      Toast.show({ type: "error", text1: isUser ? "Ration Card & role required ❌" : "Email, password & role required ❌" });
      return;
    }

    try {
      // Normalize email & role
      const payload = {
        email: role.toLowerCase() === "user" ? undefined : email.toLowerCase(),
        rationCard: role.toLowerCase() === "user" ? rationCard : undefined,
        password,
        role: role.toLowerCase()
      };
      console.log("🚀 Sending login request:", payload);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
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
        await AsyncStorage.setItem("userId", data.user._id);
        await AsyncStorage.setItem("accessToken", data.accessToken);
        await AsyncStorage.setItem("refreshToken", data.refreshToken);

        // ✅ Update Auth Context
        await login(data.user);

        const expoToken = await registerForPushNotificationsAsync();
        if (expoToken) {
          await fetch(`${API_BASE}/api/auth/save-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.accessToken}`
            },
            body: JSON.stringify({ token: expoToken })
          });
        }

        setTimeout(() => {
          if (data.user.role === "admin") router.push("/admin/AdminPanel");
          else if (data.user.role === "shopkeeper") router.push("/shopkeeper/ShopPanel");
          else router.push("/(tabs)/profile");
        }, 500);

      } else {
        // Show backend message if present
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
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
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
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
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

        // ✅ Update Auth Context
        await login(data.user);

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
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
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
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
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

  // ... all imports remain the same

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: "#f5f5f5" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
        <View style={{
          width: "90%",
          maxWidth: 450,
          backgroundColor: "#fff",
          borderRadius: 24,
          elevation: 10,
          padding: 32,
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 20,
          borderBottomWidth: 6,
          borderBottomColor: "#FF9933",
        }}>

          <MaterialCommunityIcons name="sack" size={72} color="#003366" style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#003366", marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>Login</Text>

          {/* Toggle Login Method */}
          <View style={{ flexDirection: "row", marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <TouchableOpacity onPress={() => { setLoginMethod("password"); setStep(1); }} style={{ marginRight: 20, marginBottom: 8 }}>
              <Text style={{ color: loginMethod === "password" ? "#003366" : "#777", fontWeight: "bold" }}>Password Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setLoginMethod("otp"); setStep(1); }} style={{ marginBottom: 8 }}>
              <Text style={{ color: loginMethod === "otp" ? "#003366" : "#777", fontWeight: "bold" }}>OTP Login</Text>
            </TouchableOpacity>
          </View>

          {/* LOGIN FORMS */}
          {(loginMethod === "password" && !forgotPasswordStep) && (
            <>
              {role.toLowerCase() === "user" ? (
                <>
                  <Text style={styles.label}>Ration Card Number</Text>
                  <TextInput style={styles.input} placeholder="Ration Card Number" value={rationCard} onChangeText={setRationCard} />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Email</Text>
                  <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
                </>
              )}

              {role.toLowerCase() !== "user" && (
                <>
                  <Text style={styles.label}>Password</Text>
                  <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
                </>
              )}

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
          {(loginMethod === "otp" && !forgotPasswordStep) && (
            <>
              {step === 1 ? (
                <>
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
            <Text style={{ fontSize: 14, color: "#00796B", fontWeight: "600", textAlign: "center" }}>
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
    fontSize: 15,
    fontWeight: "800",
    color: "#003366",
    marginBottom: 6,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#EEF2F6",
    marginBottom: 4,
    color: "#003366",
    fontWeight: "600",
  },
  button: {
    width: "100%",
    height: 54,
    backgroundColor: "#003366",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 4,
    shadowColor: "#003366",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
};
