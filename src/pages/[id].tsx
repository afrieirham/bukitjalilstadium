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
  return (
    <PhotoProvider>
      <div>
        <NavBar />
        <div className="flex justify-between max-w-screen-lg mx-auto mt-8">
          <Link
            href={`/${seat.left}`}
            className="flex justify-center items-center rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {seat.left}
          </Link>
          <h1 className="text-lg font-bold text-center md:text-2xl">
            Section {seat.section} (Level {seat.level})
          </h1>
          <Link
            href={`/${seat.right}`}
            className="flex justify-center items-center rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          >
            {seat.right} <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-col items-center max-w-screen-lg mx-auto mt-8">
          <p>
            A view of Bukit Jalil field from section {seat.section} of Stadium
            Bukit Jalil.
          </p>
        </div>
        <div className="flex space-x-4 justify-center mt-8">
          {seat.photosUrl.map((item) => (
            <PhotoView key={item} src={`/seats/${item}`}>
              <img
                src={`/seats/${item}`}
                className="w-[400px] h-[400px] object-cover"
              />
            </PhotoView>
          ))}
        </div>
        <SeatNav current={seat.section} />
        <BuiltBy />
      </div>
    </PhotoProvider>
  );
}

export default SeatPage;
