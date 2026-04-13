import Image from "next/image";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function AboutSection() {
  return (
    <section id="about" className="py-12 md:py-10">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
          {/* Left - Text */}
          <RevealOnScroll direction="left">
            <div className="space-y-6">
              <h2 className="text-3xl text-black font-medium leading-tight sm:text-4xl lg:text-5xl">
                About Us
              </h2>
              <p className="text-black leading-relaxed">
                We started with a simple mission — to give every cricket lover a
                world-class playing experience without having to travel far. Our
                turf is built with premium artificial grass, professional-grade
                floodlights, and all the equipment you need.
              </p>
              <p className="text-black leading-relaxed">
                Whether you&apos;re playing a friendly weekend match or organizing
                a corporate tournament, our ground is designed to deliver the best
                experience. With 24/7 availability, online booking, and instant
                confirmation — we make it effortless for you to just show up and
                play.
              </p>
            </div>
          </RevealOnScroll>

          {/* Right - Image */}
          <RevealOnScroll direction="right">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/image/hero-main.jpg"
                alt="About Turf Cricket"
                width={800}
                height={400}
                className="h-[250px] w-full object-cover sm:h-[350px] md:h-[400px]"
              />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
