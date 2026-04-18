"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Phone } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { timeSlots, calcTotal, isSlotExpired } from "@/lib/timeSlots";
import { SpinnerOverlay } from "@/components/ui/spinner";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  image?: string;
  prefill: { name: string; contact: string; email?: string; method?: string };
  theme: { color: string };
  method?: {
    upi?: boolean;
    card?: boolean;
    netbanking?: boolean;
    wallet?: boolean;
    emi?: boolean;
    paylater?: boolean;
  };
  config?: {
    display: {
      blocks: Record<
        string,
        {
          name: string;
          instruments: { method: string; flows?: string[] }[];
        }
      >;
      sequence: string[];
      preferences: { show_default_blocks: boolean };
    };
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function BookingSection() {
  const [date, setDate] = useState<Date>();
  const [turf, setTurf] = useState<1 | 2>(1);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  const [lockedSlots, setLockedSlots] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [now, setNow] = useState(new Date());
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const fetchSlotStatus = useCallback(
    async (opts: { showLoader?: boolean } = {}) => {
      if (!date) return;
      const dateStr = format(date, "yyyy-MM-dd");
      if (opts.showLoader) setSlotsLoading(true);
      try {
        const res = await fetch(`/api/slots?date=${dateStr}&turf=${turf}`);
        const data = await res.json();
        setBookedSlots(data.bookedSlots || []);
        setUnavailableSlots(data.unavailableSlots || []);
        setLockedSlots(data.lockedSlots || []);
      } catch {
        setBookedSlots([]);
        setUnavailableSlots([]);
        setLockedSlots([]);
      } finally {
        if (opts.showLoader) setSlotsLoading(false);
      }
    },
    [date, turf],
  );

  // Clear selection only when user changes date or turf
  useEffect(() => {
    setSelectedSlots([]);
  }, [date, turf]);

  useEffect(() => {
    fetchSlotStatus({ showLoader: true });
  }, [fetchSlotStatus]);

  // Poll every 30s so locked slots update live as other users finish/abandon payment
  useEffect(() => {
    if (!date) return;
    const interval = setInterval(() => fetchSlotStatus(), 30_000);
    return () => clearInterval(interval);
  }, [date, fetchSlotStatus]);

  const isSlotSelectable = (index: number) => {
    if (
      bookedSlots.includes(index) ||
      unavailableSlots.includes(index) ||
      lockedSlots.includes(index)
    )
      return false;
    if (date && isSlotExpired(index, date)) return false;
    if (selectedSlots.length === 0) return true;
    if (selectedSlots.includes(index)) return true;
    const min = Math.min(...selectedSlots);
    const max = Math.max(...selectedSlots);
    return index === min - 1 || index === max + 1;
  };

  const toggleSlot = (index: number) => {
    if (
      bookedSlots.includes(index) ||
      unavailableSlots.includes(index) ||
      lockedSlots.includes(index)
    )
      return;
    if (date && isSlotExpired(index, date)) return;
    setSelectedSlots((prev) => {
      if (prev.includes(index)) {
        const min = Math.min(...prev);
        const max = Math.max(...prev);
        if (index !== min && index !== max) return prev;
        return prev.filter((i) => i !== index);
      }
      if (!isSlotSelectable(index)) return prev;
      return [...prev, index].sort((a, b) => a - b);
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { subtotal, discount, gst, total } = calcTotal(selectedSlots);

  const handleBooking = async () => {
    if (!name || phone.length !== 10 || !date || selectedSlots.length === 0)
      return;
    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Payment system is still loading. Please try again in a moment.");
      return;
    }

    setSubmitting(true);
    setSuccess(false);

    const dateStr = format(date, "yyyy-MM-dd");

    let orderId: string;
    let amount: number;
    let currency: string;
    let keyId: string;
    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          date: dateStr,
          turf,
          slots: selectedSlots,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json().catch(() => ({}));
        alert(data.error || "Could not start payment. Please try again.");
        setSubmitting(false);
        fetchSlotStatus();
        return;
      }

      ({ orderId, amount, currency, keyId } = await orderRes.json());
    } catch (err) {
      console.error("Order request failed:", err);
      alert("Network error. Please check your connection and try again.");
      setSubmitting(false);
      return;
    }

    // 2. Open Razorpay checkout — UPI only
    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: "Krishna Twin Turf",
      description: `Box ${turf} · ${selectedSlots.length} slot${selectedSlots.length !== 1 ? "s" : ""}`,
      image: "/image/logo.png",
      // Pre-select UPI. email is required for `method` prefill to work.
      prefill: {
        name,
        contact: phone,
        email: "customer@krishnatwinturf.com",
        method: "upi",
      },
      theme: { color: "#000000" },
      method: {
        upi: true,
        card: false,
        netbanking: false,
        wallet: false,
        emi: false,
        paylater: false,
      },
      handler: async (response) => {
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            setName("");
            setPhone("");
            setSelectedSlots([]);
            setSuccess(true);
            fetchSlotStatus();
            setTimeout(() => setSuccess(false), 7000);
          } else {
            const data = await verifyRes.json().catch(() => ({}));
            alert(
              data.error ||
                "Payment verification failed. Please contact support.",
            );
            fetchSlotStatus();
          }
        } catch (err) {
          console.error("Verify request failed:", err);
          alert(
            "Payment went through but we couldn't confirm it. Please contact support with your payment ID.",
          );
          fetchSlotStatus();
        } finally {
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
          // Release the lock so slots free up immediately instead of waiting 3 min
          fetch("/api/razorpay/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          }).finally(() => fetchSlotStatus());
        },
      },
    });

    rzp.open();
  };

  return (
    <section id="booking" className="py-12 md:py-10">
      <div className="mx-auto max-w-7xl px-5">
        <RevealOnScroll>
          <div className="mx-auto max-w-xl space-y-3 text-center mb-8 md:mb-12 md:space-y-4">
            <h2 className="text-3xl font-medium sm:text-4xl lg:text-5xl">
              Book Your Slot
            </h2>
            <p className="text-muted-foreground">
              Pick your date, choose a time slot, and you&apos;re all set.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-8 md:grid-cols-1 md:gap-16 items-start">
          {/* Right - Booking Form */}
          <div className="space-y-5">
            {/* Name & Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  placeholder="10 digit mobile number"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setPhone(val);
                  }}
                />
                {phone.length > 0 && phone.length < 10 && (
                  <p className="text-xs text-destructive">
                    Enter 10 digit number
                  </p>
                )}
              </div>
            </div>

            {/* Turf Selection */}
            <div className="space-y-2">
              <Label>Select Turf</Label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTurf(t as 1 | 2)}
                    className={cn(
                      "rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                      turf === t
                        ? "border-black bg-black text-white"
                        : "border-input hover:border-black/40",
                    )}
                  >
                    Box {t}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Each turf is booked independently.
              </p>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) =>
                      d < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <Label>
                Select Time Slots{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (select consecutive slots for longer sessions)
                </span>
              </Label>
              {!date ? (
                <p className="text-sm text-muted-foreground py-4">
                  Please select a date first
                </p>
              ) : slotsLoading ? (
                <SpinnerOverlay label="Loading time slots..." />
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 sm:max-h-76 md:grid-cols-6">
                  {timeSlots.map((slot, index) => {
                    const selected = selectedSlots.includes(index);
                    const isBooked = bookedSlots.includes(index);
                    const isUnavailable = unavailableSlots.includes(index);
                    const isLocked = lockedSlots.includes(index);
                    const expired = isSlotExpired(index, date);
                    const selectable = isSlotSelectable(index);
                    return (
                      <button
                        key={index}
                        onClick={() => toggleSlot(index)}
                        disabled={
                          isBooked ||
                          isUnavailable ||
                          isLocked ||
                          expired ||
                          (!selectable && !selected)
                        }
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition-all",
                          isBooked
                            ? "border-green-500 bg-green-50 text-green-700 cursor-not-allowed"
                            : isLocked
                              ? "border-blue-400 bg-blue-50 text-blue-600 cursor-not-allowed animate-pulse"
                              : isUnavailable
                                ? "border-red-300 bg-red-50 text-red-400 cursor-not-allowed"
                                : expired
                                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : selected
                                    ? "border-black bg-black text-white"
                                    : selectable
                                      ? "border-input hover:border-black/40"
                                      : "border-input opacity-40 cursor-not-allowed",
                        )}
                      >
                        <span className="block font-medium">{slot.time}</span>
                        <span className="text-xs opacity-70">
                          {isBooked
                            ? "Booked"
                            : isLocked
                              ? "Someone is booking..."
                              : isUnavailable
                                ? "Not Available"
                                : expired
                                  ? "Expired"
                                  : `₹${slot.price} · ${slot.light ? "With Light" : "Without Light"}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm border border-input" />{" "}
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-green-50 border border-green-500" />{" "}
                  Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-blue-50 border border-blue-400" />{" "}
                  Someone is booking
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-red-50 border border-red-300" />{" "}
                  Not Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-gray-100 border border-gray-300" />{" "}
                  Expired
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm bg-black" /> Selected
                </span>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="rounded-lg border border-green-500 bg-green-50 p-3 text-sm text-green-700">
                Booking confirmed! Your slot has been reserved.
              </div>
            )}

            {/* Total & Submit */}
            <div className="flex items-center justify-between rounded-lg border border-input p-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Box {turf} · {selectedSlots.length} slot
                  {selectedSlots.length !== 1 ? "s" : ""}
                </p>
                {selectedSlots.length > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold">₹{total}</p>
                      {discount > 0 && (
                        <p className="text-sm text-muted-foreground line-through">
                          ₹{subtotal + discount + gst}
                        </p>
                      )}
                    </div>
                    {discount > 0 && (
                      <p className="text-xs text-green-600 font-medium">
                        You save ₹{discount} with multi-slot discount
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      ₹{subtotal} + ₹{gst} GST included
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-semibold">₹0</p>
                )}
              </div>
              <Button
                className="rounded-full bg-black px-8 py-5 text-white hover:bg-black/90"
                disabled={
                  submitting ||
                  !name ||
                  phone.length !== 10 ||
                  !date ||
                  selectedSlots.length === 0
                }
                onClick={handleBooking}
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Booking...
                  </span>
                ) : (
                  "Book Now"
                )}
              </Button>
            </div>
          </div>
          {/* Left - Google Map + Contacts */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl h-[250px] w-full sm:h-[300px] md:h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.5!2d70.0696!3d22.4707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39571500124d3cad%3A0xba6177ac8055e10b!2sKrishna%20Twin%20Turf!5e0!3m2!1sen!2sin!4v1"
                className="h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Contact Numbers */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Contact Us</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[
                  { name: "Ram bhai", phone: "9408950000" },
                  { name: "Balkrishna bhai", phone: "9974888178" },
                  { name: "Yash bhai", phone: "9601107505" },
                  { name: "Hussain bhai", phone: "9499723659" },
                ].map((contact) => (
                  <a
                    key={contact.phone}
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3 rounded-lg border border-input p-3 transition-colors hover:bg-muted"
                  >
                    <Phone className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.phone}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
