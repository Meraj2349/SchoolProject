import { toast } from "react-toastify";

/** App-wide toasts (rendered by the ToastContainer in AdminShell). */
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.info(message),
};

/** The best human message from an API error (server messages are already translated). */
export const errorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback || error?.message;
