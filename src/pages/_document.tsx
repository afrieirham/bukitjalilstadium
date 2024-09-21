import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          src="https://beamanalytics.b-cdn.net/beam.min.js"
          data-token={process.env.NEXT_PUBLIC_BEAM_ANALYTICS_DATA_TOKEN}
          async
        />
        <script
          defer
          src="https://analytics.afrieirham.com/script.js"
          data-website-id="ccdf97db-6c20-4e02-8ab5-4cb945f6a4bb"
        />
        <meta name="google-adsense-account" content="ca-pub-5654598090665312" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5654598090665312"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
