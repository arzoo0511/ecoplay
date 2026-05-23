import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContextType, AuthResponse, User } from "../types/auth";
import { loginSchema, registerSchema } from "../validators/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      const validated = registerSchema.safeParse({
        name,
        email,
        password,
      });

      if (!validated.success) {
        return {
          success: false,
          error: validated.error.issues[0]?.message || "Invalid input",
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }
      
      if (data.user) {
         const userSession: User = {
           id: data.user.id,
           name: name.trim(),
           email: data.user.email || email,
         };
         return {
           success: true,
           user: userSession,
         };
      }

      return {
        success: false,
        error: "Registration failed",
      };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        error: "Registration failed",
      };
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      const validated = loginSchema.safeParse({
        email,
        password,
      });

      if (!validated.success) {
        return {
          success: false,
          error: validated.error.issues[0]?.message || "Invalid credentials",
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }
      
      if (data.user) {
         const userSession: User = {
           id: data.user.id,
           name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
           email: data.user.email || email,
         };
         return {
           success: true,
           user: userSession,
         };
      }

      return {
        success: false,
        error: "Login failed",
      };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: "Login failed",
      };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
