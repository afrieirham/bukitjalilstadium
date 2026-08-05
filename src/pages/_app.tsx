import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-photo-view/dist/react-photo-view.css";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster theme="dark" position="top-center" />
    </>
  );
}


