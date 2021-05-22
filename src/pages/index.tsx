import React from "react";

import { Browser } from "../dicom/browser/Browser";
import { BrowserInfoProvider } from "../dicom/browser/BrowserInfo";

const BrowserPage = (): React.ReactElement => {
  return (
    <BrowserInfoProvider>
      <Browser className="w-screen h-screen overflow-hidden bg-gray-100" />
    </BrowserInfoProvider>
  );
};

export default BrowserPage;
