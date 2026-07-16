import BuiltBy from "@/components/BuiltBy";
import NavBar from "@/components/NavBar";
import SEOHead from "@/components/SEOHead";
import Link from "next/link";
import posthog from "posthog-js";

const contributors = [
  {
    name: "@violetzero_94",
    seat: "104",
    href: "https://www.tiktok.com/@violetzero_94",
  },
  { name: "Emily Yeo", seat: "104" },
  { name: "Affandy", seat: "105", href: "https://www.tiktok.com/@Affandy" },
  {
    name: "azrulazizul97",
    seat: "105",
    href: "https://www.instagram.com/azrulazizul97/",
  },
  { name: "Nazira-Saidatina diva", seat: "108" },
  {
    name: "jasonlok_318",
    seat: "116",
    href: "https://www.instagram.com/jasonlok_318",
  },
  { name: "sbl.", seat: "118" },
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
  { name: "Amira", seat: "133" },
  { name: "wenting_04", seat: "134" },
  { name: "Anon", seat: "201A-B" },
  { name: "Luna", seat: "203", href: "https://www.tiktok.com/@xlteregx_" },
  { name: "fatinhmzn", seat: "204", href: "https://www.tiktok.com/@fatinhmzn" },
  { name: "Anon", seat: "208" },
  { name: "Anis Z", seat: "210" },
  { name: "Anon", seat: "212A-B" },
  { name: "Daniel", seat: "212A-B" },
  { name: "Qil", seat: "214" },
  { name: "aidasyzna", seat: "220" },
  { name: "Azrye", seat: "227" },
  { name: "wenting_04", seat: "303" },
  { name: "iqq", seat: "306", href: "https://www.tiktok.com/@iqq" },
  { name: "leemei89", seat: "306" },
  { name: "Era R.", seat: "312" },
  { name: "Sarah", seat: "314" },
  {
    name: "ddalgi_kv",
    seat: "318A-B",
    href: "https://x.com/ddalgi_kv",
  },
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
                      onClick={() => posthog.capture("contributor_link_clicked", { contributor_seat: c.seat })}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                  ) : (
                    <span>{c.name}</span>
                  )}
                </td>
                <td>
                  <Link href={c.seat} className="hover:underline">
                    Section {c.seat}
                  </Link>
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
