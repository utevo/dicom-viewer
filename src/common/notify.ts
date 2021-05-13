import { useToast } from "@chakra-ui/react";

type Notify = {
  error: (message: string) => void;
};

export const useNotify = (): Notify => {
  const toast = useToast();
  return {
    error: (message: string) => toast({ title: message, status: "error", isClosable: true }),
  };
};
