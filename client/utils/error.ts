import { AxiosError } from "axios";

interface ErrorResponseData {
  message?: string;
  field?: string;
}

export const getErrorMessage = (err: unknown): string => {
  if (isAxiosError(err)) {
    return err.response?.data?.message || "Something went wrong";
  }

  if (err instanceof Error) return err.message;

  return "Something went wrong";
};

export const parseFieldError = (
  err: unknown
): { field: string; message: string } => {
  if (isAxiosError(err)) {
    const data = err.response?.data as ErrorResponseData | undefined;
    return {
      field: data?.field || "form",
      message: data?.message || "Invalid request",
    };
  }

  return { field: "form", message: "Unknown error" };
};

// Type guard: ensures TS knows it's an AxiosError
const isAxiosError = (err: unknown): err is AxiosError<ErrorResponseData> => {
  return typeof err === "object" && err !== null && "isAxiosError" in err;
};
