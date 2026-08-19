import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import axios from "axios";

export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const api = import.meta.env.VITE_PUBLIC_BACKEND;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(
    async (): Promise<void> => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          `${api}/api/v1/users/me`,
          {
            withCredentials: true,
          }
        );

        setUser(response.data.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(
    async (): Promise<void> => {
      try {
        setIsLoading(true);

        await axios.post(
          `${api}/api/v1/users/logout`,
          {},
          {
            withCredentials: true,
          }
        );

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    refreshUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
};