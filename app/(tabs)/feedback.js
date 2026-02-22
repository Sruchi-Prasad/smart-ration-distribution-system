import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Suggestion");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [shops, setShops] = useState([]);              // Stores shop list from DB
  const [selectedShop, setSelectedShop] = useState(""); // Selected shopId
  const [shopFeedback, setShopFeedback] = useState([]); // Feedback for selected shop

  // Fetch shopkeepers from DB
  useEffect(() => {
    fetch("http://localhost:8000/api/shops")
      .then(res => res.json())
      .then(data => {
        console.log("Shops fetched:", data);
        setShops(data);
      })
      .catch(err => console.log("Error fetching shops", err));
  }, []);

  // Fetch feedback when a shop is selected
  useEffect(() => {
    if (!selectedShop) return;

    fetch(`http://localhost:8000/api/feedback/shop/${selectedShop}`)
      .then(res => res.json())
      .then(data => setShopFeedback(data))
      .catch(err => console.log("Error fetching shop feedback", err));
  }, [selectedShop]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Toast.show({ type: "error", text1: "Feedback required ❌" });
      return;
    }
    if (!selectedShop) {
      Toast.show({ type: "error", text1: "Please select a shop ❌" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: selectedShop, // Send shopId
          name,
          email,
          type,
          message
        })
      });

      if (res.ok) {
        Toast.show({ type: "success", text1: "Thank you!", text2: "Your feedback has been submitted ✅" });
        setSubmitted(true);
        setName(""); setEmail(""); setMessage(""); setType("Suggestion");

        // Refresh feedback list
        fetch(`http://localhost:8000/api/feedback/shop/${selectedShop}`)
          .then(res => res.json())
          .then(data => setShopFeedback(data));
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Submission failed ❌" });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      <View style={styles.banner}>
        <MaterialIcons name="feedback" size={22} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.bannerText}>We value your feedback! Share your thoughts below.</Text>
      </View>

      <View style={styles.card}>
        {/* Shop Dropdown */}
        <Text style={styles.label}>Select Shop</Text>


        <View style={styles.inputRow}>
          <MaterialIcons name="person" size={20} color="#003366" />
          <TextInput
            style={styles.input}
            placeholder="Your Name (optional)"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputRow}>
          <MaterialIcons name="email" size={20} color="#003366" />
          <TextInput
            style={styles.input}
            placeholder="Your Email (optional)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedShop}
            onValueChange={(val) => setSelectedShop(val)}
            style={styles.picker}
          >
            <Picker.Item label="-- Select Shop --" value="" />
            {shops.map(shop => (
              <Picker.Item key={shop._id} label={shop.shopName} value={shop._id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Feedback Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={type} onValueChange={(val) => setType(val)} style={styles.picker}>
            <Picker.Item label="Suggestion" value="Suggestion" />
            <Picker.Item label="Bug Report" value="Bug" />
            <Picker.Item label="Complaint" value="Complaint" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <Text style={styles.label}>Your Feedback</Text>
        <View style={styles.inputRow}>
          <MaterialIcons name="comment" size={20} color="#003366" />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your feedback here..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <MaterialIcons name="send" size={20} color="white" />
          <Text style={styles.buttonText}>Submit Feedback</Text>
        </TouchableOpacity>

        {submitted && (
          <Text style={styles.successText}>✅ Feedback submitted successfully!</Text>
        )}

        {/* Feedback for selected shop */}
        {shopFeedback.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: "bold", color: "#003366", marginBottom: 8 }}>Feedback for this shop:</Text>
            {shopFeedback.map(fb => (
              <View key={fb._id} style={{ padding: 8, backgroundColor: "#f0f0f0", borderRadius: 8, marginBottom: 6 }}>
                <Text style={{ fontWeight: "600" }}>{fb.name || "Anonymous"} ({fb.type})</Text>
                <Text>{fb.message}</Text>
                <Text style={{ fontSize: 10, color: "#666" }}>{new Date(fb.createdAt).toLocaleString()}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emblem: { width: 40, height: 40, marginRight: 10 },
  title: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  banner: { flexDirection: "row", alignItems: "center", backgroundColor: "#003366", padding: 14, borderRadius: 10, marginBottom: 20 },
  bannerText: { color: "white", fontWeight: "600", fontSize: 15 },
  card: { backgroundColor: "#fff", padding: 18, borderRadius: 12 },
  label: { fontSize: 14, fontWeight: "bold", color: "#003366", marginTop: 14 },
  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#ccc", padding: 10, marginLeft: 8, fontSize: 14 },
  textArea: { height: 100, textAlignVertical: "top" },
  pickerWrapper: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginTop: 8, overflow: "hidden" },
  picker: { height: 48 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#003366", padding: 14, borderRadius: 8, marginTop: 24 },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  successText: { marginTop: 12, color: "#4CAF50", fontWeight: "600", textAlign: "center" },
});