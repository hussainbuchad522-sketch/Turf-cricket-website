import Image from "next/image";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function Gallery() {
  return (
    <section id="gallery" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl space-y-6 px-5 md:space-y-12">
        <RevealOnScroll>
          <div className="mx-auto max-w-xl space-y-3 text-center md:space-y-4">
            <h2 className="text-balance text-3xl font-medium sm:text-4xl lg:text-5xl">
              Our Gallery
            </h2>
            <p className="text-muted-foreground">
              A glimpse of the action, the ground, and the experience.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-1.jpg"
                alt="Turf gallery 1"
                width={600}
                height={400}
              />
            </div>
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-2.jpg"
                alt="Turf gallery 2"
                width={600}
                height={400}
              />
            </div>
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-3.jpeg"
                alt="Turf gallery 3"
                width={600}
                height={400}
              />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-main.jpg"
                alt="Turf gallery 4"
                width={600}
                height={400}
              />
            </div>
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-bg.jpg"
                alt="Turf gallery 5"
                width={600}
                height={400}
              />
            </div>
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-1.jpg"
                alt="Turf gallery 6"
                width={600}
                height={400}
              />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-2.jpg"
                alt="Turf gallery 7"
                width={600}
                height={400}
              />
            </div>
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-3.jpeg"
                alt="Turf gallery 8"
                width={600}
                height={400}
              />
            </div>
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-main.jpg"
                alt="Turf gallery 9"
                width={600}
                height={400}
              />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-bg.jpg"
                alt="Turf gallery 10"
                width={600}
                height={400}
              />
            </div>
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-1.jpg"
                alt="Turf gallery 11"
                width={600}
                height={400}
              />
            </div>
            <div className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56">
              <Image
                className="h-full w-full object-cover"
                src="/image/hero-2.jpg"
                alt="Turf gallery 12"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
