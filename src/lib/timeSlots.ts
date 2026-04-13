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

export const GST_AMOUNT = 50;

export function calcTotal(slotIndexes: number[]): {
  subtotal: number;
  gst: number;
  total: number;
} {
  if (!slotIndexes.length) return { subtotal: 0, gst: 0, total: 0 };
  const subtotal = slotIndexes.reduce((s, i) => s + timeSlots[i].price, 0);
  return { subtotal, gst: GST_AMOUNT, total: subtotal + GST_AMOUNT };
}
