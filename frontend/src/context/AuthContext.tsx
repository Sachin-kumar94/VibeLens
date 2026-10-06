import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, UserProfile } from "../services/authApi";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  requestLoginOTP: (email: string) => Promise<{ message: string }>;
  verifyLoginOTP: (email: string, otp: string) => Promise<UserProfile>;
  requestRegisterOTP: (email: string, name?: string) => Promise<{ message: string }>;
  verifyRegisterOTP: (email: string, otp: string, name?: string) => Promise<UserProfile>;
  resendOTP: (email: string, purpose: "LOGIN" | "REGISTER", name?: string) => Promise<{ message: string }>;
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<UserProfile>;
  register: (data: { name: string; email: string; password: string; confirmPassword?: string }) => Promise<UserProfile>;
  registerRequestOtp: (email: string, name?: string) => Promise<{ message: string }>;
  verifyRegistrationOtp: (email: string, otp: string, name?: string) => Promise<UserProfile>;
  sendOtp: (email: string, name?: string) => Promise<{ success: boolean; message: string }>;
  loginWithOtp: (email: string, otp: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const res = await authApi.getCurrentUser();
      setUser(res.user);
      return res.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const requestLoginOTP = async (email: string) => {
    setAuthError(null);
    try {
      return await authApi.requestLoginOTP(email);
    } catch (err: any) {
      const msg = err.message || "Failed to send sign-in code.";
      setAuthError(msg);
      throw err;
    }
  };

  const verifyLoginOTP = async (email: string, otp: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await authApi.verifyLoginOTP(email, otp);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      const msg = err.message || "Invalid or expired sign-in code.";
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestRegisterOTP = async (email: string, name?: string) => {
    setAuthError(null);
    try {
      return await authApi.requestRegisterOTP(email, name);
    } catch (err: any) {
      const msg = err.message || "Failed to send verification code.";
      setAuthError(msg);
      throw err;
    }
  };

  const verifyRegisterOTP = async (email: string, otp: string, name?: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await authApi.verifyRegisterOTP(email, otp, name);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      const msg = err.message || "Invalid or expired verification code.";
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email: string, purpose: "LOGIN" | "REGISTER", name?: string) => {
    setAuthError(null);
    try {
      return await authApi.resendOTP(email, purpose, name);
    } catch (err: any) {
      const msg = err.message || "Failed to resend code.";
      setAuthError(msg);
      throw err;
    }
  };

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await authApi.login(credentials);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      const msg = err.message || "Email or password is incorrect.";
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerRequestOtp = async (email: string, name?: string) => {
    setAuthError(null);
    try {
      return await authApi.registerRequestOTP(email, name);
    } catch (err: any) {
      const msg = err.message || "Failed to send verification code.";
      setAuthError(msg);
      throw err;
    }
  };

  const verifyRegistrationOtp = async (email: string, otp: string, name?: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await authApi.verifyRegistrationOTP(email, otp, name);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      const msg = err.message || "Invalid or expired verification code.";
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email: string, name?: string) => {
    setAuthError(null);
    try {
      return await authApi.sendOtp(email, name);
    } catch (err: any) {
      const msg = err.message || "Failed to send verification code.";
      setAuthError(msg);
      throw err;
    }
  };

  const loginWithOtp = async (email: string, otp: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      const msg = err.message || "Invalid or expired verification code.";
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; confirmPassword?: string }) => {
    setAuthError(null);
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      const msg = err.message || "Registration failed. Please check your information.";
      setAuthError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Clean up locally regardless of network state
    }
    setUser(null);
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        authError,
        requestLoginOTP,
        verifyLoginOTP,
        requestRegisterOTP,
        verifyRegisterOTP,
        resendOTP,
        login,
        register,
        registerRequestOtp,
        verifyRegistrationOtp,
        sendOtp,
        loginWithOtp,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
