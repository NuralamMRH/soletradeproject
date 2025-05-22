import * as SecureStore from "expo-secure-store";
import MainApi from "./MainApi";

export function isValidToken(token: string) {
  // Implement your JWT validation logic here (for now, just check existence)
  return !!token;
}

export function setSession(token: string | null) {
  if (token) {
    MainApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    SecureStore.setItemAsync("accessToken", token);
  } else {
    delete MainApi.defaults.headers.common.Authorization;
    SecureStore.deleteItemAsync("accessToken");
  }
}
