import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "./config";

/**
 * Professional Reusable Logout Handler
 * Clears all auth-related data from storage and redirects to login
 * @param {object} router - Expo Router instance
 */
export const logoutUser = async (router) => {
    try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        // Notify backend to revoke refresh token (non-blocking)
        if (refreshToken) {
            fetch(`${API_BASE}/api/auth/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            }).catch(err => console.log("Backend logout notify failed (safe to ignore):", err));
        }

        // Faster storage clearing using Promise.all
        await Promise.all([
            AsyncStorage.removeItem("accessToken"),
            AsyncStorage.removeItem("refreshToken"),
            AsyncStorage.removeItem("user"),
            AsyncStorage.removeItem("userId"),
        ]);

        console.log("✅ User logged out successfully");

        // Redirect to login (assuming (tabs)/login is the standard route)
        router.replace("/(tabs)/login");

    } catch (error) {
        console.error("❌ Logout error:", error);
    } finally {
        console.log("🚪 logoutUser finished");
    }
};
