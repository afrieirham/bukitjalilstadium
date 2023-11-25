import SeatNav from "@/components/SeatNav";
import BuiltBy from "../components/BuiltBy";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <main>
      <NavBar />
      <div className="flex flex-col items-center space-y-8 px-4">
        <h1 className="mt-8 text-lg font-bold text-center md:text-2xl">
          Stadium Nasional Bukit Jalil Seating View Plan
        </h1>
        <img src="/map.png" className="w-full max-w-screen-lg h-auto border" />
      </div>
      <SeatNav />
      <BuiltBy />
    </main>
  );
}
