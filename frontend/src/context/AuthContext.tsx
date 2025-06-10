import { createContext, useContext } from "react";
import type { AuthContextType } from "../types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Add this useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
