import { seats } from "@/constant";
import Link from "next/link";

function SeatNav({ current }: { current?: string }) {
  return (
    <div className="flex flex-col justify-center items-center py-16 px-4 dark:bg-[#111111]">
      <h2 className="text-md md:text-xl font-bold">Level 3</h2>
      <div className="flex flex-wrap flex-row mt-2 justify-center">
        {seats
          .filter((seat) => seat.level === 3)
          .map((seat, i) => (
            <div key={seat.section}>
              <Link
                scroll={false}
                href={`/${seat.section}`}
                className={`hover:underline mx-2 ${
                  current === seat.section ? "text-zinc-500" : ""
                }`}
              >
                {seat.section}
              </Link>
              {i === 15 ? "" : "|"}
            </div>
          ))}
      </div>
      <h2 className="text-md md:text-xl font-bold mt-16">Level 2</h2>
      <div className="flex flex-wrap flex-row mt-2 justify-center">
        {seats
          .filter((seat) => seat.level === 2)
          .map((seat, i) => (
            <div key={seat.section}>
              <Link
                scroll={false}
                href={`/${seat.section}`}
                className={`hover:underline mx-2 ${
                  current === seat.section ? "text-zinc-500" : ""
                }`}
              >
                {seat.section}
              </Link>
              {i === 15 ? "" : "|"}
            </div>
          ))}
      </div>
    </div>
  );
}

export default SeatNav;
