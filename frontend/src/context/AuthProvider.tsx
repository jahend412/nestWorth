import React, { useState } from "react";
import type { User, AuthContextType, AuthResponse } from "../types/auth";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        const { token: newToken, data } = response.data;

        // Save to state
        setToken(newToken);
        setUser(data.user);

        // Save to localStorage
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Set default auth header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      } else {
        throw new Error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
