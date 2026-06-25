import mongoose, { Schema } from "mongoose";
const EmailLogSchema = new Schema({
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
}, { timestamps: true });
export const EmailLogModel = mongoose.model("EmailLog", EmailLogSchema);
//# sourceMappingURL=emailLog.model.js.map