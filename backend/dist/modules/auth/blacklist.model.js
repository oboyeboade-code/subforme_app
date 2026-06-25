import mongoose, { Schema } from "mongoose";
const BlacklistSchema = new Schema({
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
export default mongoose.model("Blacklist", BlacklistSchema);
//# sourceMappingURL=blacklist.model.js.map