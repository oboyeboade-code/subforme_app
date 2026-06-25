import mongoose, { Schema } from "mongoose";
const InvitationSchema = new Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    inviteToken: { type: String, required: true, unique: true },
    role: { type: String, enum: ["super-admin", "admin", "customer", "vendor"], required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
export const InvitationModel = mongoose.model("Invitation", InvitationSchema);
//# sourceMappingURL=invitation.model.js.map