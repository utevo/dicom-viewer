import { useToast } from "@chakra-ui/react";
import { useMemo } from "react";

type Notify = {
  error: (message: string) => void;
};

export const useNotify = (): Notify => {
  const toast = useToast();
  return useMemo(
    () => ({
      error: (message: string) => toast({ title: message, status: "error", isClosable: true }),
    }),
    [toast]
  );
};
