"use client";

import http from "@/axios/http";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, ReactNode } from "react";

type UserTokenData = {
  sub: string;
  email: string;
  name: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
};

interface AuthContextType {
  accessToken: string | null;
  userTokenData: UserTokenData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [userTokenData, setUserTokenData] = useState<UserTokenData | null>(
    null
  );
  const router = useRouter();

  const handleRedirect = (role: string) => {
    switch (role) {
      case "admin":
        router.push("/admin");
        break;
      case "examiner":
        router.push("/examiner/tasks");
        break;
      case "manager":
        router.push("/manager");
        break;
      case "moderator":
        router.push("/moderator/queue");
        break;
      default:
        router.push("/");
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await http.post("/auth/login", { email, password });
      setCurrentAccessToken(response.data.accessToken);
      localStorage.setItem("accessToken", response.data.accessToken);
      const decoded: UserTokenData = jwtDecode(response.data.accessToken);
      setUserTokenData(decoded);
      handleRedirect(decoded.name.toLowerCase());
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const response = await http.post("/auth/register", {
        username,
        email,
        password,
      });
      setCurrentAccessToken(response.data.accessToken);
      localStorage.setItem("accessToken", response.data.accessToken);
      const decoded: UserTokenData = jwtDecode(response.data.accessToken);
      setUserTokenData(decoded);
      handleRedirect(decoded.name.toLowerCase());
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setCurrentAccessToken(null);

  return (
    <AuthContext.Provider
      value={{
        userTokenData,
        accessToken: currentAccessToken,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
