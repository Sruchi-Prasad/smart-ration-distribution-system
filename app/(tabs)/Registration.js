import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { API_BASE } from "../../utils/config";

export default function Registration() {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [memberDetails, setMemberDetails] = useState([]);

  const [rationCard, setRationCard] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [members, setMembers] = useState("");
  const [shopName, setShopName] = useState("");

  const handleRegister = async () => {
    if (!role) {
      Alert.alert("Error", "Please select a role");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (role === "user") {
      if (!members || Number(members) <= 0) {
        Alert.alert("Error", "Please enter number of members");
        return;
      }
      for (let i = 0; i < memberDetails.length; i++) {
        if (!memberDetails[i].name || !memberDetails[i].age) {
          Alert.alert("Error", `Details required for Member ${i + 1}`);
          return;
        }
      }
    }

    let url = "";
    let body = {};

    if (role === "user") {
      if (!rationCard.trim()) {
        Alert.alert("Error", "Ration Card Number is required");
        return;
      }
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        Alert.alert("Error", "Aadhaar must be 12 digits");
        return;
      }
      url = `${API_BASE}/api/auth/register`;
      body = { fullName, rationCard, aadhaarNumber, members: Number(members), email, phone, country, state, city, password, dateOfBirth: new Date(dateOfBirth), memberDetails, role };
    } else {
      url = `${API_BASE}/api/auth/register-shopkeeper`;
      body = { fullName, email, password, shopName, state, phone, country, city, role };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      Alert.alert("Registration", data.message);
      if (response.status === 201) router.push("/login");
    } catch (error) {
      Alert.alert("Error", "Backend synchronization failed");
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
          <Text style={styles.headerTitle}>Account Setup</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.formTitle}>Official Registry</Text>
          <Text style={styles.formSubtitle}>Enter credentials to access PDS services</Text>

          {/* ROLE PICKER */}
          <Text style={styles.label}>Identify Your Role</Text>
          <View style={styles.pickerContainer}>
            <Feather name="shield" size={18} color="#003366" />
            <Picker selectedValue={role} onValueChange={(val) => setRole(val)} style={styles.picker}>
              <Picker.Item label="Select Designation" value="" />
              <Picker.Item label="Citizen / User" value="user" />
              <Picker.Item label="Shopkeeper / PDS Official" value="shopkeeper" />
            </Picker>
          </View>

          {/* COMMON FIELDS */}
          <Text style={styles.label}>Full Identity Name</Text>
          <InputField icon="user" placeholder="Enter Government Name" value={fullName} onChange={setFullName} />

          <Text style={styles.label}>Contact Information</Text>
          <InputField icon="mail" placeholder="official@email.gov" value={email} onChange={setEmail} keyboard="email-address" />
          <InputField icon="phone" placeholder="+91 Phone Number" value={phone} onChange={setPhone} keyboard="phone-pad" />

          {/* LOCATION */}
          <Text style={styles.label}>Geographic Location</Text>
          <InputField icon="map-pin" placeholder="Country" value={country} onChange={setCountry} />
          <View style={styles.pickerContainer}>
            <Feather name="activity" size={18} color="#003366" />
            <Picker selectedValue={state} onValueChange={(val) => setState(val)} style={styles.picker}>
              <Picker.Item label="Select State / UT" value="" />
              <Picker.Item label="Maharashtra" value="Maharashtra" />
              <Picker.Item label="Kerala" value="Kerala" />
              <Picker.Item label="Tamil Nadu" value="Tamil Nadu" />
              <Picker.Item label="Delhi" value="Delhi" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <InputField icon="home" placeholder="Resident City" value={city} onChange={setCity} />

          <Text style={styles.label}>Security Protocol</Text>
          <InputField icon="lock" placeholder="Password (8+ chars)" value={password} onChange={setPassword} secure />
          <InputField icon="check-square" placeholder="Verify Password" value={confirmPassword} onChange={setConfirmPassword} secure />

          {/* ROLE SPECIFIC */}
          {role === "user" ? (
            <>
              <Text style={styles.label}>Document Verification</Text>
              <InputField icon="credit-card" placeholder="12-Digit Aadhaar ID" value={aadhaarNumber} onChange={setAadhaarNumber} keyboard="numeric" />
              <InputField icon="file-text" placeholder="Ration Card Identification" value={rationCard} onChange={setRationCard} />
              <InputField icon="calendar" placeholder="DOB (YYYY-MM-DD)" value={dateOfBirth} onChange={setDateOfBirth} />

              <Text style={styles.label}>Household Census</Text>
              <InputField icon="users" placeholder="Total Occupants" value={members} onChange={(val) => {
                setMembers(val);
                const num = parseInt(val) || 0;
                setMemberDetails(Array.from({ length: Math.min(num, 15) }, () => ({ name: "", age: "" })));
              }} keyboard="numeric" />

              {memberDetails.length > 0 && (
                <View style={styles.memberBox}>
                  <Text style={styles.memberHeader}>Member Registry List</Text>
                  {memberDetails.map((member, idx) => (
                    <View key={idx} style={styles.memberRow}>
                      <Text style={styles.miniLabel}>Member {idx + 1}</Text>
                      <InputField icon="user" placeholder="Full Name" value={member.name} onChange={(v) => {
                        const update = [...memberDetails]; update[idx].name = v; setMemberDetails(update);
                      }} />
                      <InputField icon="clock" placeholder="Age" value={member.age} onChange={(v) => {
                        const update = [...memberDetails]; update[idx].age = v; setMemberDetails(update);
                      }} keyboard="numeric" />
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : role === "shopkeeper" ? (
            <>
              <Text style={styles.label}>PDS Establishment</Text>
              <InputField icon="shopping-bag" placeholder="Official Shop Name" value={shopName} onChange={setShopName} />
            </>
          ) : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
            <Text style={styles.btnText}>VALIDATE & REGISTER</Text>
            <MaterialIcons name="near-me" size={20} color="white" style={{ marginLeft: 12 }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => router.push("/login")}>
            <Text style={styles.linkText}>ALREADY AUTHENTICATED? SIGN IN</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const InputField = ({ icon, placeholder, value, onChange, keyboard = "default", secure = false }) => (
  <View style={styles.inputContainer}>
    <Feather name={icon} size={18} color="#003366" />
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={onChange}
      style={styles.input}
      keyboardType={keyboard}
      secureTextEntry={secure}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24, marginTop: 10 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  backText: { marginLeft: 4, fontWeight: "800", color: "#003366", fontSize: 13 },
  headerTitle: { fontSize: 16, fontWeight: "900", color: "#003366", marginLeft: 20, textTransform: "uppercase", letterSpacing: 1 },

  card: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    elevation: 8,
    shadowColor: "#003366",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  formTitle: { fontSize: 24, fontWeight: "900", color: "#003366", textAlign: "center" },
  formSubtitle: { fontSize: 13, color: "#64748B", textAlign: "center", marginTop: 6, fontWeight: "600", marginBottom: 20 },

  label: { fontSize: 10, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10, marginTop: 24 },

  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 16, marginBottom: 12 },
  input: { flex: 1, height: 50, marginLeft: 12, fontSize: 14, color: "#003366", fontWeight: "700" },

  pickerContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 16, height: 50, marginBottom: 12, overflow: "hidden" },
  picker: { flex: 1, color: "#003366", marginLeft: 8 },

  memberBox: { marginTop: 20, padding: 20, backgroundColor: "#F1F5F9", borderRadius: 24 },
  memberHeader: { fontSize: 14, fontWeight: "900", color: "#003366", marginBottom: 16, borderLeftWidth: 4, borderLeftColor: "#FF9933", paddingLeft: 12 },
  memberRow: { marginBottom: 24 },
  miniLabel: { fontSize: 10, fontWeight: "800", color: "#64748B", marginBottom: 8, textTransform: "uppercase" },

  primaryBtn: {
    backgroundColor: "#003366",
    flexDirection: "row",
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    elevation: 4,
  },
  btnText: { color: "white", fontSize: 15, fontWeight: "900", letterSpacing: 1 },

  linkBtn: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 11, fontWeight: "900", color: "#64748B", letterSpacing: 1 },
});
