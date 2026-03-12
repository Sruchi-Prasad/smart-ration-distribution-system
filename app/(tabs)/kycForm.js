import { Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { API_BASE } from "../../utils/config";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

export default function KYCForm() {
    const { memberId, memberName, memberAge, memberAadhaar } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        city: "",
        country: "",
        aadhaarNumber: "",
        rationCard: "",
        age: ""
    });

    useEffect(() => {
        const loadUserData = async () => {
            if (memberId) {
                // Pre-fill for family member
                setFormData(prev => ({
                    ...prev,
                    fullName: memberName || "",
                    aadhaarNumber: memberAadhaar || "",
                    age: memberAge ? String(memberAge) : ""
                }));
            } else {
                // Pre-fill for head of household
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setFormData({
                        fullName: user.fullName || "",
                        phone: user.phone || "",
                        email: user.email || "",
                        city: user.city || "",
                        country: user.country || "",
                        aadhaarNumber: user.aadhaarNumber || "",
                        rationCard: user.rationCard || "",
                        age: ""
                    });
                }
            }
        };
        loadUserData();
    }, [memberId]);

    const handleSubmit = async () => {
        console.log("🚀 Starting KYC Submission...");
        if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
            console.log("❌ Validation failed: Invalid Aadhaar length");
            Alert.alert("Invalid Input", "Aadhaar number must be 12 digits.");
            return;
        }

        setLoading(true);
        try {
            const endpoint = memberId ? `${API_BASE}/api/auth/member-kyc-submit` : `${API_BASE}/api/auth/kyc-submit`;
            console.log("📡 Target Endpoint:", endpoint);

            const payload = memberId ? {
                memberId,
                name: formData.fullName,
                age: parseInt(formData.age),
                aadhaarNumber: formData.aadhaarNumber
            } : formData;

            console.log("📦 Payload:", JSON.stringify(payload, null, 2));

            const res = await fetchWithAuth(endpoint, {
                method: "POST",
                body: JSON.stringify(payload),
                router,
            });

            console.log("📡 Response Status:", res.status);

            if (res.ok) {
                const data = await res.json();
                console.log("✅ Success Response:", data);
                if (!memberId) {
                    await AsyncStorage.setItem("user", JSON.stringify(data.user));
                }

                // Fallback for web where Alert.alert might be silent
                if (Platform.OS === 'web') {
                    window.alert("Success: KYC submitted successfully and is under review.");
                    router.replace(memberId ? "/(tabs)/members" : "/(tabs)/kyc");
                } else {
                    Alert.alert("Success", "KYC submitted successfully and is under review.", [
                        { text: "OK", onPress: () => router.replace(memberId ? "/(tabs)/members" : "/(tabs)/kyc") },
                    ]);
                }
            } else {
                const err = await res.json();
                console.log("❌ Error Response:", err);
                if (Platform.OS === 'web') window.alert("Error: " + (err.message || "Submission failed."));
                else Alert.alert("Error", err.message || "Submission failed.");
            }
        } catch (error) {
            console.error("❌ Submission Catch Error:", error);
            Alert.alert("Error", "Network error or logic failure. Check console.");
        } finally {
            setLoading(false);
            console.log("🏁 Submission process finished.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <MaterialIcons name="close" size={24} color="#003366" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>KYC Submission</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    {/* Intro */}
                    <View style={styles.introSection}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="security" size={40} color="#FF9933" />
                        </View>
                        <Text style={styles.title}>{memberId ? `Verify ${memberName}` : "Verify Your Identity"}</Text>
                        <Text style={styles.subtitle}>
                            Securely update your digital dossier for seamless ration distribution.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formCard}>
                        <InputField
                            label="Full Name (as per Aadhaar)"
                            icon="user"
                            value={formData.fullName}
                            onChangeText={(t) => setFormData({ ...formData, fullName: t })}
                        />
                        <InputField
                            label="Aadhaar Number"
                            icon="hash"
                            keyboardType="numeric"
                            maxLength={12}
                            value={formData.aadhaarNumber}
                            onChangeText={(t) => setFormData({ ...formData, aadhaarNumber: t })}
                        />
                        {memberId && (
                            <InputField
                                label="Age"
                                icon="calendar"
                                keyboardType="numeric"
                                value={formData.age}
                                onChangeText={(t) => setFormData({ ...formData, age: t })}
                            />
                        )}
                        {!memberId && (
                            <>
                                <InputField
                                    label="Ration Card ID"
                                    icon="credit-card"
                                    value={formData.rationCard}
                                    onChangeText={(t) => setFormData({ ...formData, rationCard: t })}
                                />
                                <InputField
                                    label="Phone Number"
                                    icon="phone"
                                    keyboardType="phone-pad"
                                    value={formData.phone}
                                    onChangeText={(t) => setFormData({ ...formData, phone: t })}
                                />
                                <InputField
                                    label="City/Town"
                                    icon="map-pin"
                                    value={formData.city}
                                    onChangeText={(t) => setFormData({ ...formData, city: t })}
                                />
                            </>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.disabledBtn]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text style={styles.submitText}>SUBMIT FOR REVIEW</Text>
                                <Feather name="shield" size={18} color="white" style={{ marginLeft: 10 }} />
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.securityNote}>
                        Your data is encrypted and handled according to government security protocols.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const InputField = ({ label, icon, value, onChangeText, ...props }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrapper}>
            <Feather name={icon} size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#94A3B8"
                {...props}
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F7FB" },
    scrollContent: { padding: 24, paddingBottom: 60 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "900",
        color: "#003366",
        textTransform: "uppercase",
    },
    introSection: { alignItems: "center", marginBottom: 32 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#F0F4F8",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    title: { fontSize: 24, fontWeight: "900", color: "#003366", marginBottom: 8 },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
        fontWeight: "600",
    },
    formCard: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: 24,
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: "#EEF2F6",
        marginBottom: 24,
    },
    inputContainer: { marginBottom: 20 },
    label: {
        fontSize: 12,
        fontWeight: "800",
        color: "#003366",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: { marginRight: 12 },
    input: {
        flex: 1,
        height: 50,
        color: "#1E293B",
        fontSize: 15,
        fontWeight: "700",
    },
    submitBtn: {
        backgroundColor: "#003366",
        height: 60,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#003366",
        shadowOpacity: 0.25,
        shadowRadius: 15,
    },
    disabledBtn: { opacity: 0.7 },
    submitText: {
        color: "white",
        fontSize: 15,
        fontWeight: "900",
        letterSpacing: 1,
    },
    securityNote: {
        marginTop: 24,
        textAlign: "center",
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "700",
        lineHeight: 16,
    },
});
