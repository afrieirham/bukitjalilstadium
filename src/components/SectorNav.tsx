import { useRouter as useNavigation } from "next/navigation";
import { useRouter } from "next/router";
import { toast } from "sonner";

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
    navigation.push(`/${sector.id.replaceAll("/", "-")}`, { scroll: false });
    const targetSeat = seats.find((s) => s.section === sector.id);
    if (targetSeat && targetSeat.photosUrl && targetSeat.photosUrl.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.warning(`No photo available for Section ${sector.id}`);
    }
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

