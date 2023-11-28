import { useState } from "react";
import { Sector, sectors } from "../config/sectors";

type StadiumSectorsProps = {
  onSelect?: (sector: Pick<Sector, "id" | "capacity">) => void;
  onHover?: (sector: Pick<Sector, "id" | "capacity">) => void;
  disableRoofSelection?: boolean;
  /**
   * @description Array of sector IDs to be enabled
   */
  enabledSectors?: string[];
  activeSector?: string;
};

export default function StadiumSectors(props: StadiumSectorsProps) {
  const [mouseOver, setMouseOver] = useState<string | null>(null);
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, sector: Omit<Sector, "className">) => {
    e.preventDefault();
    if (props.disableRoofSelection && sector.id.startsWith("roof")) return;
    if (props.enabledSectors && !props.enabledSectors.includes(sector.id)) return;
    props.onSelect?.({
      id: sector.id,
      capacity: sector.capacity,
    });
  }

  const handleHover = (sector: Omit<Sector, "className">) => {
    if (props.disableRoofSelection && sector.id.startsWith("roof")) return;
    if (props.enabledSectors && !props.enabledSectors.includes(sector.id)) return;
    props.onHover?.({
      id: sector.id,
      capacity: sector.capacity,
    });
  };

  const handleMouseOver = (sector: Omit<Sector, "className">) => {
    if (props.disableRoofSelection && sector.id.startsWith("roof")) return;
    if (props.enabledSectors && !props.enabledSectors.includes(sector.id)) return;
    setMouseOver(sector.id);
  }

  return (
    <svg width="2139" height="1850" viewBox="0 0 2139 1750" className="w-[800px] h-auto">
      <text fill="white" fontSize={64} x={380} y={120}>A</text>
      <text fill="white" fontSize={64} x={0} y={880}>B</text>
      <text fill="white" fontSize={64} x={1062} y={1800}>C</text>
      <text fill="white" fontSize={64} x={2090} y={880}>D</text>
      <text fill="white" fontSize={64} x={1700} y={120}>E</text>
      <text fill="white" fontSize={56} x={1700} y={0}>🚅 LRT Station ▶</text>
      <text fill="white" fontSize={96} x={1000} y={900}>{mouseOver}</text>
      {
        sectors.map(({className, ...sectorProps}) => (
          <a
            key={sectorProps.id}
            id={sectorProps.id}
            href=""
            onClick={(e) => handleClick(e, sectorProps)}
            onMouseOver={() => handleHover(sectorProps)}
            onMouseEnter={() => handleMouseOver(sectorProps)}
            onMouseLeave={() => setMouseOver(null)}
          >
            <path
              data-disabled={props.enabledSectors && !props.enabledSectors.includes(sectorProps.id)}
              data-active={props.activeSector === sectorProps.id}
              className="hover:fill-[#444] data-[disabled=true]:fill-[#333] data-[active=true]:fill-[coral]"
              {...sectorProps}
            />
          </a>
        ))
      }
    </svg>
  );
}