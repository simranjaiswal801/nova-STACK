import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const lines = z.array(z.string().trim().min(1).max(300)).max(40);
export const serviceSchema = z.object({
  slug,
  title: z.string().trim().min(2).max(120),
  icon: z.string().trim().min(1).max(40),
  group: z.enum([
    "Design & Development",
    "Engineering & Infrastructure",
    "Growth & Intelligence",
    "Digital Commerce",
  ]),
  text: z.string().trim().min(10).max(400),
  description: z.string().trim().min(10).max(2000),
  overview: z.string().trim().min(10).max(4000),
  deliverables: lines,
  tags: lines,
  benefits: lines,
  process: lines,
  faqs: z
    .array(
      z.tuple([
        z.string().trim().min(3).max(300),
        z.string().trim().min(3).max(1000),
      ]),
    )
    .max(20),
  enquiryService: z.string().trim().min(2).max(120),
  displayOrder: z.coerce.number().int().min(0).max(10000).default(0),
  published: z.boolean().default(true),
});
export const enquiryPatchSchema = z
  .object({
    status: z
      .enum(["new", "contacted", "in_progress", "completed", "rejected"])
      .optional(),
    internalNotes: z.string().trim().max(10000).optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0);
export const userStatusSchema = z.object({ active: z.boolean() });
export const messageReadSchema = z.object({ read: z.boolean() });
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z
    .string()
    .min(10)
    .max(72)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72),
});
