"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

export default function CreateBookingPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [turf, setTurf] = useState<1 | 2>(1);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const dateStr = format(date, "yyyy-MM-dd");

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/slots?date=${dateStr}&turf=${turf}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots || []);
      setUnavailableSlots(data.unavailableSlots || []);
    } catch {
      setBookedSlots([]);
      setUnavailableSlots([]);
    }
    setSelectedSlots([]);
    setLoading(false);
  }, [dateStr, turf]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

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

  const { subtotal, gst, total } = calcTotal(selectedSlots);

  const handleSubmit = async () => {
    if (!name || phone.length !== 10 || selectedSlots.length === 0) return;
    setSuccess(false);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        date: dateStr,
        turf,
        slots: selectedSlots,
        type: "offline",
      }),
    });

    if (res.ok) {
      setName("");
      setPhone("");
      setSelectedSlots([]);
      setSuccess(true);
      fetchSlots();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to add booking");
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Create Booking</h1>

      {success && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-3 text-sm text-green-700">
          Booking added successfully!
        </div>
      )}

      {/* Turf + Date + Form Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Turf</Label>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTurf(t as 1 | 2)}
                className={cn(
                  "h-9 rounded-lg border text-sm font-medium transition-all",
                  turf === t
                    ? "border-black bg-black text-white"
                    : "border-input hover:border-black/40"
                )}
              >
                Box {t}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm">
              <CalendarIcon className="size-4" />
              {format(date, "PPP")}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-name">Customer Name</Label>
          <Input
            id="a-name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-phone">Phone Number</Label>
          <Input
            id="a-phone"
            type="tel"
            maxLength={10}
            placeholder="10 digit number"
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) setPhone(val);
            }}
          />
        </div>
      </div>

      {/* Slot Grid */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-semibold">
          Box {turf} · {format(date, "dd MMM yyyy")}
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {timeSlots.map((slot, index) => {
              const isBooked = bookedSlots.includes(index);
              const isUnavailable = unavailableSlots.includes(index);
              const isSelected = selectedSlots.includes(index);
              const selectable = isSlotSelectable(index);
              return (
                <button
                  key={index}
                  onClick={() => toggleSlot(index)}
                  disabled={isBooked || isUnavailable || (!selectable && !isSelected)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                    isBooked
                      ? "border-green-500 bg-green-50 text-green-700 cursor-not-allowed"
                      : isUnavailable
                        ? "border-red-300 bg-red-50 text-red-400 cursor-not-allowed"
                        : isSelected
                          ? "border-black bg-black text-white"
                          : selectable
                            ? "border-input hover:border-black/40"
                            : "border-input opacity-40 cursor-not-allowed"
                  )}
                >
                  <span className="block text-xs font-medium">{slot.time}</span>
                  <span className="text-xs opacity-70">
                    {isBooked ? "Booked" : isUnavailable ? "Not Available" : `₹${slot.price}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm border border-input" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-green-50 border border-green-500" /> Booked</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-red-50 border border-red-300" /> Not Available</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-black" /> Selected</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-5">
        <div>
          <p className="text-sm text-muted-foreground">
            Box {turf} · {selectedSlots.length} slot
            {selectedSlots.length !== 1 ? "s" : ""} selected
          </p>
          <p className="text-2xl font-bold">₹{total}</p>
          {selectedSlots.length > 0 && (
            <p className="text-xs text-muted-foreground">
              ₹{subtotal} + ₹{gst} GST included
            </p>
          )}
        </div>
        <Button
          className="bg-black text-white hover:bg-black/90 px-8"
          onClick={handleSubmit}
          disabled={!name || phone.length !== 10 || selectedSlots.length === 0}
        >
          Add Booking
        </Button>
      </div>
    </div>
  );
}
