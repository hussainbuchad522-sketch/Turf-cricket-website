import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { Features } from "@/components/features-4";
import AboutSection from "@/components/AboutSection";
import VideoSection from "@/components/VideoSection";
import Gallery from "@/components/Gallery";
import BookingSection from "@/components/BookingSection";
import { Footer7 } from "@/components/footer-7";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <Features />
      <AboutSection />
      <VideoSection />
      <Gallery />
      <BookingSection />
      <Footer7
        logo={{
          url: "/",
          src: "/image/logo.png",
          alt: "Turf Cricket",
          title: "Krishna Turf Twin",
        }}
        description="Premium cricket turf with online booking, floodlights, and top-notch facilities. Play your best game with us."
        sections={[
          {
            title: "Quick Links",
            links: [
              { name: "Home", href: "#" },
              { name: "Features", href: "#features" },
              { name: "Gallery", href: "#gallery" },
              { name: "Book Now", href: "#booking" },
            ],
          },
          {
            title: "Support",
            links: [
              { name: "Privacy Policy", href: "#" },
            ],
          },
        ]}
        socialLinks={[
          {
            icon: <FaInstagram className="size-5" />,
            href: "#",
            label: "Instagram",
          },
          {
            icon: <FaFacebook className="size-5" />,
            href: "#",
            label: "Facebook",
          },
          {
            icon: <FaTwitter className="size-5" />,
            href: "#",
            label: "Twitter",
          },
        ]}
        copyright="© 2026 Turf Cricket. All rights reserved."
        legalLinks={[
          { name: "Privacy Policy", href: "#" },
        ]}
      />
    </main>
  );
}
