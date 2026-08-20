import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuth, getIdTokenResult, onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { requireFirebaseApp } from "@/integrations/firebase/client";
import { documentRef, getDoc, saveUserProfile, type FirestoreUserProfile } from "@/integrations/firebase/firestore";
import { firebaseSignOut } from "@/integrations/firebase/auth";
import type { AppRole, ProfileRow } from "@/lib/copex";

type AuthContextValue = { user: User | null; loading: boolean };
const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(requireFirebaseApp()), (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (nextUser) queryClient.invalidateQueries();
      else queryClient.clear();
    });
    return unsubscribe;
  }, [queryClient]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }

export function useRoles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["roles", user?.uid],
    enabled: !!user,
    queryFn: async (): Promise<AppRole[]> => {
      const [snapshot, tokenResult] = await Promise.all([
        getDoc(documentRef(`users/${user!.uid}`)),
        getIdTokenResult(user!),
      ]);
      const profile = snapshot.data() as FirestoreUserProfile | undefined;
      const roles = profile?.roles ?? (profile?.role ? [profile.role] : []);
      const validRoles = roles.filter((role): role is AppRole => role === "admin" || role === "organizer");
      return tokenResult.claims.admin === true && !validRoles.includes("admin")
        ? [...validRoles, "admin"]
        : validRoles;
    },
  });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.uid],
    enabled: !!user,
    queryFn: async (): Promise<ProfileRow | null> => {
      const snapshot = await getDoc(documentRef(`users/${user!.uid}`));
      if (!snapshot.exists()) return null;
      const profile = snapshot.data() as FirestoreUserProfile;
      return { ...profile, id: user!.uid, email: profile.email ?? user!.email, created_at: profile.created_at ?? new Date().toISOString(), updated_at: profile.updated_at ?? new Date().toISOString() } as ProfileRow;
    },
  });
}

export function usePermissions() {
  const { data: roles = [], isLoading } = useRoles();
  return { roles, isLoading, isAdmin: roles.includes("admin"), isOrganizer: roles.includes("organizer"), isStaff: roles.includes("admin") || roles.includes("organizer") };
}

export async function saveProfile(userId: string, profile: FirestoreUserProfile) { return saveUserProfile(userId, profile); }
export async function signOut() { await firebaseSignOut(); }
