import React, { useEffect, useState } from "react";
import { RiChromeLine } from "react-icons/ri";

import { Browser, checkIfIsBrowserSupported } from "src/dicom/browser/Browser";

const BrowserPage = (): React.ReactElement => {
  const [isBrowserSupported, setIsBrowserSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsBrowserSupported(checkIfIsBrowserSupported());
  }, []);

  return isBrowserSupported ? (
    <Browser className="w-screen h-screen overflow-hidden bg-gray-100" />
  ) : (
    <NotSupportedBrowserSplashScreen />
  );
};

const NotSupportedBrowserSplashScreen = (): React.ReactElement => (
  <div className="w-screen h-screen overflow-hidden bg-gray-100 flex flex-col justify-center items-center">
    <p className="font-extralight text-6xl mb-6">Sorry, your browser is not supported :(</p>
    <p className="font-light">
      Try to use the latest version of{" "}
      <a className="underline" href="https://www.google.com/chrome/">
        Chrome Browser
      </a>
      <RiChromeLine className="inline w-10 h-10 ml-1" />
    </p>
  </div>
);

export default BrowserPage;
