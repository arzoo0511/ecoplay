export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    success: boolean;
    error?: string;
    user?: User;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (
        name: string,
        email: string,
        password: string
    ) => Promise<AuthResponse>;
    logout: () => Promise<void>;
}