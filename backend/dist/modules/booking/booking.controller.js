import { BookingService } from "../booking/booking.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../middleware/errorMiddleware.js";
export const BookingController = {
    async create(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new AppError("Unauthorized", 401);
            const booking = await BookingService.create({ ...req.body, user_id: userId });
            ok(res, booking, "Booking created", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async myBookings(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new AppError("Unauthorized", 401);
            const bookings = await BookingService.findByUser(userId);
            ok(res, bookings, "Bookings fetched");
        }
        catch (e) {
            next(e);
        }
    },
    async confirm(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const updated = await BookingService.confirm(id);
            ok(res, updated, "Booking confirmed");
        }
        catch (e) {
            next(e);
        }
    },
    async complete(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const updated = await BookingService.complete(id);
            ok(res, updated, "Booking completed");
        }
        catch (e) {
            next(e);
        }
    },
    async cancel(req, res, next) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const updated = await BookingService.cancel(id);
            ok(res, updated, "Booking cancelled");
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=booking.controller.js.map