"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Repeat, Trash2, Phone, User } from "lucide-react";
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { timeSlots } from "@/lib/timeSlots";
import { SpinnerOverlay } from "@/components/ui/spinner";

interface RecurringGroup {
  _id: string;
  name: string;
  phone: string;
  turf: 1 | 2;
  slots: number[];
  pricePerDay: number;
  startDate: string;
  endDate: string;
  count: number;
}

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1;
}

export default function RecurringBookingPage() {
  const [groups, setGroups] = useState<RecurringGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [turf, setTurf] = useState<1 | 2>(2);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [pricePerDay, setPricePerDay] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog state
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<RecurringGroup | null>(null);
  const [infoDialog, setInfoDialog] = useState<{ title: string; description: string } | null>(null);



  // Conflict detection: slot index -> list of conflicting dates in the chosen range
  const [conflictsBySlot, setConflictsBySlot] = useState<Record<number, string[]>>({});
  const [conflictNames, setConflictNames] = useState<Record<number, string[]>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recurring");
      const data = await res.json();
      setGroups(data.groups || []);
    } catch {
      setGroups([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Fetch conflicts whenever date range or turf changes
  useEffect(() => {
    if (!endDate) {
      setConflictsBySlot({});
      return;
    }
    const controller = new AbortController();
    const fetchConflicts = async () => {
      setCheckingAvailability(true);
      try {
        const params = new URLSearchParams({
          start: format(startDate, "yyyy-MM-dd"),
          end: format(endDate, "yyyy-MM-dd"),
          turf: String(turf),
        });
        const res = await fetch(`/api/slots/range?${params}`, { signal: controller.signal });
        const data = await res.json();
        setConflictsBySlot(data.conflictsBySlot || {});
        setConflictNames(data.slotNames || {});
      } catch {
        setConflictsBySlot({});
        setConflictNames({});
      } finally {
        setCheckingAvailability(false);
      }
    };
    fetchConflicts();
    return () => controller.abort();
  }, [startDate, endDate, turf]);

  const toggleSlot = (index: number) => {
    // Don't allow selecting a slot that has any conflict in the range
    if (conflictsBySlot[index]?.length) return;
    setSelectedSlots((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  const totalDays = endDate ? daysBetween(startDate, endDate) : 0;
  const totalValue = totalDays * pricePerDay;

  const handleSubmitClick = () => {
    setError("");
    setSuccess("");
    if (!name || phone.length !== 10 || selectedSlots.length === 0 || !endDate || !pricePerDay) {
      setError("Please fill all fields correctly");
      return;
    }
    setConfirmCreateOpen(true);
  };

  const confirmCreate = async () => {
    setConfirmCreateOpen(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          turf,
          slots: selectedSlots,
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate!, "yyyy-MM-dd"),
          pricePerDay,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(`Created ${data.count} bookings for ${name}`);
        setName("");
        setPhone("");
        setSelectedSlots([]);
        setEndDate(undefined);
        setPricePerDay(0);
        fetchGroups();
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "Failed to create recurring booking");
      }
    } catch (err) {
      console.error("Recurring create failed:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const groupName = cancelTarget.name;
    const groupId = cancelTarget._id;
    setCancelTarget(null);

    const res = await fetch(`/api/recurring/${groupId}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      setInfoDialog({
        title: "Cancelled",
        description: `${data.deletedCount} future bookings for ${groupName} have been cancelled. Past bookings are kept in records.`,
      });
      fetchGroups();
    } else {
      setInfoDialog({
        title: "Failed",
        description: "Could not cancel the recurring bookings. Please try again.",
      });
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Repeat className="size-6" />
        <h1 className="text-2xl font-bold">Recurring Bookings</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        For regular customers who book the same slots every day over a date range. A booking is created for each day at the custom daily price.
      </p>

      {success && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create Form */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold">Create New Recurring Booking</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="r-name">Customer Name</Label>
            <Input
              id="r-name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-phone">Phone</Label>
            <Input
              id="r-phone"
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
            <Label htmlFor="r-price">Price Per Day (₹)</Label>
            <Input
              id="r-price"
              type="number"
              min={0}
              placeholder="e.g. 2500"
              value={pricePerDay || ""}
              onChange={(e) => setPricePerDay(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm">
                <CalendarIcon className="size-4" />
                {format(startDate, "PPP")}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => d && setStartDate(d)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm">
                <CalendarIcon className="size-4" />
                {endDate ? format(endDate, "PPP") : "Pick end date"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => d && setEndDate(d)}
                  disabled={(d) => d < startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Time Slots</Label>
            {checkingAvailability && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Checking availability...
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {timeSlots.map((slot, index) => {
              const isSelected = selectedSlots.includes(index);
              const conflictDates = conflictsBySlot[index] || [];
              const hasConflict = conflictDates.length > 0;
              const names = conflictNames[index] || [];
              return (
                <button
                  key={index}
                  onClick={() => toggleSlot(index)}
                  disabled={hasConflict}
                  title={hasConflict ? `Booked by: ${names.join(", ") || "Unknown"} (${conflictDates.length} date${conflictDates.length !== 1 ? "s" : ""})` : ""}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition-all",
                    hasConflict
                      ? "border-red-300 bg-red-50 text-red-400 cursor-not-allowed"
                      : isSelected
                        ? "border-black bg-black text-white"
                        : "border-input hover:border-black/40"
                  )}
                >
                  <span className="block text-xs font-medium">{slot.time}</span>
                  {hasConflict && (
                    <>
                      <span className="block text-[10px] font-medium truncate opacity-80">
                        {names.join(", ") || "Unavailable"}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {conflictDates.length} date{conflictDates.length !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm border border-input" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-black" /> Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-red-50 border border-red-300" /> Has conflicts
            </span>
          </div>
        </div>

        {endDate && pricePerDay > 0 && selectedSlots.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
            <p className="font-semibold text-blue-900">Preview</p>
            <p className="text-blue-700">
              {totalDays} bookings from {format(startDate, "dd MMM yyyy")} to {format(endDate, "dd MMM yyyy")} · Box {turf} · {selectedSlots.length} slot{selectedSlots.length !== 1 ? "s" : ""} each day
            </p>
            <p className="text-blue-900 font-bold mt-1">
              Total: ₹{totalValue} (₹{pricePerDay}/day × {totalDays} days)
            </p>
          </div>
        )}

        <Button
          className="bg-black text-white hover:bg-black/90"
          onClick={handleSubmitClick}
          disabled={submitting}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </span>
          ) : (
            "Create Recurring Booking"
          )}
        </Button>
      </div>

      {/* Existing Recurring Groups */}
      <div className="space-y-3">
        <h2 className="font-semibold">Active Recurring Bookings</h2>
        {loading ? (
          <div className="rounded-xl border bg-white">
            <SpinnerOverlay label="Loading recurring bookings..." />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center">
            <p className="text-muted-foreground">No recurring bookings yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((g) => (
              <div
                key={g._id}
                className="rounded-xl border bg-white p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-blue-50">
                      <Repeat className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <User className="size-3.5 text-muted-foreground" />
                        {g.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        {g.phone}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-white">
                    Box {g.turf}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    {g.startDate} → {g.endDate}
                  </p>
                  <p className="text-xs">
                    Slots: {g.slots.map((s) => timeSlots[s].time).join(", ")}
                  </p>
                  <p className="text-sm">
                    ₹{g.pricePerDay}/day · {g.count} day{g.count !== 1 ? "s" : ""}
                  </p>
                </div>

                <button
                  onClick={() => setCancelTarget(g)}
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="size-3.5" />
                  Cancel Future Bookings
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create confirmation dialog */}
      <AlertDialog open={confirmCreateOpen} onOpenChange={setConfirmCreateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create recurring booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create <span className="font-semibold text-foreground">{totalDays} bookings</span> for{" "}
              <span className="font-semibold text-foreground">{name}</span> on Box {turf}
              {endDate && (
                <>
                  {" "}from {format(startDate, "dd MMM yyyy")} to {format(endDate, "dd MMM yyyy")}
                </>
              )}
              . Daily price: ₹{pricePerDay}. Total value: <span className="font-semibold text-foreground">₹{totalValue}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCreate} className="bg-black text-white hover:bg-black/90">
              Yes, create {totalDays} bookings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel future bookings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel all <span className="font-semibold text-foreground">future</span> recurring bookings for{" "}
              <span className="font-semibold text-foreground">{cancelTarget?.name}</span>. Past bookings stay in the records.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep bookings</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Yes, cancel future bookings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info dialog (success/error after cancel) */}
      <AlertDialog open={!!infoDialog} onOpenChange={(o) => !o && setInfoDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{infoDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>{infoDialog?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setInfoDialog(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
