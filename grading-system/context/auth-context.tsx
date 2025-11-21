"use client";

import http from "@/axios/http";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type UserTokenData = {
  sub: string;
  email: string;
  name: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
  role: string;
};

type UserGETData = {
  sub: string;
  email: string;
  name: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
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
    console.log("Redirecting based on role:", role);
    switch (role) {
      case "admin":
        router.push("/admin");
        break;
      case "examiner":
        router.push("/examiner/tasks");
        break;
      case "manager":
        router.push("/manager/dashboard");
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
      const decoded : UserGETData = jwtDecode(response.data.accessToken);
      const user: UserTokenData = {
        ...decoded,
        role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      }
      setUserTokenData(user);
      handleRedirect(user.role.toLowerCase());
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setCurrentAccessToken(token);
  
      try {
        const decoded: UserGETData = jwtDecode(token);
        const user: UserTokenData = {
          ...decoded,
          role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        };
        setUserTokenData(user);
      } catch {
        console.error("Invalid token in localStorage");
        localStorage.removeItem("accessToken");
      }
    }
  }, []);
  

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
      const decoded : UserGETData = jwtDecode(response.data.accessToken);
      const user: UserTokenData = {
        ...decoded,
        role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      }
      setUserTokenData(user);
      handleRedirect(user.role.toLowerCase());
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentAccessToken(null);
    setUserTokenData(null);
    localStorage.removeItem("accessToken");
    
    // Use setTimeout to defer navigation until after state updates complete
    setTimeout(() => {
      router.push("/");
    }, 0);
  };

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