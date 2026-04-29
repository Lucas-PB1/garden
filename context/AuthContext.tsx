"use client";

import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Interface for the global authentication state.
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

/**
 * Hook to access the current authentication context.
 * @returns AuthContextType with user data and logout function.
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Provider component that manages the Firebase authentication state lifecycle.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Logs out the current user and redirects to the login page.
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }, [router]);

  const value = useMemo(() => ({ user, loading, logout }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
