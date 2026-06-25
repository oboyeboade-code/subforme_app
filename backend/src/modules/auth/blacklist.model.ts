import mongoose, { Document, Schema } from "mongoose";

export interface IBlacklist extends Document {
  token: string;
  createdAt: Date;
}

const BlacklistSchema = new Schema<IBlacklist>({
  token: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "1d", // Automatically remove tokens after 24 hours
  },
});

export default mongoose.model<IBlacklist>("Blacklist", BlacklistSchema);
