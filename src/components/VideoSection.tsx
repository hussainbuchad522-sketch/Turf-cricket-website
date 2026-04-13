"use client";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <section id="video" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl space-y-6 px-5 md:space-y-12">
        <RevealOnScroll>
          <div className="mx-auto max-w-xl space-y-3 text-center md:space-y-4">
            <h2 className="text-balance text-3xl font-medium sm:text-4xl lg:text-5xl">
              See Our Turf in Action
            </h2>
            <p className="text-muted-foreground">
              Watch the highlights and get a feel of the ground before you book.
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15}>
          <div
            className="group relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-black shadow-lg aspect-video cursor-pointer"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              poster="/image/hero-bg.jpg"
              onEnded={() => setPlaying(false)}
            >
              <source src="/video/turf.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              }`}
            >
              <div className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md transition-transform duration-300 hover:scale-110 sm:size-20">
                {playing ? (
                  <Pause className="size-5 text-white sm:size-8" />
                ) : (
                  <Play className="size-5 text-white ml-0.5 sm:size-8 sm:ml-1" />
                )}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
