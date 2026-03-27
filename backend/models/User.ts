import mongoose, { Schema, Document, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUser extends Document, IUserMethods {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  googleId?: string;
  avatar?: string;
  profile?: Types.ObjectId;
  resumeText: string;
  resumeFileName: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: false,
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"] as UserRole[],
      default: "user",
    },
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    resumeText: {
      type: String,
      default: "",
    },
    resumeFileName: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare candidate password to stored hash
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

// Strip password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User: UserModel = mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
