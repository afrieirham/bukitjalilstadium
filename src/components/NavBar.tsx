import Link from "next/link";
import { ModeToggle } from "./ThemeToggler";
import { SearchSeatCommand } from "./SearchSeatCommand";

function NavBar() {
  return (
    <nav className="grid grid-cols-3 dark:bg-[#111111] dark:border-b-[#282828] border-b-2 p-6 dark:text-white">
      <div className="flex flex-row gap-2">
        <ModeToggle />
        <Link href="/" className="pt-2">BukitJalilStadium.com</Link>
      </div>
      <div className="flex justify-center items-center">
        <SearchSeatCommand />
      </div>
      <div>
        <p className="hidden sm:block text-end">Stadium Bukit Jalil Seating View</p>
      </div>

    </nav>
  );
}

export default NavBar;
