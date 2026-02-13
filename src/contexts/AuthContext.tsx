import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type ProfileRole = "admin" | "collaborator" | "client";

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
  professional_type?: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId);
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
          loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const fallback = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 6000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      try {
        if (session?.user) {
          setUser(session.user);
          loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error ?? null };
      if (data.session?.user) {
        setUser(data.session.user);
        loadProfile(data.session.user.id);
      }
      return { error: null };
    },
    [loadProfile]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signOut,
      isAdmin: profile?.role === "admin",
    }),
    [user, profile, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
