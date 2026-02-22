import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function Registration() {
  const router = useRouter();

  // Common states
  const [role, setRole] = useState(""); // "user" or "shopkeeper"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [memberDetails, setMemberDetails] = useState([]);

  // User-specific
  const [rationCard, setRationCard] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [members, setMembers] = useState("");

  // Shopkeeper-specific
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
          Alert.alert("Error", `Please fill details for Member ${i + 1}`);
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
        Alert.alert("Error", "Aadhaar number must be 12 digits");
        return;
      }
      url = "http://localhost:8000/api/auth/register";
      body = {
        fullName,
        rationCard,
        aadhaarNumber,
        members: Number(members),
        email,
        phone,
        country,
        state,
        city,
        password,
        dateOfBirth: new Date(dateOfBirth),
        memberDetails,
        role,
      };
    }
    else if (role === "shopkeeper") {
      if (!shopName.trim()) {
        Alert.alert("Error", "Shop name is required for shopkeepers");
        return;
      }
      url = "http://localhost:8000/api/auth/register-shopkeeper";
      body = {
        fullName,
        email,
        password,
        shopName,
        state,
        phone,
        country,
        city,
        role
      };
    }


    console.log("Registering with:", body); // ✅ Debug log

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      Alert.alert("Response", data.message);

      if (response.status === 201) {
        router.push("/(tabs)/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
          <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
        </View>

        <Text style={styles.sectionTitle}>Registration</Text>

        {/* Role Picker */}
        <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)} style={styles.input}>
          <Picker.Item label="Select Role" value="" />
          <Picker.Item label="User" value="user" />
          <Picker.Item label="Shopkeeper" value="shopkeeper" />
        </Picker>

        {/* Common Fields */}
        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextInput style={styles.input} placeholder="Country" value={country} onChangeText={setCountry} />
        <Picker selectedValue={state} onValueChange={(itemValue) => setState(itemValue)} style={styles.input}>
          <Picker.Item label="Select State" value="" />
          <Picker.Item label="Maharashtra" value="Maharashtra" />
          <Picker.Item label="Kerala" value="Kerala" />
          <Picker.Item label="Tamil Nadu" value="Tamil Nadu" />
          <Picker.Item label="Delhi" value="Delhi" />
          <Picker.Item label="West Bengal" value="West Bengal" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
        <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        {/* User-specific Fields */}
        {role === "user" && (
          <>
            <TextInput style={styles.input} placeholder="Aadhaar Number" keyboardType="numeric" value={aadhaarNumber} onChangeText={setAadhaarNumber} />
            <TextInput style={styles.input} placeholder="Ration Card Number" value={rationCard} onChangeText={setRationCard} />
            <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" value={dateOfBirth} onChangeText={setDateOfBirth} />
            <TextInput
              style={styles.input}
              placeholder="Number of Members"
              keyboardType="numeric"
              value={members}
              onChangeText={(val) => {
                setMembers(val);
                const num = parseInt(val) || 0;
                setMemberDetails(Array.from({ length: num }, () => ({ name: "", age: "" })));
              }}
            />
          </>
        )}

        {memberDetails.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              Members Detail
            </Text>
            {memberDetails.map((member, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={styles.label}>Member {index + 1} Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter name"
                  value={member.name}
                  onChangeText={(val) => {
                    const updated = [...memberDetails];
                    updated[index].name = val;
                    setMemberDetails(updated);
                  }}
                />

                <Text style={styles.label}>Member {index + 1} Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter age"
                  keyboardType="numeric"
                  value={member.age}
                  onChangeText={(val) => {
                    const updated = [...memberDetails];
                    updated[index].age = val;
                    setMemberDetails(updated);
                  }}
                />
              </View>
            ))}
          </View>
        )}


        {/* Shopkeeper-specific Fields */}
        {role === "shopkeeper" && (
          <TextInput style={styles.input} placeholder="Shop Name" value={shopName} onChangeText={setShopName} />
        )}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(tabs)/login")}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, backgroundColor: "#f5f5f5" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  sectionTitle: { fontSize: 24, fontWeight: "bold", color: "#003366", marginBottom: 20, textAlign: "center" },
  input: { backgroundColor: "#fff", padding: 14, borderRadius: 6, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: "#ccc" },
  button: { backgroundColor: "#003366", paddingVertical: 14, borderRadius: 6, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  link: { fontSize: 14, color: "#00796B", textAlign: "center", fontWeight: "600" },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003366",
    marginBottom: 4,
  },

});
