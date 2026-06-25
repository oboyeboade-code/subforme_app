import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId; // References User _id
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  notificationsEnabled: boolean;
  emailReceipts: boolean;
  uiVersion: "editorial" | "v3";

  phone?: string;
  subscriptionPlan: "basic" | "pro";

  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    avatarUrl: { type: String, default: null },
    bio: { type: String },
    timezone: { type: String },
    notificationsEnabled: { type: Boolean, default: true },
    emailReceipts: { type: Boolean, default: true },
    uiVersion: {
      type: String,
      enum: ["editorial", "v3"],
      default: "v3",
    },

    phone: { type: String },
    subscriptionPlan: {
      type: String,
      enum: ["basic", "premium"],
      default: "basic",
    },
  },
  { timestamps: true }
);

export const ProfileModel = mongoose.model<IProfile>("Profile", ProfileSchema);