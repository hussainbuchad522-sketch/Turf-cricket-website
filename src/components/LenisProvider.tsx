"use client";

import { useLenisScroll } from "@/lib/useLenisScroll";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLenisScroll();
  return <>{children}</>;
}
