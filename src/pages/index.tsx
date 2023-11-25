import Link from "next/link";
import { seats } from "./constant";
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
      <div className="flex flex-col justify-center items-center pb-24 mt-16 px-4">
        <h2 className="text-md md:text-xl font-bold">Level 3</h2>
        <div className="flex mt-2">
          {seats
            .filter((seat) => seat.level === 3)
            .map((seat, i) => (
              <div key={seat.section}>
                <Link
                  href={`/${seat.section}`}
                  className="hover:underline mx-2"
                >
                  {seat.section}
                </Link>
                {i === 15 ? "" : "|"}
              </div>
            ))}
        </div>
        <h2 className="text-md md:text-xl font-bold mt-16">Level 2</h2>
        <div className="flex mt-2">
          {seats
            .filter((seat) => seat.level === 2)
            .map((seat, i) => (
              <div key={seat.section}>
                <Link
                  href={`/${seat.section}`}
                  className="hover:underline mx-2"
                >
                  {seat.section}
                </Link>
                {i === 15 ? "" : "|"}
              </div>
            ))}
        </div>
      </div>
      <BuiltBy />
    </main>
  );
}
