"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { smoothScrollTo } from "@/lib/smoothScroll";

const navLinks = [
  { name: "Home", href: "#" },
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
  { name: "Gallery", href: "#gallery" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between w-fit rounded-full  border-black/90 bg-black/40 backdrop-blur-md px-5 py-2 mx-auto mt-4 gap-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-white tracking-tight"
        >
          {/* <Image
            src="/image/logo.png"
            alt="Turf Cricket logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            priority
          /> */}
          Krishna Turf Twin
        </Link>

        <ul
          className="relative flex gap-0"
          onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
        >
          {navLinks.map((link) => (
            <Tab key={link.name} href={link.href} setPosition={setPosition}>
              {link.name}
            </Tab>
          ))}
          <Cursor position={position} />
        </ul>

        <a
          href="#booking"
          onClick={(e) => smoothScrollTo(e, "#booking")}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/90 hover:shadow-lg"
        >
          Book Now
        </a>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 bg-black/80 backdrop-blur-xl left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-white tracking-tight"
        >
          <Image
            src="/image/logo.png"
            alt="Turf Cricket logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
            priority
          />
          Turf<span className="text-green-400">Cricket</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="#booking"
            onClick={(e) => smoothScrollTo(e, "#booking")}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
          >
            Book Now
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center size-10 text-white"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-50 rounded-b-2xl bg-black/80 backdrop-blur-xl p-6 md:hidden"
          >
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      smoothScrollTo(e, link.href);
                      setMobileOpen(false);
                    }}
                    className="block font-inter text-2xl font-medium text-white py-2"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Tab({
  children,
  href,
  setPosition,
}: {
  children: React.ReactNode;
  href: string;
  setPosition: React.Dispatch<
    React.SetStateAction<{ left: number; width: number; opacity: number }>
  >;
}) {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      className="relative z-10 block cursor-pointer"
    >
      <a
        href={href}
        onClick={(e) => smoothScrollTo(e, href)}
        className="block px-3 py-2 text-sm font-medium text-white transition-colors"
      >
        {children}
      </a>
    </li>
  );
}

function Cursor({
  position,
}: {
  position: { left: number; width: number; opacity: number };
}) {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-9 rounded-full bg-white/20"
    />
  );
}
