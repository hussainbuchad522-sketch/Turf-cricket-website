"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Ban } from "lucide-react";
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
import { timeSlots } from "@/lib/timeSlots";

interface UnavailableEntry {
  _id: string;
  date: string;
  slots: number[];
  reason: string;
  createdAt: string;
}

export default function MarkUnavailablePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<UnavailableEntry[]>([]);
  const [bookedSlots, setBookedSlots] = useState<number[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<number[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [reason, setReason] = useState("Maintenance");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const dateStr = format(date, "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [slotsRes, unavailRes] = await Promise.all([
      fetch(`/api/slots?date=${dateStr}`),
      fetch(`/api/unavailable?date=${dateStr}`),
    ]);

    const slotsData = await slotsRes.json();
    const unavailData = await unavailRes.json();

    setBookedSlots(slotsData.bookedSlots || []);
    setUnavailableSlots(slotsData.unavailableSlots || []);
    setEntries(unavailData.entries || []);
    setSelectedSlots([]);
    setLoading(false);
  }, [dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSlot = (index: number) => {
    if (bookedSlots.includes(index) || unavailableSlots.includes(index)) return;
    setSelectedSlots((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) return;
    setSuccess(false);

    const res = await fetch("/api/unavailable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr, slots: selectedSlots, reason }),
    });

    if (res.ok) {
      setSelectedSlots([]);
      setReason("Maintenance");
      setSuccess(true);
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this unavailable block?")) return;
    const res = await fetch(`/api/unavailable/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Mark Unavailable</h1>
      <p className="text-sm text-muted-foreground">
        Block time slots when the turf is under maintenance or not available for booking.
      </p>

      {success && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-3 text-sm text-green-700">
          Slots marked as unavailable!
        </div>
      )}

      {/* Date + Reason */}
      <div className="grid gap-4 sm:grid-cols-2">
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
          <Label htmlFor="reason">Reason</Label>
          <Input
            id="reason"
            placeholder="e.g. Maintenance, Repair, Event"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      {/* Slot Grid */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-semibold">
          Select slots to block — {format(date, "dd MMM yyyy")}
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {timeSlots.map((slot, index) => {
              const isBooked = bookedSlots.includes(index);
              const isUnavailable = unavailableSlots.includes(index);
              const isSelected = selectedSlots.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => toggleSlot(index)}
                  disabled={isBooked || isUnavailable}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                    isBooked
                      ? "border-green-500 bg-green-50 text-green-700 cursor-not-allowed"
                      : isUnavailable
                        ? "border-red-300 bg-red-50 text-red-400 cursor-not-allowed"
                        : isSelected
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-input hover:border-red-300"
                  )}
                >
                  <span className="block text-xs font-medium">{slot.time}</span>
                  <span className="text-xs opacity-70">
                    {isBooked ? "Booked" : isUnavailable ? "Blocked" : `₹${slot.price}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm border border-input" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-green-50 border border-green-500" /> Booked</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-red-50 border border-red-300" /> Already Blocked</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-red-500" /> Selecting to Block</span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-5">
        <p className="text-sm text-muted-foreground">
          {selectedSlots.length} slot{selectedSlots.length !== 1 ? "s" : ""} selected to block
        </p>
        <Button
          className="bg-red-500 text-white hover:bg-red-600 px-8"
          onClick={handleSubmit}
          disabled={selectedSlots.length === 0}
        >
          <Ban className="mr-2 size-4" />
          Mark Unavailable
        </Button>
      </div>

      {/* Existing Blocked Entries */}
      {entries.length > 0 && (
        <div className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="font-semibold">Blocked Slots for {format(date, "dd MMM yyyy")}</h2>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry._id}
                className="flex items-start justify-between rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-700">{entry.reason}</p>
                  <p className="text-xs text-red-500">
                    {entry.slots.map((s) => timeSlots[s].time).join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
