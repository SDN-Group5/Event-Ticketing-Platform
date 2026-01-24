import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  // backward-compat: các page cũ dùng `message`
  message?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  // Backward-compat: các page cũ truyền "info" | "danger" | "warning"
  variant?: "default" | "destructive" | "info" | "danger" | "warning";
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading,
  variant = "default",
}: ConfirmDialogProps) {
  const buttonVariant =
    variant === "destructive" || variant === "danger" ? "destructive" : "default";

  const resolvedDescription = description ?? message;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-[#1e1a29] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          {resolvedDescription ? (
            <DialogDescription className="text-gray-300">
              {resolvedDescription}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white/5"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={buttonVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

