import SeatPlanPicker from "~/components/widget/seat-plan-picker";

export function meta() {
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
