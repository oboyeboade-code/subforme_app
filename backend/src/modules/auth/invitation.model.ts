import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../user/user.model.js";

export interface IInvitation extends Document {
  email: string;
  inviteToken: string;
  role: UserRole;
  invitedBy: mongoose.Types.ObjectId;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    inviteToken: { type: String, required: true, unique: true },
    role: { type: String, enum: ["super-admin", "admin", "customer", "vendor"], required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const InvitationModel = mongoose.model<IInvitation>("Invitation", InvitationSchema);
