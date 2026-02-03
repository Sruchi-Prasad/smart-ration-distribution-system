import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Suggestion");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) {
      Toast.show({ type: "error", text1: "Feedback required ❌" });
      return;
    }
    // Here you’d send feedback to backend API
    Toast.show({ type: "success", text1: "Thank you!", text2: "Your feedback has been submitted ✅" });
    setName(""); setEmail(""); setMessage(""); setType("Suggestion");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 ,justifyContent:"center"}}>
        <Image
          source={require("../../assets/images/emblem.png")}
          style={{ width: 40, height: 40, marginRight: 10 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#003366" }}>
          SMART RATION DISTRIBUTION SYSTEM
        </Text>
      </View>
      <Text style={styles.subtitle}>We value your feedback! Please share your thoughts below.</Text>

      <TextInput style={styles.input} placeholder="Your Name (optional)" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Your Email (optional)" value={email} onChangeText={setEmail} />

      <Text style={styles.label}>Feedback Type</Text>
      <Picker selectedValue={type} onValueChange={(val) => setType(val)} style={styles.input}>
        <Picker.Item label="Suggestion" value="Suggestion" />
        <Picker.Item label="Bug Report" value="Bug" />
        <Picker.Item label="Complaint" value="Complaint" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      <Text style={styles.label}>Your Feedback</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Write your feedback here..."
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Feedback</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 20, fontWeight: "bold", color: "#003366", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "bold", color: "#003366", marginTop: 12 },
  input: { backgroundColor: "#fff", borderRadius: 6, borderWidth: 1, borderColor: "#ccc", padding: 10, marginTop: 8 },
  button: { backgroundColor: "#003366", padding: 14, borderRadius: 6, marginTop: 20, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
