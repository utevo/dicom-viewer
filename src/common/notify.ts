import { toast, useToast } from "@chakra-ui/react";

interface Notify {
  error: (message: string) => void;
}

export const useNotify = (): Notify => {
  const toast = useToast();
  return {
    error: (message: string) => toast({ title: message, status: "error", isClosable: true }),
  };
};
