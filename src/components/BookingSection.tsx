"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Phone } from "lucide-react";
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
import { timeSlots, calcTotal } from "@/lib/timeSlots";

export default function BookingSection() {
  const [date, setDate] = useState<Date>();
  const [turf, setTurf] = useState<1 | 2>(1);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const fetchSlotStatus = useCallback(async () => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const res = await fetch(`/api/slots?date=${dateStr}&turf=${turf}`);
    const data = await res.json();
    setBookedSlots(data.bookedSlots || []);
    setUnavailableSlots(data.unavailableSlots || []);
    setSelectedSlots([]);
  }, [date, turf]);

  useEffect(() => {
    fetchSlotStatus();
  }, [fetchSlotStatus]);

  const isSlotSelectable = (index: number) => {
    if (bookedSlots.includes(index) || unavailableSlots.includes(index)) return false;
    if (selectedSlots.length === 0) return true;
    if (selectedSlots.includes(index)) return true;
    const min = Math.min(...selectedSlots);
    const max = Math.max(...selectedSlots);
    return index === min - 1 || index === max + 1;
  };

  const toggleSlot = (index: number) => {
    if (bookedSlots.includes(index) || unavailableSlots.includes(index)) return;
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

  const { subtotal, gst, total } = calcTotal(selectedSlots);

  const handleBooking = async () => {
    if (!name || phone.length !== 10 || !date || selectedSlots.length === 0) return;
    setSubmitting(true);
    setSuccess(false);

    const dateStr = format(date, "yyyy-MM-dd");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        date: dateStr,
        turf,
        slots: selectedSlots,
        type: "online",
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      setName("");
      setPhone("");
      setSelectedSlots([]);
      setSuccess(true);
      fetchSlotStatus();
      setTimeout(() => setSuccess(false), 5000);
    } else {
      const data = await res.json();
      alert(data.error || "Booking failed. Please try again.");
    }
  };

  return (
    <section id="booking" className="py-12 md:py-10">
      <div className="mx-auto max-w-7xl px-5">
        <RevealOnScroll>
          <div className="mx-auto max-w-xl space-y-3 text-center mb-8 md:mb-12 md:space-y-4">
            <h2 className="text-3xl font-medium sm:text-4xl lg:text-5xl">Book Your Slot</h2>
            <p className="text-muted-foreground">
              Pick your date, choose a time slot, and you&apos;re all set.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-8 md:grid-cols-2 md:gap-16 items-start">
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
                        : "border-input hover:border-black/40"
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
                    !date && "text-muted-foreground"
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
                <p className="text-sm text-muted-foreground py-4">Please select a date first</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 sm:max-h-76 md:grid-cols-3">
                  {timeSlots.map((slot, index) => {
                    const selected = selectedSlots.includes(index);
                    const isBooked = bookedSlots.includes(index);
                    const isUnavailable = unavailableSlots.includes(index);
                    const selectable = isSlotSelectable(index);
                    return (
                      <button
                        key={index}
                        onClick={() => toggleSlot(index)}
                        disabled={isBooked || isUnavailable || (!selectable && !selected)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition-all",
                          isBooked
                            ? "border-green-500 bg-green-50 text-green-700 cursor-not-allowed"
                            : isUnavailable
                              ? "border-red-300 bg-red-50 text-red-400 cursor-not-allowed"
                              : selected
                                ? "border-black bg-black text-white"
                                : selectable
                                  ? "border-input hover:border-black/40"
                                  : "border-input opacity-40 cursor-not-allowed"
                        )}
                      >
                        <span className="block font-medium">{slot.time}</span>
                        <span className="text-xs opacity-70">
                          {isBooked
                            ? "Booked"
                            : isUnavailable
                              ? "Not Available"
                              : `₹${slot.price} · ${slot.light ? "With Light" : "Without Light"}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm border border-input" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-green-50 border border-green-500" /> Booked</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-red-50 border border-red-300" /> Not Available</span>
                <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-black" /> Selected</span>
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
                    <p className="text-2xl font-semibold">₹{total}</p>
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
                {submitting ? "Booking..." : "Book Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
