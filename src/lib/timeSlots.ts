export const timeSlots = [
  { time: "6:00 AM - 7:00 AM", price: 700, light: false },
  { time: "7:00 AM - 8:00 AM", price: 700, light: false },
  { time: "8:00 AM - 9:00 AM", price: 700, light: false },
  { time: "9:00 AM - 10:00 AM", price: 700, light: false },
  { time: "10:00 AM - 11:00 AM", price: 700, light: false },
  { time: "11:00 AM - 12:00 PM", price: 700, light: false },
  { time: "12:00 PM - 1:00 PM", price: 700, light: false },
  { time: "1:00 PM - 2:00 PM", price: 700, light: false },
  { time: "2:00 PM - 3:00 PM", price: 700, light: false },
  { time: "3:00 PM - 4:00 PM", price: 700, light: false },
  { time: "4:00 PM - 5:00 PM", price: 700, light: false },
  { time: "5:00 PM - 6:00 PM", price: 700, light: false },
  { time: "6:00 PM - 7:00 PM", price: 700, light: false },
  { time: "7:00 PM - 8:00 PM", price: 1200, light: true },
  { time: "8:00 PM - 9:00 PM", price: 1200, light: true },
  { time: "9:00 PM - 10:00 PM", price: 1200, light: true },
  { time: "10:00 PM - 11:00 PM", price: 1200, light: true },
  { time: "11:00 PM - 12:00 AM", price: 1200, light: true },
  { time: "12:00 AM - 1:00 AM", price: 1200, light: true },
  { time: "1:00 AM - 2:00 AM", price: 1200, light: true },
  { time: "2:00 AM - 3:00 AM", price: 1200, light: true },
  { time: "3:00 AM - 4:00 AM", price: 1200, light: true },
  { time: "4:00 AM - 5:00 AM", price: 1200, light: true },
  { time: "5:00 AM - 6:00 AM", price: 1200, light: true },
];

// Start hours (24h) for each slot index
const slotStartHours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];

export function isSlotExpired(slotIndex: number, selectedDate: Date): boolean {
  const hour = slotStartHours[slotIndex];
  const slotStart = new Date(selectedDate);
  slotStart.setHours(hour, 0, 0, 0);
  // Overnight slots (12 AM–6 AM) belong to the next calendar day
  if (slotIndex >= 18) {
    slotStart.setDate(slotStart.getDate() + 1);
  }
  return new Date() >= slotStart;
}

// GST per slot depends on light:
// Without light (₹700 slots) → ₹30 GST
// With light (₹1200 slots) → ₹50 GST
export const GST_WITHOUT_LIGHT = 30;
export const GST_WITH_LIGHT = 50;

// Per-slot discount based on how many slots selected:
// 1 slot → ₹0 off
// 2 slots → ₹50 off each slot
// 3+ slots → ₹100 off each slot
function perSlotDiscount(slotCount: number): number {
  if (slotCount <= 1) return 0;
  if (slotCount === 2) return 50;
  return 100; // 3+ slots
}

export function calcTotal(slotIndexes: number[]): {
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
} {
  if (!slotIndexes.length) return { subtotal: 0, discount: 0, gst: 0, total: 0 };

  const count = slotIndexes.length;
  let originalTotal = 0;
  let discountedTotal = 0;
  let gst = 0;

  const disc = perSlotDiscount(count);
  for (const i of slotIndexes) {
    const slot = timeSlots[i];
    originalTotal += slot.price;
    discountedTotal += slot.price - disc;
    gst += slot.light ? GST_WITH_LIGHT : GST_WITHOUT_LIGHT;
  }

  const discount = originalTotal - discountedTotal;
  return { subtotal: discountedTotal, discount, gst, total: discountedTotal + gst };
}
