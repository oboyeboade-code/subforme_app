import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
  duration?: number;
  action?: ExternalToast["action"];
};

type ToastReturn = {
  id: string | number;
  dismiss: () => void;
  update: (props: ToastProps) => void;
};

function toast({ title, description, variant = "default", duration, action }: ToastProps): ToastReturn {
  const opts: ExternalToast = { description, duration, action };

  let id: string | number;

  switch (variant) {
    case "destructive":
      id = sonnerToast.error(title, opts);
      break;
    case "success":
      id = sonnerToast.success(title, opts);
      break;
    case "info":
      id = sonnerToast.info(title, opts);
      break;
    case "warning":
      id = sonnerToast.warning(title, opts);
      break;
    default:
      id = sonnerToast(title, opts);
  }

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (props) => {

      const { title: newTitle, description: newDesc, variant: newVariant = variant, ...rest } = props;
      const newOpts: ExternalToast = { description: newDesc, id, ...rest };

      if (newVariant === "destructive") sonnerToast.error(newTitle, newOpts);
      else if (newVariant === "success") sonnerToast.success(newTitle, newOpts);
      else if (newVariant === "info") sonnerToast.info(newTitle, newOpts);
      else if (newVariant === "warning") sonnerToast.warning(newTitle, newOpts);
      else sonnerToast(newTitle, newOpts);
    },
  };
}

toast.success = (props: Omit<ToastProps, "variant">) => toast({ ...props, variant: "success" });
toast.error = (props: Omit<ToastProps, "variant">) => toast({ ...props, variant: "destructive" });
toast.info = (props: Omit<ToastProps, "variant">) => toast({ ...props, variant: "info" });
toast.warning = (props: Omit<ToastProps, "variant">) => toast({ ...props, variant: "warning" });

function useToast() {
  return {
    toasts: [], 
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };