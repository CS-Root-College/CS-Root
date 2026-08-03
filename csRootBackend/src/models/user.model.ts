import mongoose, { Document, Schema } from "mongoose";

type UserRole = "user" | "admin";

interface IUserSubscription {
  plan: "free" | "premium";

  startedAt?: Date | null;

  expiresAt: Date | null;
}

export interface IUser extends Document {
  name?: string;
  username: string;
  email?: string;
  password?: string;

  profilePicture?: string;
  profilePicturePublicId?: string;
  bio?: string;

  subscription: IUserSubscription;
  reputation: number;
  showReputation: boolean;

  // Verification
  isEmailVerified: boolean;
  twoStepVerification: boolean;
  twoStepVerificationChangedAt?: Date;

  // GitHub
  githubUsername?: string;
  githubId?: string;

  // Security
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  refreshToken?: string;

  // Game
  totalPoints: number;
  experiencePoints: number;
  streaks: number;
  lastSolvedDate?: Date;
  badge?: string;
  badgesCount: number;

  // Account Status
  role: UserRole;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  activityVisibility: string;
  authProvider?: string;

  // Activity
  lastLogin?: Date;
  lastActiveAt?: Date;

  // Compiler
  preferredLanguage?: string;
  enableProblemTimer: boolean;

  // Social
  friends: number;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String
    },

    profilePicture: {
      type: String,
      default: "https://res.cloudinary.com/dlzi244at/image/upload/v1763367677/defaultPersonImage_exseqc.avif",
    },
    profilePicturePublicId: {
      type: String,
      default: null
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    subscription: {
      plan: {
        type: String,
        enum: [
          "free",
          "premium"
        ],
        default: "free"
      },

      startedAt: {
        type: Date,
        default: null
      },

      expiresAt: {
        type: Date,
        default: null
      }
    },

    reputation: {
      type: Number,
      default: 0,
      max: 5
    },
    showReputation: {
      type: Boolean,
      default: false
    },

    // Verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    twoStepVerification: {
      type: Boolean,
      default: false
    },
    twoStepVerificationChangedAt: {
      type: Date,
      default: null
    },

    // GitHub
    githubUsername: {
      type: String,
      default: null,
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // Security
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpiry: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null
    },

    // Game
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    experiencePoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    streaks: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastSolvedDate: {
      type: Date
    },

    badge: {
      type: String
    },

    badgesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Account Status
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: null,
    },

    activityVisibility: {
      type: String,
      enum: [
        "public",
        "friends",
        "private"
      ],
      default: "public"
    },

    authProvider: {
      type: String
    },

    // Activity
    lastLogin: {
      type: Date,
    },

    lastActiveAt: {
      type: Date,
    },

    // Compiler
    preferredLanguage: {
      type: String,
      default: "javascript",
    },

    enableProblemTimer: {
      type: Boolean,
      default: false,
    },

    // Social
    friends: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);