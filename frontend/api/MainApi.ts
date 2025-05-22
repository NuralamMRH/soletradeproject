import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const baseUrl = "http://localhost:8000";

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
