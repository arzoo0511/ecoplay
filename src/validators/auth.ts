import { z } from "zod";

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one numeric digit")
    .regex(
        /[^A-Za-z0-9\s]/,
        "Password must contain at least one special character"
    );

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const getPasswordValidationErrors = (password: string): string[] => {
    const result = passwordSchema.safeParse(password);

    if (result.success) {
        return [];
    }

    return [
        "Password must meet the following requirements:",
        ...result.error.issues.map((issue) => issue.message),
    ];
};
