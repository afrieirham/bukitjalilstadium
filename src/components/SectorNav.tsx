import { seats } from "@/constant";
import StadiumSectors from "./StadiumSectors";
import { useRouter } from "next/router";

export default function SectorNav() {
  const router = useRouter();
  const enabledSectors = seats.map((seat) => seat.section);
  const handleSelect = (sector: { id: string }) => {
    router.push(`/${sector.id}`);
  };

  return (
    <div className="flex items-center w-full justify-center">
      <StadiumSectors onSelect={handleSelect} disableRoofSelection enabledSectors={enabledSectors} activeSector={router.query.id as string} />
    </div>
  );
}