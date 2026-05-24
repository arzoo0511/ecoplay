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
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<AuthResponse>;
    logout: () => Promise<void>;
}