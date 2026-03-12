import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { API_BASE } from "../../utils/config";

export default function FeedbackPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Suggestion");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [shopFeedback, setShopFeedback] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/shops`)
      .then(res => res.json())
      .then(data => setShops(data))
      .catch(err => console.log("Error fetching shops", err));
  }, []);

  useEffect(() => {
    if (!selectedShop) return;
    fetch(`${API_BASE}/api/feedback/shop/${selectedShop}`)
      .then(res => res.json())
      .then(data => setShopFeedback(data))
      .catch(err => console.log("Error fetching feedback", err));
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
      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId: selectedShop, name, email, type, message })
      });

      if (res.ok) {
        Toast.show({ type: "success", text1: "Thank you!", text2: "Feedback submitted successfully ✅" });
        setSubmitted(true);
        setName(""); setEmail(""); setMessage(""); setType("Suggestion");
        fetch(`${API_BASE}/api/feedback/shop/${selectedShop}`)
          .then(res => res.json())
          .then(data => setShopFeedback(data));
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Submission failed ❌" });
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

        {/* HERO BANNER */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <MaterialIcons name="thumbs-up-down" size={32} color="white" />
          </View>
          <View style={styles.heroTextContent}>
            <Text style={styles.heroTitle}>Citizen Feedback</Text>
            <Text style={styles.heroSub}>Help us improve the Smart Ration distribution system.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Submission Form</Text>

          <Text style={styles.label}>Identity Details</Text>
          <InputField icon="user" placeholder="Your Name (Optional)" value={name} onChange={setName} />
          <InputField icon="mail" placeholder="Your Email (Optional)" value={email} onChange={setEmail} keyboard="email-address" />

          <Text style={styles.label}>PDS Establishment</Text>
          <View style={styles.pickerBox}>
            <MaterialIcons name="store" size={20} color="#003366" />
            <Picker selectedValue={selectedShop} onValueChange={(val) => setSelectedShop(val)} style={styles.picker}>
              <Picker.Item label="-- Select Official Shop --" value="" />
              {shops.map(shop => <Picker.Item key={shop._id} label={shop.shopName} value={shop._id} />)}
            </Picker>
          </View>

          <Text style={styles.label}>Nature of Feedback</Text>
          <View style={styles.pickerBox}>
            <MaterialIcons name="list" size={20} color="#003366" />
            <Picker selectedValue={type} onValueChange={(val) => setType(val)} style={styles.picker}>
              <Picker.Item label="Suggestion" value="Suggestion" />
              <Picker.Item label="Bug Report" value="Bug" />
              <Picker.Item label="Formal Complaint" value="Complaint" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          <Text style={styles.label}>Detailed Comments</Text>
          <View style={styles.textAreaBox}>
            <MaterialIcons name="comment" size={20} color="#003366" style={{ marginTop: 12 }} />
            <TextInput
              style={styles.textArea}
              placeholder="Provide specific details here..."
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
            <Text style={styles.btnText}>SUBMIT TO OFFICIALS</Text>
            <MaterialIcons name="send" size={20} color="white" style={{ marginLeft: 12 }} />
          </TouchableOpacity>
        </View>

        {/* HISTORY LIST */}
        {shopFeedback.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>RECENT FEEDBACK FOR THIS SHOP</Text>
              <View style={styles.countBadge}><Text style={styles.countText}>{shopFeedback.length}</Text></View>
            </View>
            {shopFeedback.map((fb, idx) => (
              <View key={fb._id} style={styles.historyCard}>
                <View style={styles.cardTop}>
                  <View style={styles.userIcon}><Text style={styles.userInitial}>{(fb.name || "A")[0]}</Text></View>
                  <View style={styles.cardHeaderInfo}>
                    <Text style={styles.cardName}>{fb.name || "Anonymous User"}</Text>
                    <Text style={styles.cardDate}>{new Date(fb.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: fb.type === 'Complaint' ? '#FEE2E2' : '#E0F2FE' }]}>
                    <Text style={[styles.typeText, { color: fb.type === 'Complaint' ? '#991B1B' : '#075985' }]}>{fb.type.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.cardMessage}>{fb.message}</Text>
                <View style={styles.receiptEdge} />
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const InputField = ({ icon, placeholder, value, onChange, keyboard = "default" }) => (
  <View style={styles.inputBox}>
    <Feather name={icon} size={18} color="#003366" />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard}
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, marginTop: 10 },
  backBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  backText: { marginLeft: 4, fontWeight: "800", color: "#003366", fontSize: 13 },

  heroCard: {
    backgroundColor: "#003366",
    borderRadius: 28,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    elevation: 8,
    borderBottomWidth: 4,
    borderBottomColor: "#FF9933",
  },
  heroIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  heroTextContent: { flex: 1, marginLeft: 20 },
  heroTitle: { color: "white", fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600", marginTop: 4, lineHeight: 18 },

  card: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: "#003366", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  label: { fontSize: 10, fontWeight: "900", color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 24 },

  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 16, marginBottom: 12 },
  input: { flex: 1, height: 50, marginLeft: 12, fontSize: 14, color: "#003366", fontWeight: "700" },

  pickerBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 16, height: 52, marginBottom: 12, overflow: "hidden" },
  picker: { flex: 1, color: "#003366", marginLeft: 8 },

  textAreaBox: { flexDirection: "row", backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 16, minHeight: 120 },
  textArea: { flex: 1, paddingVertical: 14, marginLeft: 12, fontSize: 14, color: "#003366", fontWeight: "700", textAlignVertical: "top" },

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
  btnText: { color: "white", fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },

  historySection: { marginTop: 40 },
  historyHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  historyTitle: { fontSize: 11, fontWeight: "900", color: "#64748B", letterSpacing: 1.5 },
  countBadge: { marginLeft: 10, backgroundColor: "#E2E8F0", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 10, fontWeight: "900", color: "#003366" },

  historyCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  userIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  userInitial: { fontSize: 16, fontWeight: "900", color: "#003366" },
  cardHeaderInfo: { flex: 1, marginLeft: 12 },
  cardName: { fontSize: 14, fontWeight: "900", color: "#003366" },
  cardDate: { fontSize: 10, color: "#94A3B8", fontWeight: "700", marginTop: 2 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 9, fontWeight: "900" },
  cardMessage: { fontSize: 13, color: "#475569", lineHeight: 20, fontWeight: "600" },
  receiptEdge: { height: 2, borderBottomWidth: 1, borderBottomColor: "#E2E8F0", borderStyle: "dashed", marginTop: 16, width: "100%" },
});
