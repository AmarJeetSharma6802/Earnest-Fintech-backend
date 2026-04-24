-- CreateEnum
CREATE TYPE "CityEnum" AS ENUM ('DELHI', 'GURUGRAM', 'NOIDA', 'BANGALORE', 'KOLKATA', 'CHANDIGARH', 'UP');

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" "CityEnum" NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
