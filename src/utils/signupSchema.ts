import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(6, { message: "Username must be at least 6 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  compcode: z.string().min(3, { message: "Company code must be at least 2 characters" }),
  role: z.string().min(3, { message: "Role must be at least 2 characters" }).optional(),
  avatar: z.string().optional()
      .refine(val => !val || val.length < 3_000_000, { // Approximate 2MB limit for base64
        message: "Avatar must be less than 2MB"
      }),});

export type SignupSchemaType = z.infer<typeof signupSchema>;
