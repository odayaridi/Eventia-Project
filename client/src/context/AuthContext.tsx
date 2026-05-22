
import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthResponse } from "../api/authApi";

interface AuthContextType {
  user: AuthResponse["user"] | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user from localStorage:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("organizerId");
        localStorage.removeItem("managerId");
        localStorage.removeItem("attendeeId");
      }
    }

    setIsAuthLoading(false);
  }, []);

  const login = (data: AuthResponse) => {
    setToken(data.accessToken);
    setUser(data.user);

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.user));
     localStorage.setItem("userId", JSON.stringify(data.user));


  localStorage.setItem("userId", data.user.userId.toString());

    if (data.user.organizerId) {
        localStorage.removeItem("managerId");
        localStorage.removeItem("attendeeId");
      localStorage.setItem("organizerId", data.user.organizerId.toString());
    }

    if (data.user.managerId) {
         localStorage.removeItem("organizerId");
        localStorage.removeItem("attendeeId");
      localStorage.setItem("managerId", data.user.managerId.toString());
    }

    if (data.user.attendeeId) {
         localStorage.removeItem("organizerId");
        localStorage.removeItem("managerId");
      localStorage.setItem("attendeeId", data.user.attendeeId.toString());
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("organizerId");
    localStorage.removeItem("managerId");
    localStorage.removeItem("attendeeId");

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

