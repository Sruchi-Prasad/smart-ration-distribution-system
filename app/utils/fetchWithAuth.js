// app/utils/fetchWithAuth.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://192.168.1.5:8000"; // 👈 replace with your LAN IP

export async function fetchWithAuth(url, options = {}) {
  let token = await AsyncStorage.getItem("accessToken");

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    // Try refresh
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      await AsyncStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
      }

      // Retry original request with new token
      token = data.accessToken;
      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      throw new Error("Session expired, please log in again");
    }
  }

  return res;
}
