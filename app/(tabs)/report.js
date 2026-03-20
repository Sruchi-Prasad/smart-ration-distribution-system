import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function ReportIssuePage() {
  const { user } = useAuth();
  const [issueType, setIssueType] = React.useState("Card Problem");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields ❌",
        text2: "Please fill subject and description",
      });
      return;
    }

    if (!user) {
      Toast.show({
        type: "error",
        text1: "Auth Error ❌",
        text2: "Please log in again",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userId: user._id,
        name: user.fullName,
        email: user.email,
        shopId: user.assignedShop, // Crucial for routing to correct shopkeeper context if needed
        type: issueType,
        message: `Subject: ${subject}\n\nDescription: ${description}`
      };

      console.log("🚀 Submitting report:", payload);

      const res = await fetchWithAuth(`${API_BASE}/api/feedback`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Toast.show({
          type: "success",
          text1: "Issue Reported ✅",
          text2: "We will look into it shortly",
        });
        setSubject("");
        setDescription("");
        setIssueType("Card Problem");
      } else {
        const err = await res.json();
        Toast.show({
          type: "error",
          text1: "Submission Failed ❌",
          text2: err.error || "Please try again later",
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Server Error ❌",
        text2: "Backend not reachable",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/emblem.png")} style={styles.emblem} />
        <Text style={styles.title}>SMART RATION DISTRIBUTION SYSTEM</Text>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <MaterialIcons name="report-problem" size={22} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.bannerText}>Facing a problem? Report it below.</Text>
      </View>

      {/* Form */}
      <View style={styles.section}>
        <Text style={styles.label}>Issue Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={issueType}
            onValueChange={(val) => setIssueType(val)}
            style={styles.picker}
          >
            <Picker.Item label="Card Problem" value="Card Problem" />
            <Picker.Item label="Distribution Delay" value="Distribution Delay" />
            <Picker.Item label="Wrong Quantity" value="Wrong Quantity" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter issue subject"
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your issue in detail"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="send" size={20} color="white" />
              <Text style={styles.buttonText}>Submit Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#F4F7FB" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  emblem: { width: 50, height: 50, marginRight: 12 },
  title: { fontSize: 18, fontWeight: "900", color: "#003366", flex: 1, textTransform: "uppercase", letterSpacing: 0.5 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D32F2F", // Serious red for reports
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#D32F2F",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderBottomWidth: 4,
    borderBottomColor: "#FF9933",
  },
  bannerText: { color: "white", fontWeight: "800", fontSize: 15, flex: 1 },
  section: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
    color: "#003366",
    marginTop: 18,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: "#EEF2F6",
    borderRadius: 12,
    marginTop: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: { height: 50, color: "#003366" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#EEF2F6",
    padding: 16,
    marginTop: 10,
    fontSize: 15,
    color: "#003366",
    fontWeight: "600",
  },
  textArea: { height: 120, textAlignVertical: "top" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003366",
    padding: 18,
    borderRadius: 16,
    marginTop: 32,
    elevation: 4,
    shadowColor: "#003366",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
    marginLeft: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
