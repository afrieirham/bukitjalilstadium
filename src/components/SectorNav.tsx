import { useRouter as useNavigation } from "next/navigation";
import { useRouter } from "next/router";

import { seats } from "@/constant";
import useRedirectPopunder from "@/hooks/useRedirectPopunder";
import StadiumSectors from "./StadiumSectors";

export default function SectorNav() {
  const router = useRouter();
  const navigation = useNavigation();
  const { onOpenPopunder } = useRedirectPopunder();
  const enabledSectors = seats.map((seat) => seat.section);
  const handleSelect = (sector: { id: string }) => {
    onOpenPopunder();
    navigation.push(`/${sector.id}`, { scroll: false });
  };

  return (
    <div className="flex items-center w-full justify-center">
      <StadiumSectors
        onSelect={handleSelect}
        disableRoofSelection
        enabledSectors={enabledSectors}
        activeSector={router.query.id as string}
      />
    </div>
  );
}
