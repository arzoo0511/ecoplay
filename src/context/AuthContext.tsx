import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AuthContextType, AuthResponse, User } from "../types/auth";
import { clearState } from "../services/persistence";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Maps a raw Supabase Auth user to the app's lightweight User shape.
 * Name is stored in user_metadata.name when the account is created.
 */
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? toAppUser(session.user) : null);
      setLoading(false);
    });

    // Keep state in sync with Supabase session events
    // (sign-in, sign-out, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(toAppUser(session.user));
      } else {
        setUser(null);
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
        const message = error.message.toLowerCase();

        if (message.includes("failed to fetch")) {
          return {
            success: false,
            error: "Unable to connect to authentication server.",
          };
        }

        return { success: false, error: error.message };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Registration failed — please try again.",
        };
      }

      // Create the user profile row in the public users table
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
        // Non-fatal: profile creation can fail on email-confirmation flows
        console.warn("[Auth] Profile insert error:", profileError.message);
      }

      // Create the initial eco village row
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
        const message = error.message.toLowerCase();

        if (message.includes("invalid login credentials")) {
          return {
            success: false,
            error: "Incorrect email or password.",
          };
        }

        if (message.includes("failed to fetch")) {
          return {
            success: false,
            error: "Unable to connect to authentication server.",
          };
        }

        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Login failed — please try again." };
      }

      return { success: true, user: toAppUser(data.user) };
    } catch (err: any) {
      console.error("[Auth] Login error:", err);
      return { success: false, error: "An unexpected error occurred." };
    }
  };

  const logout = async (): Promise<void> => {
    if (user) {
      clearState(user.id);
    }
    await supabase.auth.signOut();
    setUser(null);
    // onAuthStateChange also fires and sets user → null for safety
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
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
