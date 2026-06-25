// spiderHuntSession.model.ts
import mongoose from "mongoose";
const SpiderHuntSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    difficulty: { type: String, required: true },
    totalEarned: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    rounds: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    lastPlayedAt: { type: Date },
}, { timestamps: true });
export const SpiderHuntSessionModel = mongoose.model("SpiderHuntSession", SpiderHuntSessionSchema);
//# sourceMappingURL=spiderHuntSession.model.js.map