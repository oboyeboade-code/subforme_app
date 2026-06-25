// spiderHuntSession.model.ts
import mongoose from "mongoose";

export interface ISpiderHuntSession {
  userId: mongoose.Types.ObjectId;
  difficulty: "easy" | "medium" | "hard";

  totalEarned: number;
  streak: number;
  rounds: number;

  active: boolean;

  lastPlayedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SpiderHuntSessionSchema = new mongoose.Schema<ISpiderHuntSession>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    difficulty: { type: String, required: true },

    totalEarned: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    rounds: { type: Number, default: 0 },

    active: { type: Boolean, default: true },

    lastPlayedAt: { type: Date },
  },
  { timestamps: true }
);

export const SpiderHuntSessionModel = mongoose.model(
  "SpiderHuntSession",
  SpiderHuntSessionSchema
);