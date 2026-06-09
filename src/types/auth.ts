export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
}

export interface AuthResponse {
    success: boolean;
    error?: string;
    user?: User;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    supabaseError: string | null;
    isGuest: boolean;
    showMergePrompt: boolean;
    login: (email: string, password: string) => Promise<AuthResponse>;
    loginWithGoogle: () => Promise<AuthResponse>;
    forgotPassword: (
            email: string
            ) => Promise<{
            success: boolean;
            error?: string;
    }>;
    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<AuthResponse>;
    enterGuest: () => void;
    exitGuest: () => void;
    confirmMerge: () => void;
    skipMerge: () => void;
    logout: () => Promise<void>;
}
