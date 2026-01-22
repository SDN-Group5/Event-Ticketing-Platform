import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const neoButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-black uppercase transition-all duration-150 active:translate-x-0 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-amber-500 text-black border-4 border-black hover:translate-x-1 hover:translate-y-1",
        primary: "bg-blue-500 text-white border-4 border-black hover:translate-x-1 hover:translate-y-1",
        secondary: "bg-white text-black border-4 border-black hover:translate-x-1 hover:translate-y-1",
        destructive: "bg-red-500 text-white border-4 border-black hover:translate-x-1 hover:translate-y-1",
      },
      size: {
        default: "h-12 px-8 text-base",
        sm: "h-10 px-6 text-sm",
        lg: "h-14 px-10 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface NeoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neoButtonVariants> {
  asChild?: boolean;
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(neoButtonVariants({ variant, size, className }))}
        style={{ boxShadow: "6px 6px 0px 0px #000" }}
        ref={ref}
        {...props}
      />
    );
  }
);
NeoButton.displayName = "NeoButton";

export { NeoButton, neoButtonVariants };



