import { z } from "zod";

export const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Invalid Password" }),
  rememberMe: z.boolean().optional().default(false),

});

export type SigninSchemaType = z.infer<typeof signinSchema>;
