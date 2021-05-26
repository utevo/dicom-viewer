import { useToast as useChakraToast } from "@chakra-ui/react";
import { useMemo } from "react";

type ToastManager = Readonly<{
  error: (message: string) => void;
}>;

export const useToast = (): ToastManager => {
  const toast = useChakraToast();
  return useMemo(
    () => ({
      error: (message: string) => toast({ title: message, status: "error", isClosable: true }),
    }),
    [toast]
  );
};
