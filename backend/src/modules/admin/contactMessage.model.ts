import mongoose, { Schema, Document } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: mongoose.Types.ObjectId;
  status: "pending" | "resolved";
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const ContactMessageModel = mongoose.model<IContactMessage>(
  "ContactMessage",
  ContactMessageSchema
);
