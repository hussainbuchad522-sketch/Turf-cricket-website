import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Unavailable from "@/lib/models/Unavailable";
import SlotLock from "@/lib/models/SlotLock";
import { razorpay } from "@/lib/razorpay";
import { timeSlots, calcTotal } from "@/lib/timeSlots";

export const dynamic = "force-dynamic";

const LOCK_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, phone, date, turf, slots } = body;

    if (!name || !phone || !date || !slots?.length) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const turfNum = turf === 2 ? 2 : 1;

    // Collect already-taken slots: bookings + unavailable + active locks
    const [bookings, unavailables, locks] = await Promise.all([
      Booking.find({ date, turf: turfNum }),
      Unavailable.find({ date, turf: turfNum }),
      SlotLock.find({ date, turf: turfNum, expiresAt: { $gt: new Date() } }),
    ]);

    const taken = new Set<number>();
    bookings.forEach((b) => b.slots.forEach((s: number) => taken.add(s)));
    unavailables.forEach((u) => u.slots.forEach((s: number) => taken.add(s)));
    locks.forEach((l) => l.slots.forEach((s: number) => taken.add(s)));

    const conflict = slots.find((s: number) => taken.has(s));
    if (conflict !== undefined) {
      return Response.json(
        { error: `Slot "${timeSlots[conflict].time}" is no longer available. Please refresh.` },
        { status: 409 }
      );
    }

    const { total: totalPrice } = calcTotal(slots);

    // TODO: Remove test override before going live
    const chargeAmount = 1; // ₹1 for testing — change back to totalPrice for production

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: chargeAmount * 100,
      currency: "INR",
      receipt: `turf_${Date.now()}`,
      notes: { name, phone, date, turf: String(turfNum) },
    });

    // Lock the slots for 10 minutes
    await SlotLock.create({
      orderId: order.id,
      name,
      phone,
      date,
      turf: turfNum,
      slots,
      totalPrice,
      expiresAt: new Date(Date.now() + LOCK_DURATION_MS),
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    return Response.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
