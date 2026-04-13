import { Clock, Ruler, Swords } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";

export function Features() {
  return (
    <section id="features" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-5">
        <RevealOnScroll>
          <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-6">
            <h2 className="text-balance text-3xl font-medium sm:text-4xl lg:text-5xl">
              What We Offer
            </h2>
            <p>
              Everything you need for a great game — premium turf, top equipment,
              and round-the-clock availability.
            </p>
          </div>
        </RevealOnScroll>

        <div className="relative mx-auto mt-8 grid max-w-6xl gap-8 px-2 md:mt-12 md:grid-cols-3 md:gap-10">
          <RevealOnScroll delay={0.1}>
            <div className="space-y-3 text-center">
              <Clock className="size-7 mx-auto" />
              <h3 className="text-lg font-medium">24/7 Open</h3>
              <p className="text-sm">
                Play anytime you want — day or night. Our turf is open 24 hours, 7
                days a week with floodlights for night sessions.
              </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <div className="space-y-3 text-center">
              <Ruler className="size-7 mx-auto" />
              <h3 className="text-lg font-medium">Turf Size 105 x 80 x 31</h3>
              <p className="text-sm">
                Spacious professional-grade turf with dimensions of 105 x 80 x 31
                ft — perfect for a full cricket match experience.
              </p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.3}>
            <div className="space-y-3 text-center">
              <Swords className="size-7 mx-auto" />
              <h3 className="text-lg font-medium">Bat, Ball, Stumps & More</h3>
              <p className="text-sm">
                We provide bat, ball, stumps, energy drinks, and water bottles —
                just show up and play, no gear needed.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
