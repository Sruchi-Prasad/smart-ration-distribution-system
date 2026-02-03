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
        <Text style={styles.detail}>• Fortified Flour – enriched with vitamins</Text>
        <Text style={styles.detail}>• Milk Powder – for children & elderly</Text>
        <Text style={styles.detail}>• ORS Packets – basic medical supplies</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f5f5f5" },
  bannerImage: {
    width: width,
    height: height / 2, // half of screen height
    borderRadius: 10,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 24,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  }
  ,
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
  ,
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#e3f2fd", // light blue
    padding: 8,
    borderRadius: 6,
  }
  ,
});
