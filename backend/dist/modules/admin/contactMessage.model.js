import mongoose, { Schema } from "mongoose";
const ContactMessageSchema = new Schema({
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
}, { timestamps: true });
export const ContactMessageModel = mongoose.model("ContactMessage", ContactMessageSchema);
//# sourceMappingURL=contactMessage.model.js.map