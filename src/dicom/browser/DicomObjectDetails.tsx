import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { capitalCase } from "change-case";
import React from "react";

import { DicomObjectMetadata } from "../domain/DicomObject";

type Props = {
  dicomObjectMetadata?: DicomObjectMetadata;
  isOpen: boolean;
  onClose: () => void;
};

export const DicomObjectDetails = ({ dicomObjectMetadata, isOpen, onClose }: Props): React.ReactElement => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {dicomObjectMetadata != null ? (
            <DicomObjectDetailsTable dicomObjectMetadata={dicomObjectMetadata} />
          ) : (
            <div className="mb-4 text-center font-medium">No Dicom Image selected</div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
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
