import Link from "next/link";

function NavBar() {
  return (
    <>
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

      <div className="flex items-center justify-center gap-2 mt-8">
        <Link
          href="https://tally.so/r/obQDqP"
          className="flex items-center gap-2 bg-white px-2 hover:bg-white/90 py-1 rounded-md"
        >
          <div className="relative h-2 w-2">
            <div className="absolute top-0 bottom-0 h-2 w-2 rounded-full bg-emerald-500" />
            <div className="absolute top-0 bottom-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-sm text-black">
            Looking for homestay? Let us help
          </span>
        </Link>
      </div>
    </>
  );
}

export default NavBar;
