import "tailwindcss/tailwind.css";
import { AppProps } from "next/dist/next-server/lib/router/router";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import React from "react";

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <ChakraProvider>
      <CSSReset />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
