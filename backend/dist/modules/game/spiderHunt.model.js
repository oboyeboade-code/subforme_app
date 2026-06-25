// spiderHunt.model.ts
import mongoose from "mongoose";
const SpiderHuntSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    difficulty: String,
    choice: Number,
    spiderIndex: Number,
    won: Boolean,
    reward: Number,
}, { timestamps: true });
export const SpiderHuntModel = mongoose.model("SpiderHuntRound", SpiderHuntSchema);
//# sourceMappingURL=spiderHunt.model.js.map