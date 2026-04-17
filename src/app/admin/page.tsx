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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { timeSlots, calcTotal, isSlotExpired } from "@/lib/timeSlots";

export default function CreateBookingPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [turf, setTurf] = useState<1 | 2>(1);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  const [lockedSlots, setLockedSlots] = useState<number[]>([]);
  const [recurringSlots, setRecurringSlots] = useState<number[]>([]);
  const [onlineSlots, setOnlineSlots] = useState<number[]>([]);
  const [slotNames, setSlotNames] = useState<Record<number, string>>({});
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [now, setNow] = useState(new Date());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = format(date, "yyyy-MM-dd");

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/slots?date=${dateStr}&turf=${turf}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots || []);
      setUnavailableSlots(data.unavailableSlots || []);
      setLockedSlots(data.lockedSlots || []);
      setRecurringSlots(data.recurringSlots || []);
      setOnlineSlots(data.onlineSlots || []);
      setSlotNames(data.slotNames || {});
    } catch {
      setBookedSlots([]);
      setUnavailableSlots([]);
      setLockedSlots([]);
      setRecurringSlots([]);
      setOnlineSlots([]);
      setSlotNames({});
    }
    setSelectedSlots([]);
    setLoading(false);
  }, [dateStr, turf]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const isSlotSelectable = (index: number) => {
    if (bookedSlots.includes(index) || unavailableSlots.includes(index) || lockedSlots.includes(index)) return false;
    if (isSlotExpired(index, date)) return false;
    if (selectedSlots.length === 0) return true;
    if (selectedSlots.includes(index)) return true;
    const min = Math.min(...selectedSlots);
    const max = Math.max(...selectedSlots);
    return index === min - 1 || index === max + 1;
  };

  const toggleSlot = (index: number) => {
    if (bookedSlots.includes(index) || unavailableSlots.includes(index) || lockedSlots.includes(index)) return;
    if (isSlotExpired(index, date)) return;
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

  const { subtotal, discount, gst, total } = calcTotal(selectedSlots);

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
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error || "Failed to add booking");
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
              const isRecurring = recurringSlots.includes(index);
              const isOnline = onlineSlots.includes(index);
              const isBooked = bookedSlots.includes(index);
              const isUnavailable = unavailableSlots.includes(index);
              const isLocked = lockedSlots.includes(index);
              const expired = isSlotExpired(index, date);
              const isSelected = selectedSlots.includes(index);
              const selectable = isSlotSelectable(index);

              let badgeText = `₹${slot.price}`;
              let slotClass = selectable ? "border-input hover:border-black/40" : "border-input opacity-40 cursor-not-allowed";

              if (isRecurring) {
                badgeText = "Recurring";
                slotClass = "border-purple-400 bg-purple-50 text-purple-700 cursor-not-allowed";
              } else if (isOnline) {
                badgeText = "Booked Online";
                slotClass = "border-emerald-500 bg-emerald-50 text-emerald-700 cursor-not-allowed";
              } else if (isBooked) {
                badgeText = "Booked";
                slotClass = "border-green-500 bg-green-50 text-green-700 cursor-not-allowed";
              } else if (isLocked) {
                badgeText = "Being Booked...";
                slotClass = "border-blue-400 bg-blue-50 text-blue-600 cursor-not-allowed animate-pulse";
              } else if (isUnavailable) {
                badgeText = "Not Available";
                slotClass = "border-red-300 bg-red-50 text-red-400 cursor-not-allowed";
              } else if (expired) {
                badgeText = "Expired";
                slotClass = "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed";
              } else if (isSelected) {
                slotClass = "border-black bg-black text-white";
              }

              const customerName = slotNames[index];

              return (
                <button
                  key={index}
                  onClick={() => toggleSlot(index)}
                  disabled={isBooked || isUnavailable || isLocked || expired || (!selectable && !isSelected)}
                  title={customerName ? `Booked by: ${customerName}` : ""}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                    slotClass
                  )}
                >
                  <span className="block text-xs font-medium">{slot.time}</span>
                  <span className="text-xs opacity-70">{badgeText}</span>
                  {customerName && (
                    <span className="block text-[10px] font-medium truncate opacity-80">
                      {customerName}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm border border-input" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-green-50 border border-green-500" /> Booked (Admin)</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-emerald-50 border border-emerald-500" /> Booked Online</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-purple-50 border border-purple-400" /> Recurring</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-blue-50 border border-blue-400" /> Being Booked</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-red-50 border border-red-300" /> Not Available</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-gray-100 border border-gray-300" /> Expired</span>
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
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">₹{total}</p>
            {discount > 0 && (
              <p className="text-sm text-muted-foreground line-through">
                ₹{subtotal + discount + gst}
              </p>
            )}
          </div>
          {selectedSlots.length > 0 && (
            <>
              {discount > 0 && (
                <p className="text-xs text-green-600 font-medium">
                  You save ₹{discount} with multi-slot discount
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                ₹{subtotal} + ₹{gst} GST included
              </p>
            </>
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

      <AlertDialog open={!!errorMsg} onOpenChange={(o) => !o && setErrorMsg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Could not create booking</AlertDialogTitle>
            <AlertDialogDescription>{errorMsg}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorMsg(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
