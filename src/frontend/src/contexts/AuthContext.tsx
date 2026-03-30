import { type ReactNode, createContext, useContext, useState } from "react";

export type UserType = "admin" | "personnel";

export interface AuthSession {
  userCode: string;
  userType: UserType;
  companyName: string;
  companyMode: string;
  userName?: string;
  allowedModules: string[] | null; // null = unrestricted (admin or no restriction set)
}

interface AuthContextValue {
  session: AuthSession | null;
  login: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  userCode: "factoryverse_userCode",
  userType: "factoryverse_userType",
  companyName: "factoryverse_companyName",
  companyMode: "factoryverse_companyMode",
  userName: "factoryverse_userName",
  allowedModules: "factoryverse_allowedModules",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const userCode = localStorage.getItem(STORAGE_KEYS.userCode);
    const userType = localStorage.getItem(
      STORAGE_KEYS.userType,
    ) as UserType | null;
    const companyName = localStorage.getItem(STORAGE_KEYS.companyName);
    const companyMode = localStorage.getItem(STORAGE_KEYS.companyMode);
    if (userCode && userType && companyName && companyMode) {
      let allowedModules: string[] | null = null;
      const stored = localStorage.getItem(STORAGE_KEYS.allowedModules);
      if (stored) {
        try {
          allowedModules = JSON.parse(stored);
        } catch {
          allowedModules = null;
        }
      }
      return {
        userCode,
        userType,
        companyName,
        companyMode,
        userName: localStorage.getItem(STORAGE_KEYS.userName) || undefined,
        allowedModules,
      };
    }
    return null;
  });

  const login = (s: AuthSession) => {
    localStorage.setItem(STORAGE_KEYS.userCode, s.userCode);
    localStorage.setItem(STORAGE_KEYS.userType, s.userType);
    localStorage.setItem(STORAGE_KEYS.companyName, s.companyName);
    localStorage.setItem(STORAGE_KEYS.companyMode, s.companyMode);
    if (s.userName) localStorage.setItem(STORAGE_KEYS.userName, s.userName);
    if (s.allowedModules !== null && s.allowedModules !== undefined) {
      localStorage.setItem(
        STORAGE_KEYS.allowedModules,
        JSON.stringify(s.allowedModules),
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.allowedModules);
    }
    setSession(s);
  };

  const logout = () => {
    for (const k of Object.values(STORAGE_KEYS)) {
      localStorage.removeItem(k);
    }
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
