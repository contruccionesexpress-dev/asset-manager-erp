import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User, LoginRequest, login, logout, getCurrentUser } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginUser: (data: LoginRequest) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const userData = await getCurrentUser({
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid", error);
          localStorage.removeItem("auth_token");
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = async (data: LoginRequest) => {
    const res = await login(data);
    localStorage.setItem("auth_token", res.token);
    setUser(res.user);
  };

  const logoutUser = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await logout({ headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
