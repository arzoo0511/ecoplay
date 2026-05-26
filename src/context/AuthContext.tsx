import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AuthContextType, AuthResponse, User } from "../types/auth";
import { clearState, loadState, saveState } from "../services/persistence";
import {
  clearGuestState,
  enterGuestMode,
  exitGuestMode,
  getGuestId,
  hasGuestState,
  isGuestMode,
} from "../lib/guest";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const guestUser: User = {
  id: getGuestId(),
  email: "",
  name: "Guest",
  avatarUrl: null,
};

function toAppUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name:
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split("@")[0] ||
      "Player",
    avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
  };
}

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() =>
    isGuestMode() ? guestUser : null
  );
  const [loading, setLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(isGuestMode());
  const [showMergePrompt, setShowMergePrompt] = useState(false);

useEffect(() => {
  const ensureUserProfileExists = async (supabaseUser: any) => {
    try {
      const { data: profile, error: profileErr } = await supabase
        .from("users")
        .select("id")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (!profileErr && !profile) {
        console.log("[EcoPlay] Public profile missing. Creating on-the-fly...");

        await supabase.from("users").insert([
          {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name:
              supabaseUser.user_metadata?.name ||
              supabaseUser.email?.split("@")[0] ||
              "EcoPlayer",
            points: 0,
            level: 1,
            eco_score: 0,
            avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          },
        ]);
      }

      const { data: village, error: villageErr } = await supabase
        .from("eco_villages")
        .select("id")
        .eq("user_id", supabaseUser.id)
        .maybeSingle();

      if (!villageErr && !village) {
        console.log(
          "[EcoPlay] Eco village record missing. Initializing on-the-fly..."
        );

        await supabase.from("eco_villages").insert([
          {
            user_id: supabaseUser.id,
            air_quality: 20,
            water_quality: 20,
            biodiversity: 10,
            trees: 0,
            solar_panels: 0,
            water_filters: 0,
            pollution_level: 80,
          },
        ]);
      }
    } catch (err) {
      console.error("[EcoPlay] Error self-healing profile:", err);
    }
  };

  supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      if (session?.user) {
        setUser(toAppUser(session.user));
        ensureUserProfileExists(session.user);
      } else {
        setUser(isGuestMode() ? guestUser : null);
      }

      setLoading(false);
    })
    .catch(() => {
      setSupabaseError(
        "Unable to connect to Supabase. Some features may be unavailable."
      );

      setLoading(false);
    });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setUser(toAppUser(session.user));
      ensureUserProfileExists(session.user);
    } else {
      setUser(isGuestMode() ? guestUser : null);
    }

    setLoading(false);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Registration failed - please try again.",
        };
      }

      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: data.user.email,
          name: name.trim(),
          points: 0,
          level: 1,
          eco_score: 0,
        },
      ]);

      if (profileError) {
        console.warn("[Auth] Profile insert error:", profileError.message);
      }

      const { error: villageError } = await supabase
        .from("eco_villages")
        .insert([
          {
            user_id: data.user.id,
            air_quality: 20,
            water_quality: 20,
            biodiversity: 10,
            trees: 0,
            solar_panels: 0,
            water_filters: 0,
            pollution_level: 80,
          },
        ]);

      if (villageError) {
        console.warn("[Auth] Village insert error:", villageError.message);
      }

      return { success: true, user: toAppUser(data.user) };
    } catch (err: any) {
      console.error("[Auth] Register error:", err);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Login failed - please try again." };
      }

      const loggedInUser = toAppUser(data.user);
      setUser(loggedInUser);

      if (hasGuestState()) {
        setShowMergePrompt(true);
      } else {
        exitGuestMode();
        setIsGuest(false);
      }

      return { success: true, user: loggedInUser };
    } catch (err: any) {
      console.error("[Auth] Login error:", err);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  const enterGuest = (): void => {
    enterGuestMode();
    setIsGuest(true);
    setUser(guestUser);
  };

  const exitGuest = (): void => {
    exitGuestMode();
    setIsGuest(false);
    setShowMergePrompt(false);
    setUser((currentUser) =>
      currentUser?.id === guestUser.id ? null : currentUser
    );
  };

  const confirmMerge = (): void => {
    if (!user || user.id === guestUser.id) {
      return;
    }

    const guestState = loadState(guestUser.id);
    const userState = loadState(user.id);
    const guestPoints = guestState?.user?.points ?? 0;
    const userPoints = userState?.user?.points ?? 0;
    const mergedBase =
      guestPoints >= userPoints
        ? guestState ?? userState
        : userState ?? guestState;

    if (mergedBase) {
      saveState({
        userId: user.id,
        state: {
          ...mergedBase,
          user: {
            ...(mergedBase.user ?? {}),
            name: user.name,
            points: Math.max(guestPoints, userPoints),
          },
        },
      });
    }

    clearGuestState();
    exitGuest();
    setShowMergePrompt(false);
    window.location.assign("/dashboard");
  };

  const skipMerge = (): void => {
    clearGuestState();
    exitGuest();
    setShowMergePrompt(false);
    window.location.assign("/dashboard");
  };

  const logout = async (): Promise<void> => {
    if (user) {
      clearState(user.id);
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        supabaseError,
        isGuest,
        showMergePrompt,
        login,
        register,
        enterGuest,
        exitGuest,
        confirmMerge,
        skipMerge,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
