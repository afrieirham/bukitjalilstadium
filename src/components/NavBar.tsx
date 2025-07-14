import Link from "next/link";
import Donation from "./Donation";

function NavBar() {
  return (
    <>
      <Donation />
      <nav className="flex justify-center sm:justify-between bg-[#111111] border-b-[#282828] border-b-2 p-6">
        <Link href="/">BukitJalilStadium.com</Link>
        <div className="flex items-center gap-2">
          <a
            href="https://go.afrieirham.com/contribute"
            target="_blank"
            className="hover:underline"
          >
            Contribute
          </a>
          <p>/</p>
          <p className="hidden sm:block">Stadium Bukit Jalil Seating View</p>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
