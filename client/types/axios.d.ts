import { AxiosError } from "axios";

// Generic type for API errors that return a message
export type ApiError = AxiosError<{ message: string }>;
