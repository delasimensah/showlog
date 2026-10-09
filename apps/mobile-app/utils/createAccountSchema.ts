import { emailSchema } from "shared";
import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type CreateAccountValues = z.infer<typeof createAccountSchema>;
