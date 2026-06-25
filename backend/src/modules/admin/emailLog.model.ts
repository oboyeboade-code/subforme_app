import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
  recipient: string;
  templateName: string;
  status: "sent" | "failed" | "opened" | "clicked";
  providerMessageId?: string;
  error?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    recipient: { type: String, required: true },
    templateName: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "failed", "opened", "clicked"],
      required: true,
    },
    providerMessageId: { type: String },
    error: { type: String },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EmailLogModel = mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);
