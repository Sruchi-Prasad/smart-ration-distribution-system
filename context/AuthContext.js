import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { logoutUser } from "../utils/logout";

const AuthContext = createContext({
    user: null,
    login: () => { },
    logout: () => { },
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load user", e);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // Protected Routes Logic
    useEffect(() => {
        if (loading || !navigationState?.key) return;

        const path = segments.join("/");
        const rootSegment = segments[0];
        const inAuthGroup = rootSegment === "(tabs)" && (segments[1] === "login" || segments[1] === "Registration");

        console.log("Segment path:", path, "Role:", user?.role);

        if (!user) {
            // Not logged in -> must be in auth group or redirected
            if (!inAuthGroup) {
                router.replace("/(tabs)/login");
            }
        } else {
            // Logged in
            if (inAuthGroup) {
                // Redirect away from login if already logged in
                if (user.role === "admin") router.replace("/admin/AdminPanel");
                else if (user.role === "shopkeeper") router.replace("/shopkeeper/ShopPanel");
                else router.replace("/(tabs)/profile");
            } else if (rootSegment === "admin" && user.role !== "admin") {
                // Unauthorized access to admin
                router.replace("/(tabs)/profile");
            } else if (rootSegment === "shopkeeper" && user.role !== "shopkeeper") {
                // Unauthorized access to shopkeeper
                router.replace("/(tabs)/profile");
            }
        }
    }, [user, segments, loading, navigationState?.key]);

    const login = async (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        console.log("🏃 Starting logout process...");
        setUser(null); // Clear state first to trigger UI update
        await logoutUser(router);
        console.log("✅ Logout process complete");
    };

    // ⚠️ Prevent screen flash by not rendering children until auth is loaded
    if (loading) {
        return null; // Or a <LoadingScreen /> component
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
