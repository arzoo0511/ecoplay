import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AuthContextType, AuthResponse, User } from "../types/auth";
import { clearState } from "../services/persistence";
import { getPasswordValidationErrors } from "../validators/auth";

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
            const passwordErrors = getPasswordValidationErrors(password);

      if (passwordErrors.length > 0) {
        return {
          success: false,
          error: passwordErrors.join('\n')
        };
      }

      // Step 1: Create authentication account
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

      // Step 2: Create user profile
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

      // Properly handle profile creation failure
      if (profileError) {
        console.error(
          "[Auth] Profile insert failed:",
          profileError.message
        );

        return {
          success: false,
          error: "Failed to create user profile.",
        };
      }

      // Step 3: Create eco village
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

      // Properly handle eco village failure
      if (villageError) {
        console.error(
          "[Auth] Village initialization failed:",
          villageError.message
        );

        // Rollback user profile creation
        await supabase
          .from("users")
          .delete()
          .eq("id", data.user.id);

        return {
          success: false,
          error: "Failed to initialize eco village.",
        };
      }

      // Success
      return {
        success: true,
        user: toAppUser(data.user),
      };
    } catch (err: any) {
      console.error("[Auth] Register error:", err);

      return {
        success: false,
        error: "An unexpected error occurred.",
      };
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
        return {
          success: false,
          error: "Login failed — please try again.",
        };
      }

      return {
        success: true,
        user: toAppUser(data.user),
      };
    } catch (err: any) {
      console.error("[Auth] Login error:", err);

      return {
        success: false,
        error: "An unexpected error occurred.",
      };
    }
  };

  const forgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
    };
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
        login,
        register,
        forgotPassword,
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