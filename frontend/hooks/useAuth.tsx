import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { isValidToken, setSession } from "../api/auth";
import MainApi from "@/api/MainApi";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  callingCode?: string;
  sneaker_size?: string;
  avatar?: string;
  role?: string;
  ref_code?: string;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
  image_full_url?: string;
  // Add more fields as needed
}

interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<any>;
  register: (formData: any) => Promise<any>;
  logout: () => Promise<void>;
  registerWithOtp: (formData: any) => Promise<any>;
  otpVerification: (params: {
    userId: string;
    otp: string;
    phone?: string;
    email?: string;
  }) => Promise<any>;
}

const initialState: AuthState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

type Action =
  | {
      type: "INITIAL";
      payload: { isAuthenticated: boolean; user: User | null };
    }
  | { type: "LOGIN"; payload: { user: User } }
  | { type: "REGISTER"; payload: { user: User } }
  | { type: "LOGOUT" };

const reducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case "INITIAL":
      return {
        isInitialized: true,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
      };
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case "REGISTER":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("accessToken");
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        const response = await MainApi.get("/api/v1/users/my-account");
        const user = response.data;
        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: true,
            user,
          },
        });
      } else {
        dispatch({
          type: "INITIAL",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } catch (error: any) {
      dispatch({
        type: "INITIAL",
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    try {
      const expoPushToken = await SecureStore.getItemAsync("expoPushToken");

      const response = await MainApi.post("/api/v1/users/login", {
        email,
        password,
        expoPushToken,
      });
      if (response.status === 200) {
        const { token, user } = response.data;
        setSession(token);
        dispatch({
          type: "LOGIN",
          payload: { user },
        });
        return { user, token };
      }
    } catch (error: any) {
      return error.response?.data || "Login failed.";
    }
  }, []);

  // REGISTER
  const register = useCallback(async (formData: any) => {
    try {
      const expoPushToken = await SecureStore.getItemAsync("expoPushToken");
      if (expoPushToken) {
        formData.expoPushToken = expoPushToken;
      }
      const response = await MainApi.post("/api/v1/users/register", formData);
      if (response.status === 200) {
        const { user, token } = response.data;
        setSession(token);
        dispatch({
          type: "REGISTER",
          payload: { user },
        });
        return { user, token };
      }
    } catch (error: any) {
      return error.response?.data || "Registration failed.";
    }
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    try {
      await MainApi.post("/api/v1/users/logout");
      setSession(null);
      dispatch({ type: "LOGOUT" });
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  }, []);

  const registerWithOtp = useCallback(async (formData: any) => {
    try {
      // 1. Fetch AppContent to check OTP requirement
      const appContentRes = await MainApi.get("/api/v1/app-content");
      const appContent = appContentRes.data?.data;
      const otpRequired = appContent?.otp_verification_is_active;

      // 2. Register user
      const response = await MainApi.post("/api/v1/users/register", formData);

      if (response.status === 201 && response.data.success) {
        // If OTP required, return userId for OTP screen
        if (otpRequired) {
          return {
            otpRequired: true,
            userId: response.data.userId,
            phone: formData.phone,
            email: formData.email,
          };
        } else {
          // If not, log in user directly (if backend returns token)
          // Optionally: setSession(response.data.token);
          // dispatch({ type: "REGISTER", payload: { user: response.data.user } });
          return { otpRequired: false };
        }
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error.message || "Registration failed"
      );
    }
  }, []);

  const otpVerification = useCallback(
    async ({
      userId,
      otp,
      phone,
      email,
    }: {
      userId: string;
      otp: string;
      phone?: string;
      email?: string;
    }) => {
      try {
        const response = await MainApi.post(
          "/api/v1/users/registration-verification",
          {
            userId,
            otp,
            phone,
            email,
          }
        );
        if (response.status === 200 && response.data.success) {
          // Optionally: log in user here if backend returns token
          return { success: true };
        } else {
          throw new Error(response.data.message || "OTP verification failed");
        }
      } catch (error: any) {
        throw new Error(
          error?.response?.data?.message ||
            error.message ||
            "OTP verification failed"
        );
      }
    },
    []
  );

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      login,
      register,
      logout,
      registerWithOtp,
      otpVerification,
    }),
    [
      state.isInitialized,
      state.isAuthenticated,
      state.user,
      login,
      register,
      logout,
      registerWithOtp,
      otpVerification,
    ]
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
