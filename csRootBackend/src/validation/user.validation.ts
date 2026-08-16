import { z } from "zod";

export const userValidation = {
  name: z
    .string({
      message: "Name must be a string",
    })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  username: z
    .string({
      message: "Username must be a string",
    })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),

  email: z
    .string({
      message: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string({
      message: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),

  bio: z
    .string({
      message: "Bio must be a string",
    })
    .trim()
    .max(500, "Bio cannot exceed 500 characters"),

  profilePicture: z
    .string({
      message: "Profile picture must be a string",
    })
    .url("Invalid profile picture URL"),

  profilePicturePublicId: z
    .string({
      message: "Profile picture public ID must be a string",
    }),

  activityVisibility: z.enum(
    ["public", "friends", "private"],
    {
      message:
        "Activity visibility must be public, friends, or private",
    }
  ),

  preferredLanguage: z
    .string({
      message: "Preferred language must be a string",
    })
    .trim()
    .min(1, "Preferred language is required"),

  enableProblemTimer: z.boolean({
    message: "Enable problem timer must be a boolean",
  }),

  showReputation: z.boolean({
    message: "Show reputation must be a boolean",
  }),

  twoStepVerification: z.boolean({
    message: "Two-step verification must be a boolean",
  }),

  otp: z
    .string({
      message: "OTP is required",
    })
    .regex(
      /^\d{6}$/,
      "OTP must be exactly 6 digits"
    ),

  currentPassword: z
    .string({
      message: "Current password is required",
    })
    .min(8, "Current password must be at least 8 characters")
    .max(100, "Current password cannot exceed 100 characters"),

  newPassword: z
    .string({
      message: "New password is required",
    })
    .min(8, "New password must be at least 8 characters")
    .max(100, "New password cannot exceed 100 characters"),

  subscriptionPlan: z.enum(
    ["free", "premium"],
    {
      message: "Subscription plan must be free or premium",
    }
  ),

  role: z.enum(
    ["user", "admin"],
    {
      message: "Role must be user or admin",
    }
  ),

  githubUsername: z
    .string({
      message: "GitHub username must be a string",
    })
    .trim()
    .min(1, "GitHub username cannot be empty"),

  githubId: z
    .string({
      message: "GitHub ID must be a string",
    })
    .trim()
    .min(1, "GitHub ID cannot be empty"),

  banReason: z
    .string({
      message: "Ban reason must be a string",
    })
    .trim()
    .max(500, "Ban reason cannot exceed 500 characters"),

  authProvider: z
    .string({
      message: "Auth provider must be a string",
    })
    .trim()
    .min(1, "Auth provider is required"),
};