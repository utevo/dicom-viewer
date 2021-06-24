import { Slide } from "@chakra-ui/react";
import { capitalCase } from "change-case";
import React from "react";
import { RiCloseLine } from "react-icons/ri";

import { DicomObjectMetadata } from "src/dicom/domain/DicomObject";

type Props = {
  dicomObjectMetadata?: DicomObjectMetadata;
  isOpen: boolean;
  onClose: () => void;
};

export const DicomObjectDetails = ({ dicomObjectMetadata, isOpen, onClose }: Props): React.ReactElement => {
  return (
    <Slide className="h-screen z-50" direction="right" in={isOpen} style={{ width: "400px" }}>
      <div className="bg-white rounded-2xl border-2 h-full overflow-auto">
        <button className="absolute right-5 top-5" onClick={onClose}>
          <RiCloseLine className="w-8 h-8" />
        </button>
        <h1 className="text-xl font-semibold my-6 ml-10">Details</h1>

        <div className="mx-3">
          {dicomObjectMetadata != null ? (
            <DicomObjectDetailsTable dicomObjectMetadata={dicomObjectMetadata} />
          ) : (
            <div className="mb-4 text-center font-medium">No Dicom Image selected</div>
          )}
        </div>
      </div>
    </Slide>
  );
};

type DicomObjectDetailsTableProps = {
  dicomObjectMetadata: DicomObjectMetadata;
};

const DicomObjectDetailsTable = ({ dicomObjectMetadata }: DicomObjectDetailsTableProps): React.ReactElement => {
  return (
    <table className="table-fixed">
      <thead>
        <tr>
          <th className="w-1/2">Name</th>
          <th className="w-1/2">Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(dicomObjectMetadata)
          .filter(([_, value]) => value != null)
          .map(([name, value]) => (
            <tr key={name}>
              <td className="border px-4 py-2 text-emerald-600 text-center">{capitalCase(name)}</td>
              <td className="border px-4 py-2 text-emerald-600 text-center">{String(value)}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
