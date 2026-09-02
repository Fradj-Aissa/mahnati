import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { RecordModel } from "pocketbase";
import { pb } from "@/integrations/pocketbase/client";

type PocketBaseUser = RecordModel & {
  email: string;
  name?: string;
  avatar_url?: string;
  role?: "student" | "artisan" | "admin";
};

interface AuthSession {
  access_token: string;
  user: PocketBaseUser;
}

interface AuthContextValue {
  session: AuthSession | null;
  user: PocketBaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => (
    pb.authStore.isValid && pb.authStore.record
      ? { access_token: pb.authStore.token, user: pb.authStore.record as PocketBaseUser }
      : null
  ));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, record) => {
      setSession(token && record ? {
        access_token: token,
        user: record as PocketBaseUser,
      } : null);
      setLoading(false);
    });

    setLoading(false);

    return unsubscribe;
  }, []);

  const signOut = async () => pb.authStore.clear();

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
