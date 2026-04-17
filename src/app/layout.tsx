import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import LenisProvider from "@/components/LenisProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Krishna Twin Turf Jamnagar | Best Cricket Turf Booking in Jamnagar, Gujarat",
  description:
    "Krishna Twin Turf – Jamnagar's best cricket turf ground. Book your slot online 24/7 with floodlights, bat, ball & stumps. Located at Jamnagar Bypass Road, Gujarat. ₹700/hr day, ₹1200/hr night.",
  keywords: [
    "cricket turf jamnagar",
    "turf booking jamnagar",
    "krishna twin turf",
    "box cricket jamnagar",
    "cricket ground jamnagar",
    "turf near me jamnagar",
    "best turf in jamnagar",
    "jamnagar cricket turf booking",
    "turf jamnagar bypass road",
    "indoor cricket jamnagar",
    "cricket turf booking online jamnagar",
    "turf booking gujarat",
    "night cricket jamnagar",
    "floodlight turf jamnagar",
    "24/7 cricket turf jamnagar",
    "cricket ground near jamnagar bypass",
    "box cricket ground jamnagar gujarat",
    "turf cricket jamnagar price",
    "sports turf jamnagar",
  ],
  authors: [{ name: "Krishna Twin Turf" }],
  creator: "Krishna Twin Turf",
  publisher: "Krishna Twin Turf",
  metadataBase: new URL("https://krishnatwinturf.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Krishna Twin Turf Jamnagar | Best Cricket Turf Booking",
    description:
      "Book your cricket turf slot online at Krishna Twin Turf, Jamnagar. Premium turf, floodlights, 24/7 open. Equipment provided. ₹700/hr day, ₹1200/hr night.",
    url: "https://krishnatwinturf.com",
    siteName: "Krishna Twin Turf",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/image/hero-main.jpg",
        width: 1200,
        height: 630,
        alt: "Krishna Twin Turf - Cricket Ground in Jamnagar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Krishna Twin Turf Jamnagar | Book Cricket Turf Online",
    description:
      "Jamnagar's best cricket turf. Book online, play 24/7 with floodlights. Bat, ball & stumps provided.",
    images: ["/image/hero-main.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("antialiased", inter.variable)}>
      <head>
        {/* Local Business JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              name: "Krishna Twin Turf",
              description:
                "Premium cricket turf ground in Jamnagar with online booking, floodlights, and full cricket equipment. Open 24/7.",
              url: "https://krishnatwinturf.com",
              telephone: ["+919408950000", "+919974888178", "+919601107505", "+919499723659"],
              address: {
                "@type": "PostalAddress",
                streetAddress: "Jamnagar Bypass Rd, inside Krishna Kathiyavadi Hotel, Ajanta Society",
                addressLocality: "Jamnagar",
                addressRegion: "Gujarat",
                postalCode: "361006",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 22.4707,
                longitude: 70.0696,
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday", "Tuesday", "Wednesday", "Thursday",
                  "Friday", "Saturday", "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
              },
              priceRange: "₹700 - ₹1200",
              image: "/image/hero-main.jpg",
              sameAs: [],
              sport: "Cricket",
              amenityFeature: [
                { "@type": "LocationFeatureSpecification", name: "Floodlights", value: true },
                { "@type": "LocationFeatureSpecification", name: "Cricket Equipment", value: true },
                { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
                { "@type": "LocationFeatureSpecification", name: "Drinking Water", value: true },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <LenisProvider>{children}</LenisProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
