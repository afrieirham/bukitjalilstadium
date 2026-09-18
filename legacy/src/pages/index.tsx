import SeatNav from "@/components/SeatNav";
import BuiltBy from "../components/BuiltBy";
import NavBar from "../components/NavBar";
import SEOHead, { SITE_NAME, SITE_URL } from "@/components/SEOHead";
import SectorNav from "@/components/SectorNav";

const stadiumSchema = {
  "@context": "https://schema.org",
  "@type": "StadiumOrArena",
  name: "Stadium Bukit Jalil",
  alternateName: [
    "TM Stadium Nasional",
    "Stadium Nasional Bukit Jalil",
    "Bukit Jalil National Stadium",
    "National Stadium Bukit Jalil",
  ],
  url: SITE_URL,
  image: `${SITE_URL}/og.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bukit Jalil Sports Complex, Jalan Barat",
    addressLocality: "Kuala Lumpur",
    postalCode: "57000",
    addressCountry: "MY",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 3.0546304,
    longitude: 101.6912767,
  },
  sameAs: ["https://en.wikipedia.org/wiki/Bukit_Jalil_National_Stadium"],
};

export default function Home() {
  return (
    <main>
      <SEOHead
        title={`Stadium Bukit Jalil (TM Stadium Nasional) Seating View | ${SITE_NAME}`}
        description="Field view from seats in each section inside Stadium Bukit Jalil (TM Stadium Nasional) — see what the pitch and stage look like from your seat before you buy."
        path="/"
        ogPath="/og.png"
        structuredData={stadiumSchema}
      />
      <NavBar />
      <div className="flex flex-col items-center space-y-8 px-4">
        <h1 className="mt-8 text-lg font-bold text-center md:text-2xl">
          Stadium Nasional Bukit Jalil Seating View Plan
        </h1>
        <SectorNav />
      </div>
      <SeatNav />
      <BuiltBy />
    </main>
  );
}
