import Link from "next/link";

function NavBar() {
  return (
    <nav className="flex justify-center sm:justify-between bg-[#111111] border-b-[#282828] border-b-2 p-6">
      <Link href="/">BukitJalilStadium.com</Link>
      <p className="hidden sm:block">Stadium Bukit Jalil Seating View</p>
    </nav>
  );
}

export default NavBar;
