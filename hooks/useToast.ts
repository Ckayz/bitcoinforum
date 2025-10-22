import { toast } from 'sonner';

/**
 * Custom hook for consistent toast notifications across the app
 */
export function useToast() {
  return {
    success: (message: string, description?: string) => {
      toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
      toast.error(message, { description });
    },
    info: (message: string, description?: string) => {
      toast.info(message, { description });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },
    loading: (message: string) => {
      return toast.loading(message);
    },
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      return toast.promise(promise, messages);
    },
  };
}
