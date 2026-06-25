import { ProfileModel } from "../_shared/user.model.js";
// const formatJoined = (date?: Date) => {
//   if (!date) return "";
//   return new Date(date).toLocaleDateString("en-GB", {
//     month: "short",
//     year: "numeric",
//   });
// };
export const profileService = {
    async get(userId, fields) {
        // .lean() = plain JS object, ~3x faster, no Mongoose overhead
        // .select() = only pull fields you need
        return ProfileModel.findById(userId)
            .select(fields || '') // e.g. 'name email avatar' or '' for all
            .lean();
    },
    async update(userId, data) {
        // lean() here too + only return fields you actually use
        const profile = await ProfileModel.findByIdAndUpdate(userId, { $set: data }, {
            new: true,
            runValidators: true,
            lean: true, // returns plain object, not Mongoose doc
        });
        return profile; // returns null if not found, no need to check
    },
};
//# sourceMappingURL=profile.service.js.map