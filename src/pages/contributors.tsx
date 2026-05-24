import BuiltBy from "@/components/BuiltBy";
import NavBar from "@/components/NavBar";
import SEOHead from "@/components/SEOHead";
import Link from "next/link";

const contributors = [
  { name: "Affandy", seat: "105", href: "https://www.tiktok.com/@Affandy" },
  {
    name: "azrulazizul97",
    seat: "105",
    href: "https://www.instagram.com/azrulazizul97/",
  },
  { name: "Emily Yeo", seat: "104" },
  { name: "Nazira-Saidatina diva", seat: "108" },
  {
    name: "ladyroseisme ",
    seat: "123",
    href: "https://www.tiktok.com/@ladyroseisme",
  },
  { name: "Baimzac", seat: "111" },
  { name: "Anon", seat: "115" },
  { name: "Blank", seat: "117" },
  { name: "LN", seat: "124" },
  { name: "Haziq", seat: "129" },
  { name: "Luna", seat: "203", href: "https://www.tiktok.com/@xlteregx_" },
  { name: "fatinhmzn", seat: "204", href: "https://www.tiktok.com/@fatinhmzn" },
  { name: "Anis Z", seat: "210" },
  { name: "Daniel", seat: "212A-B" },
  { name: "iqq", seat: "306", href: "https://www.tiktok.com/@iqq" },
  { name: "Era R.", seat: "312" },
  { name: "Sarah", seat: "314" },
  { name: "Ethan", seat: "333" },
];
function Contributors() {
  return (
    <main>
      <SEOHead
        title="Contributors | BukitJalilStadium.com"
        description="List of contributors for BukitJalilStadium.com"
        path="/"
        ogPath="/og.png"
      />
      <NavBar />
      <div className="max-w-screen-xl mx-auto">
        <h1 className="mt-8 text-lg font-bold md:text-2xl">Contributors</h1>
        <table className="table-auto w-full max-w-sm mt-4">
          <tbody>
            {contributors.map((c) => (
              <tr key={c.name}>
                <td>
                  {c.href ? (
                    <Link
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                  ) : (
                    <span>{c.name}</span>
                  )}
                </td>
                <td>
                  <Link href={c.seat}>Section {c.seat}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BuiltBy />
    </main>
  );
}

export default Contributors;
