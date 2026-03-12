import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SupportPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { q: "How do I update my KYC?", a: "Go to the KYC section in your profile and ensure all documents are up to date. If any fields are empty, follow the 'Update Info' link." },
    { q: "Where can I find my ration balance?", a: "Your monthly balance is available on the 'Balance' tab of the main navigation menu." },
    { q: "What if my ration card is lost?", a: "You can download a digital copy from the 'Ration Card' section. For a physical replacement, please contact your local district office." },
    { q: "How to report a distribution delay?", a: "Use the 'Feedback' page to submit a complaint selecting 'Complaint' as the type and choosing your local shop." },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Hero */}
        <View style={styles.hero}>
          <MaterialIcons name="support-agent" size={60} color="white" />
          <Text style={styles.heroTitle}>Help Center</Text>
          <Text style={styles.heroSubtitle}>We're here to assist you with any questions or issues regarding your ration services.</Text>
        </View>

        {/* Quick Contact Cards */}
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard}>
            <FontAwesome name="phone" size={24} color="#003366" />
            <Text style={styles.contactLabel}>Helpline</Text>
            <Text style={styles.contactValue}>1800-11-4477</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard}>
            <MaterialIcons name="email" size={24} color="#003366" />
            <Text style={styles.contactLabel}>Email Us</Text>
            <Text style={styles.contactValue}>support@smartration.gov</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqCard}
              onPress={() => setActiveFaq(activeFaq === index ? null : index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <MaterialIcons
                  name={activeFaq === index ? "expand-less" : "expand-more"}
                  size={24}
                  color="#003366"
                />
              </View>
              {activeFaq === index && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Grievance Link */}
        <View style={styles.footerAction}>
          <Text style={styles.footerText}>Didn't find what you're looking for?</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Rise a Grievance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  hero: {
    backgroundColor: "#003366",
    padding: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#003366",
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  heroSubtitle: {
    color: "#E0E0E0",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    fontSize: 14,
    fontWeight: "500",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -30,
  },
  contactCard: {
    backgroundColor: "white",
    width: "48%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderBottomWidth: 4,
    borderBottomColor: "#FF9933",
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#003366",
    marginTop: 10,
    textTransform: "uppercase",
  },
  contactValue: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    fontWeight: "700",
  },
  section: { padding: 20, marginTop: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#003366",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9933",
    paddingLeft: 12,
  },
  faqCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "800",
    color: "#003366",
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    marginTop: 12,
    color: "#555",
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "500",
    borderTopWidth: 1,
    borderTopColor: "#EEF2F6",
    paddingTop: 10,
  },
  footerAction: { padding: 40, alignItems: "center" },
  footerText: { fontSize: 14, color: "#666", marginBottom: 16, fontWeight: "600" },
  button: {
    backgroundColor: "#FF9933",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
  },
  buttonText: { color: "white", fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
});
