import { Stack } from "expo-router";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import FooterNav from "./myFooter"; // adjust path if needed

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Navigation stack */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="Registration" />
        <Stack.Screen name="myRationBalance" />
        <Stack.Screen name="distributionSystem" />
        <Stack.Screen name="kyc" />
        <Stack.Screen name="productDetail" />   {/* ✅ only once */}
        <Stack.Screen name="auth" />
        <Stack.Screen name="AuthUser" />
        <Stack.Screen name="feedback" />
        <Stack.Screen name="history" />
        <Stack.Screen name="members" />
        <Stack.Screen name="support" />
        <Stack.Screen name="setting" />
        <Stack.Screen name="report" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="distribution" />
        <Stack.Screen name="balance" />
      </Stack>

      {/* Global Toast */}
      <Toast />

      {/* Global Footer */}
      <FooterNav />
    </View>
  );
}
