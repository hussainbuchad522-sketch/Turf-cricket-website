import Image from "next/image";
import RevealOnScroll from "@/components/RevealOnScroll";

const galleryImages = [
  "/image/img-1.jpg",
  "/image/img-2.jpg",
  "/image/img-3.jpg",
  "/image/img-4.jpg",
  "/image/img-5.jpg",
  "/image/img-6.jpg",
  "/image/img-7.jpg",
  "/image/img-8.jpg",
  "/image/img-9.jpg",
  "/image/img.jpg",
  "/image/img-1.jpg",
  "/image/img-2.jpg",
];

export default function Gallery() {
  const columns = [
    galleryImages.slice(0, 3),
    galleryImages.slice(3, 6),
    galleryImages.slice(6, 9),
    galleryImages.slice(9, 12),
  ];

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
          {columns.map((col, ci) => (
            <div key={ci} className="grid gap-4">
              {col.map((src, ri) => (
                <div
                  key={`${ci}-${ri}`}
                  className="overflow-hidden rounded-lg h-36 sm:h-48 md:h-56"
                >
                  <Image
                    className="h-full w-full object-cover"
                    src={src}
                    alt={`Turf gallery ${ci * 3 + ri + 1}`}
                    width={600}
                    height={400}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
