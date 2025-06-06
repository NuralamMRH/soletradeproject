import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";
const localIP =
  Constants.manifest?.debuggerHost?.split(":")[0] ||
  Constants.expoConfig?.hostUri?.split(":")[0] ||
  "localhost"; // fallback

export const baseUrl =
  process.env.NODE_ENV !== "development"
    ? process.env.EXPO_PUBLIC_API_URL
    : Platform.OS === "web" || Platform.OS === "ios"
    ? "http://localhost:8000"
    : `http://${localIP}:8000`;

const MainApi = axios.create({
  baseURL: baseUrl,
  timeout: 10000, // 10 seconds
});

MainApi.interceptors.request.use(async function (config) {
  let token: string | null = null;
  let software_id = 33571750;

  token = await SecureStore.getItemAsync("accessToken");
  if (token) config.headers.authorization = `Bearer ${token}`;
  config.headers["X-software-id"] = software_id;

  return config;
});

export default MainApi;
