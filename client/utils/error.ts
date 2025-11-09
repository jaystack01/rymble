import { ApiError } from "@/types/axios";

export const getErrorMessage = (err: unknown): string => {
  const error = err as ApiError;
  return error.response?.data?.message || "Something went wrong";
};
