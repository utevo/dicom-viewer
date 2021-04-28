import "tailwindcss/tailwind.css";
import { AppProps } from "next/dist/next-server/lib/router/router";
import { ThemeProvider, theme } from "@chakra-ui/react";

function MyApp({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
