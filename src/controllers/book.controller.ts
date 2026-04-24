import prisma from "../db/prisma";
import { Request, Response } from "express";

export const book = async (req: Request,res: Response): Promise<Response> => {
  try {
    const { fullName, phone, city, date, time } = req.body;

    if (!fullName || !phone || !city || !date || !time) {
      return res.status(400).json({ message: "All fields required" });
    }

    const previousBookings = await prisma.booking.count({
      where: { phone },
    });

    const newBooking = await prisma.booking.create({
      data: {
        fullName,
        phone,
        city,
        appointmentDate: new Date(date),
        appointmentTime: time,
        bookingCount: previousBookings + 1,
      },
    });

    return res.status(201).json({
      success: true,
      booking: newBooking,
      message:
        previousBookings >= 5
          ? "Old Patient Booking"
          : "New Booking Created",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};