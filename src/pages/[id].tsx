import SeatNav from "@/components/SeatNav";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetServerSidePropsType,
} from "next";
import Link from "next/link";
import { PhotoProvider, PhotoView } from "react-photo-view";
import BuiltBy from "../components/BuiltBy";
import NavBar from "../components/NavBar";
import { seats } from "../constant";
import Image from "next/image";
import SEOHead from "@/components/SEOHead";
import SectorNav from "@/components/SectorNav";

export const getStaticProps: GetStaticProps<{
  seat: (typeof seats)[number];
}> = async (context) => {
  const id = context.params?.id;
  const seat = seats.find((seat) => seat.section === id)!;
  return {
    props: {
      seat,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = seats.map((seat) => ({ params: { id: seat.section } }));

  return {
    paths,
    fallback: false,
  };
};

function SeatPage({
  seat,
}: InferGetServerSidePropsType<typeof getStaticProps>) {
  const title = `Section ${seat.section} (Level ${seat.level})`;
  const description = ` A view of Bukit Jalil field from section ${seat.section} of Stadium Bukit Jalil.`;

  return (
    <PhotoProvider>
      <SEOHead
        title={title + ", Stadium Bukit Jalil – BukitJalilStadium.com"}
        description={description}
        path={`/${seat.section}`}
        ogPath={`/seats/${seat.photosUrl[1]}`}
      />
      <div className="pb-24">
        <NavBar />
        <div className="flex justify-between max-w-screen-lg mx-auto mt-8 px-4">
          <Link
            href={`/${seat.left}`}
            className="flex justify-center items-center rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {seat.left}
          </Link>
          <h1 className="text-lg font-bold text-center md:text-2xl">{title}</h1>
          <Link
            href={`/${seat.right}`}
            className="flex justify-center items-center rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >
            {seat.right} <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-col items-center max-w-screen-lg mx-auto mt-8 px-4">
          <p className="text-center">{description}</p>
        </div>
        <div className="flex flex-col md:flex-row space-x-0 space-y-4 md:space-y-0 md:space-x-4 justify-center mt-8 px-4 items-center w-full mx-auto max-w-screen-xl">
          {seat.photosUrl.map((item) => (
            <div key={item} className="relative h-[280px] md:h-[400px] w-full">
              <PhotoView key={item} src={`/seats/${item}`}>
                <img
                  // fill
                  alt=""
                  src={`/seats/${item}`}
                  className="w-full h-auto object-cover"
                />
              </PhotoView>
            </div>
          ))}
        </div>
        <SeatNav current={seat.section} />
        <div className="px-4">
          <SectorNav />
        </div>
        <BuiltBy />
      </div>
    </PhotoProvider>
  );
}

export default SeatPage;
