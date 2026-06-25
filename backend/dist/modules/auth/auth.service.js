import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../../middleware/errorMiddleware.js";
import Blacklist from "./blacklist.model.js";
import transporter from "../../utils/sendEmail.js";
import { UserModel } from "../user/user.model.js";
import { ProfileModel } from "../user/profile.model.js";
const signToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new AppError("JWT secret missing", 500);
    const options = { expiresIn: "1d" };
    return jwt.sign(payload, secret, options);
};
const findUserByEmail = async (email) => {
    return UserModel.findOne({ email }).select("+password");
};
export const authService = {
    register: async (data) => {
        const { email, password, name, role } = data;
        const exists = await findUserByEmail(email);
        if (exists)
            throw new AppError("Email already in use", 409);
        const user = await UserModel.create({
            email,
            password,
            role,
        });
        try {
            await ProfileModel.create({
                _id: user._id,
                email,
                name,
            });
        }
        catch {
            await UserModel.findByIdAndDelete(user._id);
            throw new AppError("Profile creation failed", 500);
        }
    },
    login: async (email, password) => {
        const user = await findUserByEmail(email);
        if (!user || !user.password)
            throw new AppError("Invalid credentials", 401);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            throw new AppError("Invalid credentials", 401);
        const token = signToken({
            userId: user._id.toString(),
            role: user.role,
        });
        return { token, role: user.role };
    },
    logout: async (token) => {
        if (!token)
            return;
        await Blacklist.create({ token });
    },
    me: async (auth) => {
        const user = await UserModel.findById(auth.userId)
            .select("_id email phone emailVerified subscriptionPlan subscriptions")
            .populate({
            path: "subscriptions",
            options: { limit: 3 },
            populate: { path: "serviceId" },
        });
        if (!user)
            throw new AppError("User not found", 404);
        return { user };
    },
    role: async (auth) => {
        return auth?.role;
    },
    forgotPassword: async (email, frontendUrl) => {
        const user = await UserModel.findOne({ email });
        if (!user)
            throw new AppError("User not found", 404);
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 5);
        await user.save();
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: "Password Reset",
            html: `
        <div style="font-family: Arial">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click below:</p>
          <a href="${resetLink}" style="display:inline-block; padding:10px 15px; background:#000; color:#fff; text-decoration:none;">Reset Password</a>
          <p>This link expires in 5 minutes.</p>
        </div>
      `,
        });
        return true;
    },
    resetPassword: async (token, newPassword) => {
        if (!token)
            throw new AppError("Invalid token", 400);
        if (!newPassword || newPassword.length < 6)
            throw new AppError("Password too short", 400);
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user)
            throw new AppError("Token is invalid or expired", 400);
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return true;
    },
};
//# sourceMappingURL=auth.service.js.map