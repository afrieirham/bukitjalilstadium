import SeatPlanPicker from "~/components/widget/seat-plan-picker";
import type { Route } from "./+types/home";
import { Button } from "~/components/core/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="py-8">
      <SeatPlanPicker />
    </div>
  );
}
