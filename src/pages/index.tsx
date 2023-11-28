import SeatNav from "@/components/SeatNav";
import BuiltBy from "../components/BuiltBy";
import NavBar from "../components/NavBar";
import SEOHead from "@/components/SEOHead";
import SectorNav from "@/components/SectorNav";

export default function Home() {
  return (
    <main>
      <SEOHead
        title="Stadium Bukit Jalil Seating View – BukitJalilStadium.com"
        description="Field view from seats in each sections inside of the Stadium Nasional Bukit Jalil"
        path="/"
        ogPath="/og.png"
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
