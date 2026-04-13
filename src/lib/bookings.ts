import fs from "fs";
import path from "path";

export interface Booking {
  id: string;
  name: string;
  phone: string;
  date: string; // YYYY-MM-DD
  slots: number[]; // indices of timeSlots
  totalPrice: number;
  type: "online" | "offline";
  createdAt: string;
}

export interface UnavailableEntry {
  id: string;
  date: string;
  slots: number[];
  reason: string;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "bookings.json");
const UNAVAILABLE_FILE = path.join(process.cwd(), "data", "unavailable.json");

function ensureFile(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
}

// --- Bookings ---

export function getBookings(): Booking[] {
  ensureFile(DATA_FILE);
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

export function getBookingsByDate(date: string): Booking[] {
  return getBookings().filter((b) => b.date === date);
}

export function addBooking(booking: Omit<Booking, "id" | "createdAt">): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  return newBooking;
}

export function deleteBooking(id: string): boolean {
  const bookings = getBookings();
  const filtered = bookings.filter((b) => b.id !== id);
  if (filtered.length === bookings.length) return false;
  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export function getBookedSlots(date: string): number[] {
  const bookings = getBookingsByDate(date);
  const slots = new Set<number>();
  bookings.forEach((b) => b.slots.forEach((s) => slots.add(s)));
  return Array.from(slots);
}

// --- Unavailable Slots ---

export function getUnavailableEntries(): UnavailableEntry[] {
  ensureFile(UNAVAILABLE_FILE);
  const raw = fs.readFileSync(UNAVAILABLE_FILE, "utf-8");
  return JSON.parse(raw);
}

export function getUnavailableByDate(date: string): UnavailableEntry[] {
  return getUnavailableEntries().filter((u) => u.date === date);
}

export function getUnavailableSlots(date: string): number[] {
  const entries = getUnavailableByDate(date);
  const slots = new Set<number>();
  entries.forEach((e) => e.slots.forEach((s) => slots.add(s)));
  return Array.from(slots);
}

export function addUnavailable(entry: Omit<UnavailableEntry, "id" | "createdAt">): UnavailableEntry {
  const entries = getUnavailableEntries();
  const newEntry: UnavailableEntry = {
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  };
  entries.push(newEntry);
  fs.writeFileSync(UNAVAILABLE_FILE, JSON.stringify(entries, null, 2), "utf-8");
  return newEntry;
}

export function deleteUnavailable(id: string): boolean {
  const entries = getUnavailableEntries();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;
  fs.writeFileSync(UNAVAILABLE_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
