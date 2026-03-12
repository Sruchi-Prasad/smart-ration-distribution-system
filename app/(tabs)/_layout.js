import { Stack } from "expo-router";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import FooterNav from "../components/Footer";
import MyHeader from "../components/Header";

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Global Header */}
      <MyHeader />

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
        <Stack.Screen name="kycForm" />
        <Stack.Screen name="Marketplace" />
        <Stack.Screen name="marketplaceHistory" />
        <Stack.Screen name="ShopLocator" />
      </Stack>

      {/* Global Toast with high zIndex - Rendered at end to ensure it's on top */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        <Toast />
      </View>

      {/* Global Footer */}
      <FooterNav />
    </View>
  );
}
