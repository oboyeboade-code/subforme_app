// spiderHunt.model.ts
import mongoose from "mongoose";

export interface ISpiderHuntRound {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;

  difficulty: "easy" | "medium" | "hard";
  choice: number;
  spiderIndex: number;

  won: boolean;
  reward: number;

  createdAt: Date;
}

const SpiderHuntSchema = new mongoose.Schema<ISpiderHuntRound>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, required: true },

    difficulty: String,
    choice: Number,
    spiderIndex: Number,

    won: Boolean,
    reward: Number,
  },
  { timestamps: true }
);

export const SpiderHuntModel = mongoose.model("SpiderHuntRound", SpiderHuntSchema);