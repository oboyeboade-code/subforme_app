import mongoose, { Schema } from "mongoose";
const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const NotificationModel = mongoose.model("Notification", NotificationSchema);
//# sourceMappingURL=notification.model.js.map