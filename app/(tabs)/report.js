import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
export default function ReportIssuePage() {
    const [issueType, setIssueType] = React.useState("Card Problem");
    const [subject, setSubject] = React.useState("");
    const [description, setDescription] = React.useState("");

    const handleSubmit = () => {
        if (!subject.trim() || !description.trim()) {
            Toast.show({ type: "error", text1: "Missing Fields ❌", text2: "Please fill subject and description" });
            return;
        }
        // Replace with backend API call
        Toast.show({ type: "success", text1: "Issue Reported ✅", text2: "We will look into it shortly" });
        setSubject(""); setDescription(""); setIssueType("Card Problem");
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
                <MaterialIcons name="report-problem" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.bannerText}>Facing a problem? Report it below.</Text>
            </View>

            {/* Form */}
            <View style={styles.section}>
                <Text style={styles.label}>Issue Type</Text>
                <Picker selectedValue={issueType} onValueChange={(val) => setIssueType(val)} style={styles.input}>
                    <Picker.Item label="Card Problem" value="Card Problem" />
                    <Picker.Item label="Distribution Delay" value="Distribution Delay" />
                    <Picker.Item label="Wrong Quantity" value="Wrong Quantity" />
                    <Picker.Item label="Other" value="Other" />
                </Picker>

                <Text style={styles.label}>Subject</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter issue subject"
                    value={subject}
                    onChangeText={setSubject}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, { height: 100 }]}
                    placeholder="Describe your issue in detail"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit Report</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    emblem: { width: 40, height: 40, marginRight: 10 },
    title: { fontSize: 18, fontWeight: "bold", color: "#003366" },
    banner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F44336",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    bannerText: { color: "white", fontWeight: "600" },
    section: { backgroundColor: "#fff", padding: 16, borderRadius: 8, elevation: 2 },
    label: { fontSize: 14, fontWeight: "bold", color: "#003366", marginTop: 12 },
    input: {
        backgroundColor: "#fff",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginTop: 8,
    },
    button: {
        backgroundColor: "#003366",
        padding: 14,
        borderRadius: 6,
        marginTop: 20,
        alignItems: "center",
    },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
