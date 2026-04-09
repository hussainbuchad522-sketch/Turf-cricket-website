import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image/hero-3.jpeg')" }}
      />

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-20 text-left px-6 sm:px-12 md:px-20 lg:px-28 max-w-4xl">
        <h1 className="text-4xl font-semibold text-white leading-tight tracking-tight md:text-5xl lg:text-6xl">
          Play on the Best
          <br />
          <span className="font-medium">Cricket Turf</span> in Town
        </h1>

        <p className="mt-1 max-w-xl text-base text-gray-300 leading-normal md:text-lg">
          Premium quality turf, floodlights, and top-notch facilities. Book your
          slot in seconds and get instant confirmation.
        </p>

        {/* Buttons */}
        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row">
          <Link
            href="#booking"
            className="font-inter inline-block rounded-full bg-white px-6 py-2.5 text-base font-semibold text-black transition-all duration-300 hover:bg-white/90 hover:shadow-lg sm:w-auto"
          >
            Book Now
          </Link>
          <Link
            href="#features"
            className="inline-block rounded-full border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10 sm:w-auto"
          >
            See Features
          </Link>
        </div>
      </div>
    </section>
  );
}
