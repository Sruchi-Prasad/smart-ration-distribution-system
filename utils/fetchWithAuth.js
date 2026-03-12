import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser } from "./logout";

import { API_BASE } from "./config";

export async function fetchWithAuth(url, options = {}) {
  let token = await AsyncStorage.getItem("accessToken");

  // 🚨 If no token → stop request immediately
  if (!token) {
    console.log("❌ No access token found");
    throw new Error("User not logged in");
  }

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // ===============================
  // 🔴 TOKEN EXPIRED → REFRESH FLOW
  // ===============================
  if (res.status === 401 || res.status === 403) {
    console.log("🔄 Token expired → refreshing...");

    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      await logoutUser(options.router || {});
      throw new Error("Session expired. Please login again.");
    }

    try {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        throw new Error("Refresh token invalid");
      }

      const data = await refreshRes.json();

      // ✅ Save new tokens
      await AsyncStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
      }

      console.log("✅ Token refreshed");

      // 🔁 Retry original request with new token
      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${data.accessToken}`,
          "Content-Type": "application/json",
        },
      });

    } catch (err) {
      console.log("❌ Refresh failed → logout");
      await logoutUser(options.router || {}); // Expecting router to be passed in options if needed
      throw new Error("Session expired. Please login again.");
    }
  }

  return res;
}
