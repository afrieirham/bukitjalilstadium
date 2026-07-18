import { Link } from "react-router";

import { Button } from "~/components/core/button";
import { SeatPlanPicker } from "~/components/widget/seat-plan-picker";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div>
      <nav className="mx-auto mb-4 flex max-w-7xl items-center justify-between p-4">
        <Logo />
        <Button variant="ghost">Upload Photo</Button>
      </nav>
      <SeatPlanPicker />
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/logo.png" className="size-10" />
    </Link>
  );
}
