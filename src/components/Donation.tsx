import posthog from "posthog-js";

export default function Donation() {
  return (
    <div className="flex items-center justify-center py-2.5 sm:px-3.5 bg-white text-black text-xs">
      <a
        target="_blank"
        href="https://donate.stripe.com/00g3dd6MA8yM0j6fZ2"
        onClick={() => posthog.capture("donation_clicked")}
      >
        Enjoy using the website? Buy me a coffee ☕️
      </a>
    </div>
  );
}
