/**
 * Toast notifications using react-toastify, styled with MIS design system.
 * Use for success, error, and info feedback after user actions.
 */
import { toast as toastify, type ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  className: "toast-mis",
  progressClassName: "toast-mis-progress",
};

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    toastify.success(message, { ...defaultOptions, ...options }),

  error: (message: string, options?: ToastOptions) =>
    toastify.error(message, { ...defaultOptions, autoClose: 6000, ...options }),

  info: (message: string, options?: ToastOptions) =>
    toastify.info(message, { ...defaultOptions, ...options }),

  /** Dismiss all toasts */
  dismiss: (id?: string | number) => toastify.dismiss(id),
};
