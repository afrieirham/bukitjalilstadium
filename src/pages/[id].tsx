import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetServerSidePropsType,
} from "next";
import Link from "next/link";

import { PhotoProvider, PhotoView } from "react-photo-view";

import { ChevronLeft, ChevronRight } from "lucide-react";

import SeatNav from "@/components/SeatNav";
import SectorNav from "@/components/SectorNav";
import useRedirectPopunder from "@/hooks/useRedirectPopunder";

import BuiltBy from "../components/BuiltBy";
import NavBar from "../components/NavBar";
import SEOHead, { SITE_NAME, SITE_URL } from "@/components/SEOHead";
import { seats } from "../constant";

const STORAGE_URL = "https://storage.bukitjalilstadium.com";

export const getStaticProps: GetStaticProps<{
  seat: (typeof seats)[number];
}> = async (context) => {
  const id = context.params?.id;
  const seat = seats.find((seat) => seat.section.replaceAll("/", "-") === id)!;
  return {
    props: {
      seat,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = seats.map((seat) => ({
    params: { id: seat.section.replaceAll("/", "-") },
  }));

  return {
    paths,
    fallback: false,
  };
};

function SeatPage({
  seat,
}: InferGetServerSidePropsType<typeof getStaticProps>) {
  const { onOpenPopunder } = useRedirectPopunder();
  const title = `Section ${seat.section} (Level ${seat.level})`;
  const slug = seat.section.replaceAll("/", "-");
  const description = `View of the field from section ${seat.section} (Level ${seat.level}) at Stadium Bukit Jalil (TM Stadium Nasional), Kuala Lumpur. See what the pitch and stage look like from this seat before you buy.`;
  const photo = seat.photosUrl.length > 1 ? seat.photosUrl[1] : seat.photosUrl[0];
  const ogPath = photo ? `${STORAGE_URL}/seats/${photo}` : "/og.png";

  return (
    <PhotoProvider>
      <SEOHead
        title={`${title}, Stadium Bukit Jalil (TM Stadium Nasional)`}
        description={description}
        path={`/${slug}`}
        ogPath={ogPath}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: `${SITE_NAME} — Stadium Bukit Jalil seating view`,
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: title,
              item: `${SITE_URL}/${slug}`,
            },
          ],
        }}
      />
      <div className="pb-24">
        <NavBar />

        <div className="hidden md:flex justify-between max-w-screen-lg mx-auto mt-8 px-4">
          <Link
            href={`/${seat.left.replaceAll("/", "-")}`}
            onClick={() => onOpenPopunder()}
            className="flex justify-center items-center rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {seat.left}
          </Link>
          <h1 className="text-lg font-bold text-center md:text-2xl">{title}</h1>
          <Link
            href={`/${seat.right.replaceAll("/", "-")}`}
            onClick={() => onOpenPopunder()}
            className="flex justify-center items-center rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >
            {seat.right} <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="block md:hidden mt-4 space-y-8">
          <div className="flex justify-between gap-4 max-w-screen-lg mx-auto px-4">
            <Link
              href={`/${seat.left.replaceAll("/", "-")}`}
              onClick={() => onOpenPopunder()}
              className="flex justify-center items-center rounded-md bg-white/10 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/20 w-full"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> {seat.left}
            </Link>
            <Link
              href={`/${seat.right.replaceAll("/", "-")}`}
              onClick={() => onOpenPopunder()}
              className="flex justify-center items-center rounded-md bg-white/10 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/20 w-full"
            >
              {seat.right} <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <h1 className="text-lg font-bold text-center md:text-2xl">{title}</h1>
        </div>

        <div className="flex flex-col items-center max-w-screen-lg mx-auto mt-4 px-4">
          <p className="text-center">{description}</p>
        </div>
        <div className="flex flex-col md:flex-row space-x-0 space-y-4 md:space-y-0 md:space-x-4 justify-center mt-8 px-4 items-center w-full mx-auto max-w-screen-xl">
          {seat.photosUrl.length > 0 ? (
            <>
              <div className="flex flex-col md:flex-row h-full w-full justify-center gap-4">
                {seat.photosUrl.map((item, idx) => (
                  <div
                    key={item}
                    className="relative h-[240px] w-full md:h-[480px] md:w-[600px]"
                  >
                    <PhotoView
                      key={item}
                      src={`${STORAGE_URL}/seats/${item}`}
                    >
                      {/** biome-ignore lint/performance/noImgElement: <intentional> */}
                      <img
                        alt={`${idx === 0 ? "1x" : "0.5x"} ${description}`}
                        src={`${STORAGE_URL}/seats/${item}`}
                        className="w-full object-cover h-full"
                      />
                    </PhotoView>
                  </div>
                ))}
              </div>
              {seat.photosUrl.length === 1 && (
                <div className="flex items-center justify-center h-[240px] md:h-[480px] w-full bg-white text-black">
                  <div className="flex flex-col p-4">
                    <p className="text-lg">Almost there!</p>
                    <p className="text-sm text-gray-500 mt-2">
                      We need one more photo for this section. Share your photos
                      to complete this website!
                    </p>
                    <div className="mt-4">
                      <Link
                        href={`/contribute?seat=${seat.section.replaceAll(
                          "-",
                          "/",
                        )}`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-black text-white shadow-xs hover:bg-primary/90 h-9 px-4 py-2"
                      >
                        Share my photo
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-[480px] w-full bg-white text-black">
              <div className="flex flex-col p-4">
                <p className="text-lg">
                  Sorry, no photo available for this section.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Got a seat view to share? Help us out! Share your photos or
                  videos to complete this website!
                </p>
                <div className="mt-4">
                  <Link
                    href={`/contribute?seat=${seat.section.replaceAll(
                      "-",
                      "/",
                    )}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-black text-white shadow-xs hover:bg-primary/90 h-9 px-4 py-2"
                  >
                    Share my photo
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        {seat.photosUrl.length === 2 && (
          <div className="items-center justify-center flex mt-4">
            <Link
              href={`/contribute?seat=${seat.section.replaceAll("-", "/")}`}
              target="_blank"
              className="text-xs hover:underline text-gray-500"
            >
              Got a better photo? Share with us!
            </Link>
          </div>
        )}

        <div className="py-10">
          <SeatNav current={seat.section} />
        </div>
        <div className="px-4">
          <SectorNav />
        </div>
        <BuiltBy />
      </div>
    </PhotoProvider>
  );
}

export default SeatPage;
