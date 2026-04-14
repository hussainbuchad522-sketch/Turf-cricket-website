"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { smoothScrollTo } from "@/lib/smoothScroll";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "#" },
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
  { name: "Gallery", href: "#gallery" },
];

const SCROLL_THRESHOLD = 60;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between w-fit rounded-full  border-black/90 bg-white/40 backdrop-blur-md px-5 py-2 mx-auto mt-4 gap-20">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-lg font-bold tracking-tight transition-colors duration-300",
            scrolled ? "text-black" : "text-white"
          )}
        >
          <Image
            src="/image/logo.png"
            alt="Turf Cricket logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            priority
          /> 
          Krishna Turf Twin
        </Link>

        <ul
          className="relative flex gap-0"
          onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
        >
          {navLinks.map((link) => (
            <Tab
              key={link.name}
              href={link.href}
              setPosition={setPosition}
              scrolled={scrolled}
            >
              {link.name}
            </Tab>
          ))}
          <Cursor position={position} scrolled={scrolled} />
        </ul>

        <a
          href="#booking"
          onClick={(e) => smoothScrollTo(e, "#booking")}
          className={cn(
            "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-lg",
            scrolled
              ? "bg-black text-white hover:bg-black/90"
              : "bg-white text-black hover:bg-white/90"
          )}
        >
          Book Now
        </a>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 bg-white/30 backdrop-blur-2xl left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 py-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-lg font-bold tracking-tight transition-colors duration-300",
            scrolled ? "text-black" : "text-white"
          )}
        >
          <Image
            src="/image/logo.png"
            alt="Turf Cricket logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
            priority
          />
          Krishna Turf Twin
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="#booking"
            onClick={(e) => smoothScrollTo(e, "#booking")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300",
              scrolled ? "bg-black text-white" : "bg-white text-black"
            )}
          >
            Book Now
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center size-10 text-black"
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
            className="fixed top-16 left-0 right-0 z-50 rounded-b-2xl bg-white/40 backdrop-blur-2xl p-6 md:hidden"
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
                    className="block font-inter text-2xl font-medium text-black py-2"
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
  scrolled,
}: {
  children: React.ReactNode;
  href: string;
  setPosition: React.Dispatch<
    React.SetStateAction<{ left: number; width: number; opacity: number }>
  >;
  scrolled: boolean;
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
        className={cn(
          "block px-3 py-2 text-sm font-medium transition-colors duration-300",
          scrolled ? "text-black hover:text-white" : "text-white hover:text-black"
        )}
      >
        {children}
      </a>
    </li>
  );
}

function Cursor({
  position,
  scrolled,
}: {
  position: { left: number; width: number; opacity: number };
  scrolled: boolean;
}) {
  return (
    <motion.li
      animate={position}
      className={cn(
        "absolute z-0 h-9 rounded-full transition-colors duration-300",
        scrolled ? "bg-black" : "bg-white"
      )}
    />
  );
}
