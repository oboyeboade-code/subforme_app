import { Booking } from "../_shared/booking.model.js";

export const BookingService = {
  async create(data: any) {
    return Booking.create({
      ...data,
      booked_at: new Date(),
    });
  },

  async findByUser(user_id: string) {
    return Booking.find({ user_id })
      .populate("service_id")
      .populate("vendor_id")
      .populate("location_id")
      .populate("voucher_id");
  },

  async confirm(bookingId: string) {
    return Booking.findByIdAndUpdate(
      bookingId,
      {
        status: "confirmed",
        confirmed_at: new Date(),
      },
      { new: true }
    );
  },

  async complete(bookingId: string) {
    return Booking.findByIdAndUpdate(
      bookingId,
      {
        status: "completed",
        completed_at: new Date(),
      },
      { new: true }
    );
  },

  async cancel(bookingId: string) {
    return Booking.findByIdAndUpdate(
      bookingId,
      {
        status: "cancelled",
      },
      { new: true }
    );
  },
};