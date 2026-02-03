import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="Registration" />
        <Stack.Screen name="myRationBalance" />
        <Stack.Screen name="distributionSystem" />
        <Stack.Screen name="kyc" />
        <Stack.Screen name="productDetail" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="AuthUser" />
      </Stack>

      <Toast /> {/* ✅ This makes toast visible across all screens */}
    </>
  );
}
