import Link from "next/link";

import { seats } from "@/constant";
import useRedirectPopunder from "@/hooks/useRedirectPopunder";

function SeatNav({ current }: { current?: string }) {
  const { onOpenPopunder } = useRedirectPopunder();
  return (
    <div className="flex flex-col justify-center items-center my-16 px-4 max-w-screen-md mx-auto">
      <h2 className="text-md md:text-xl font-bold">Level 3</h2>
      <div className="flex flex-wrap flex-row mt-2 justify-center">
        {seats
          .filter((seat) => seat.level === 3)
          .map((seat, i) => (
            <div key={seat.section} className="text-zinc-500">
              <Link
                scroll={false}
                href={`/${seat.section.replaceAll("/", "-")}`}
                onClick={() => onOpenPopunder()}
                className={`hover:underline mx-2 ${
                  current === seat.section ? "text-white" : ""
                }`}
              >
                {seat.section}
              </Link>
              {i === 33 ? "" : "|"}
            </div>
          ))}
      </div>
      <h2 className="text-md md:text-xl font-bold mt-16">Level 2</h2>
      <div className="flex flex-wrap flex-row mt-2 justify-center">
        {seats
          .filter((seat) => seat.level === 2)
          .map((seat, i) => (
            <div key={seat.section} className="text-zinc-500">
              <Link
                scroll={false}
                href={`/${seat.section.replaceAll("/", "-")}`}
                onClick={() => onOpenPopunder()}
                className={`hover:underline mx-2 ${
                  current === seat.section ? "text-white" : ""
                }`}
              >
                {seat.section}
              </Link>
              {i === 33 ? "" : "|"}
            </div>
          ))}
      </div>
      <h2 className="text-md md:text-xl font-bold mt-16">Level 1</h2>
      <div className="flex flex-wrap flex-row mt-2 justify-center">
        {seats
          .filter((seat) => seat.level === 1)
          .map((seat, i) => (
            <div key={seat.section} className="text-zinc-500">
              <Link
                scroll={false}
                href={`/${seat.section.replaceAll("/", "-")}`}
                onClick={() => onOpenPopunder()}
                className={`hover:underline mx-2 ${
                  current === seat.section ? "text-white" : ""
                }`}
              >
                {seat.section}
              </Link>
              {i === 33 ? "" : "|"}
            </div>
          ))}
      </div>
    </div>
  );
}

export default SeatNav;
