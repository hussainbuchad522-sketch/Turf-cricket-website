"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full flex items-center overflow-hidden">
      {/* Background Image with zoom */}
      <motion.div
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image/img-2.jpg')" }}
      />

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-20 text-left px-5 sm:px-10 md:px-16 lg:px-28 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl font-semibold text-white leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
        >
          Best <span className="font-medium">Cricket Turf</span>
          <br />
          in Jamnagar
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 max-w-xl text-sm text-white/80 leading-relaxed sm:text-base md:text-lg"
        >
          Krishna Twin Turf — Jamnagar&apos;s premium cricket ground with
          floodlights, full equipment, and 24/7 online booking. Just show up and play.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 flex flex-row items-start gap-3 sm:gap-4"
        >
          <Link
            href="#booking"
            className="font-inter inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:scale-105 sm:px-6 sm:text-base"
          >
            Book Now
          </Link>
          <Link
            href="#features"
            className="inline-block font-inter rounded-full border-2 border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10 hover:scale-105 sm:px-6 sm:text-base"
          >
            See Features
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
