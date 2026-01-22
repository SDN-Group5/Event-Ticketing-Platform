import { Button } from "./button";

/**
 * ConfirmDialog Component
 * Custom confirmation dialog thay thế window.confirm()
 */
interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "danger" | "warning" | "info";
}

const ConfirmDialog = ({
    isOpen,
    title,
    message,
    confirmText = "OK",
    cancelText = "Huỷ",
    onConfirm,
    onCancel,
    variant = "info",
}: ConfirmDialogProps) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            confirmBg: "bg-red-100",
            confirmHover: "hover:bg-red-200",
            confirmText: "text-red-800",
        },
        warning: {
            confirmBg: "bg-yellow-100",
            confirmHover: "hover:bg-yellow-200",
            confirmText: "text-yellow-800",
        },
        info: {
            confirmBg: "bg-blue-100",
            confirmHover: "hover:bg-blue-200",
            confirmText: "text-blue-800",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div
                className="bg-white border-4 border-black p-6 max-w-md w-full"
                style={{ boxShadow: "8px 8px 0px 0px #000" }}
            >
                <h3 className="text-2xl font-black text-black uppercase mb-4">
                    {title}
                </h3>
                <p className="text-gray-700 mb-6 font-medium">{message}</p>
                <div className="flex gap-4 justify-end">
                    <Button
                        onClick={onCancel}
                        className="bg-gray-100 border-4 border-black text-black font-black uppercase hover:bg-gray-200"
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={`${styles.confirmBg} ${styles.confirmHover} border-4 border-black ${styles.confirmText} font-black uppercase`}
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;

