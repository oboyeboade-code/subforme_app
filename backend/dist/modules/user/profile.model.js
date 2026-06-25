import mongoose, { Schema } from "mongoose";
const ProfileSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    avatarUrl: { type: String, default: null },
    bio: { type: String },
    timezone: { type: String },
    notificationsEnabled: { type: Boolean, default: true },
    emailReceipts: { type: Boolean, default: true },
    uiVersion: {
        type: String,
        enum: ["editorial", "v3"],
        default: "v3",
    },
    phone: { type: String },
    subscriptionPlan: {
        type: String,
        enum: ["basic", "premium"],
        default: "basic",
    },
}, { timestamps: true });
export const ProfileModel = mongoose.model("Profile", ProfileSchema);
//# sourceMappingURL=profile.model.js.map