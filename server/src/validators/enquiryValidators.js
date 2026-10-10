import { z } from "zod";

const email = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254)
  .transform((value) => value.toLowerCase());
export const enquirySchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(120),
    email,
    serviceSlug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Choose a valid NovaStack service."),
    projectDescription: z
      .string()
      .trim()
      .min(12, "Describe your project in at least 12 characters.")
      .max(5000),
    budgetRange: z.string().trim().max(80).optional().default(""),
    preferredTimeline: z.string().trim().max(80).optional().default(""),
  })
  .strict();
