"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Phone, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { timeSlots } from "@/lib/timeSlots";

interface Booking {
  _id: string;
  name: string;
  phone: string;
  date: string;
  slots: number[];
  totalPrice: number;
  type: "online" | "offline";
  createdAt: string;
}

export default function AllBookingsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const dateStr = format(date, "yyyy-MM-dd");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/bookings?date=${dateStr}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }, [dateStr]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDelete = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) fetchBookings();
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalSlots = bookings.reduce((sum, b) => sum + b.slots.length, 0);

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">All Bookings</h1>

      {/* Date Picker + Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label>Filter by Date</Label>
          <Popover>
            <PopoverTrigger className="flex h-9 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm">
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

        <div className="flex gap-4">
          <div className="rounded-lg border bg-white px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Bookings</p>
            <p className="text-xl font-bold">{bookings.length}</p>
          </div>
          <div className="rounded-lg border bg-white px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Slots</p>
            <p className="text-xl font-bold">{totalSlots}</p>
          </div>
          <div className="rounded-lg border bg-white px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-xl font-bold">₹{totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Bookings Cards */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <p className="text-muted-foreground">No bookings for {format(date, "dd MMM yyyy")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-xl border bg-white p-5 space-y-3 transition-shadow hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-gray-100">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{booking.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="size-3" />
                      {booking.phone}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    booking.type === "online"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-orange-50 text-orange-600"
                  )}
                >
                  {booking.type}
                </span>
              </div>

              {/* Slots */}
              <div className="space-y-1.5">
                {booking.slots.map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-sm"
                  >
                    <span>{timeSlots[s].time}</span>
                    <span className="text-xs text-muted-foreground">
                      ₹{timeSlots[s].price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t pt-3">
                <p className="text-lg font-bold">₹{booking.totalPrice}</p>
                <button
                  onClick={() => handleDelete(booking._id)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="size-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
