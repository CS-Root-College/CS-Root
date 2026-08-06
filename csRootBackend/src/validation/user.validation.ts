import { z } from "zod";

export const userValidation = {
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50)
    .optional(),

  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Username can only contain letters, numbers and underscores."),

  email: z
    .email("Invalid email address.")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8)
    .max(100),

  profilePicture: z
    .url()
    .optional(),

  profilePicturePublicId: z
    .string()
    .nullable()
    .optional(),

  bio: z
    .string()
    .max(500)
    .optional(),

  reputation: z
    .number()
    .min(0)
    .max(5),

  showReputation: z.boolean(),

  isEmailVerified: z.boolean(),

  twoStepVerification: z.boolean(),

  githubUsername: z
    .string()
    .trim()
    .optional(),

  githubId: z
    .string()
    .optional(),

  totalPoints: z
    .number()
    .min(0),

  experiencePoints: z
    .number()
    .min(0),

  streaks: z
    .number()
    .min(0),

  badge: z
    .string()
    .optional(),

  badgesCount: z
    .number()
    .min(0),

  role: z.enum(["user", "admin"]),

  isActive: z.boolean(),

  isBanned: z.boolean(),

  banReason: z
    .string()
    .nullable()
    .optional(),

  activityVisibility: z.enum([
    "public",
    "friends",
    "private",
  ]),

  authProvider: z
    .string()
    .optional(),

  preferredLanguage: z
    .string()
    .trim(),

  enableProblemTimer: z.boolean(),

  friends: z
    .number()
    .min(0),

  subscription: z.object({
    plan: z.enum(["free", "premium"]),

    startedAt: z.date().nullable().optional(),

    expiresAt: z.date().nullable(),
  }),
};

export const registerValidation = z.object({
  username: userValidation.username,
  email: userValidation.email,
  password: userValidation.password,
});

export const loginValidation = z.object({
  email: userValidation.email,
  password: userValidation.password,
});

export const changeUsernameValidation = z.object({
  username: userValidation.username,
});

export const updateProfileValidation = z.object({
  name: userValidation.name,
  bio: userValidation.bio,
  profilePicture: userValidation.profilePicture,
});