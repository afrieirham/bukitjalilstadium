import Link from "next/link";

function NavBar() {
  return (
    <nav className="flex justify-between bg-[#111111] border-b-[#282828] border-b-2 p-6">
      <Link href="/" className="flex items-center gap-2">
        {/** biome-ignore lint/performance/noImgElement: <intended> */}
        <img alt="logo" src="/logo.png" className="h-12 w-12" />
        <span className="hidden md:block">
          Stadium Bukit Jalil Seating View
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/contribute" className="hover:underline">
          Contribute
        </Link>
        <p>/</p>
        <Link href="/contributors" className="hover:underline">
          Contributors
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
