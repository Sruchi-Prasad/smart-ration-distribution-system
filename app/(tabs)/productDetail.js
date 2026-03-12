import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from "react-native";

const { height, width } = Dimensions.get("window");

export default function ProductDetails() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Banner Image */}
      <Image
        source={require("../../assets/images/product.png")} // <-- add your banner image here
        style={styles.bannerImage}
        resizeMode="cover"
      />

      {/* Page Title */}
      <Text style={styles.pageTitle}>Rationed Products</Text>
      <View style={styles.titleUnderline} />

      {/* Food Grains */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="shopping-basket" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.sectionTitle}>Food Grains</Text>
        </View>
        <Text style={styles.detail}>• Wheat – staple grain, subsidized</Text>
        <Text style={styles.detail}>• Rice – staple grain, subsidized</Text>
        <Text style={styles.detail}>• Sugar – essential for nutrition</Text>
        <Text style={styles.detail}>• Pulses – lentils, chickpeas</Text>
        <Text style={styles.detail}>• Edible Oil – cooking essentials</Text>
      </View>

      <View style={{ height: 1, backgroundColor: "#ccc", marginVertical: 10 }} />

      {/* Fuel */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="local-gas-station" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.sectionTitle}>Fuel</Text>
        </View>
        <Text style={styles.detail}>• Kerosene – for cooking & lighting</Text>
        <Text style={styles.detail}>• Diesel – for transport & agriculture</Text>
        <Text style={styles.detail}>• LPG Cylinders – subsidized cooking fuel</Text>
      </View>

      <View style={{ height: 1, backgroundColor: "#ccc", marginVertical: 10 }} />


      {/* Household Essentials */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="home" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.sectionTitle}>Household Essentials</Text>
        </View>
        <Text style={styles.detail}>• Soap – hygiene necessity</Text>
        <Text style={styles.detail}>• Shampoo – personal care</Text>
        <Text style={styles.detail}>• Detergent – laundry needs</Text>
        <Text style={styles.detail}>• Salt – basic cooking ingredient</Text>
        <Text style={styles.detail}>• Sanitary Products – women’s hygiene</Text>
      </View>
      <View style={{ height: 1, backgroundColor: "#ccc", marginVertical: 10 }} />


      {/* Health & Nutrition Extras */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="health-and-safety" size={22} color="#003366" style={styles.icon} />
          <Text style={styles.sectionTitle}>Health & Nutrition</Text>
        </View>
        <Text style={styles.detail}><Text style={styles.bullet}>•</Text> Fortified Flour – enriched with vitamins</Text>
        <Text style={styles.detail}><Text style={styles.bullet}>•</Text> Milk Powder – for children & elderly</Text>
        <Text style={styles.detail}><Text style={styles.bullet}>•</Text> ORS Packets – basic medical supplies</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F7FB", paddingBottom: 40 },
  bannerImage: {
    width: width - 40,
    height: 220,
    borderRadius: 24,
    marginBottom: 32,
    alignSelf: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#003366",
    marginBottom: 8,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  titleUnderline: {
    height: 4,
    width: 60,
    backgroundColor: "#FF9933",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 32,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    borderLeftWidth: 6,
    borderLeftColor: "#FF9933",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
  },
  icon: { marginRight: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#003366",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detail: {
    fontSize: 15,
    color: "#444",
    marginTop: 8,
    fontWeight: "600",
    lineHeight: 22,
  },
  bullet: {
    color: "#FF9933",
    fontWeight: "900",
    fontSize: 18,
    marginRight: 6,
  }
});
