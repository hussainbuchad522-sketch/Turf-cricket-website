import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import SlotLock from "@/lib/models/SlotLock";
import { RAZORPAY_KEY_SECRET } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: "Missing payment details" }, { status: 400 });
    }

    // Verify signature: HMAC_SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return Response.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Look up the locked booking details
    const lock = await SlotLock.findOne({ orderId: razorpay_order_id });
    if (!lock) {
      return Response.json(
        { error: "Booking session expired. Please try again." },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await Booking.create({
      name: lock.name,
      phone: lock.phone,
      date: lock.date,
      turf: lock.turf,
      slots: lock.slots,
      totalPrice: lock.totalPrice,
      type: "online",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    // Release the lock
    await SlotLock.deleteOne({ orderId: razorpay_order_id });

    return Response.json({ success: true, booking });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return Response.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
