import * as React from "react";
import { cn } from "../../lib/utils";

const NeoCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-4 border-black bg-white", className)}
    style={{ boxShadow: "6px 6px 0px 0px #000" }}
    {...props}
  />
));
NeoCard.displayName = "NeoCard";

const NeoCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
NeoCardHeader.displayName = "NeoCardHeader";

const NeoCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-black leading-none tracking-tight uppercase text-black",
      className
    )}
    {...props}
  />
));
NeoCardTitle.displayName = "NeoCardTitle";

const NeoCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-black font-medium", className)}
    {...props}
  />
));
NeoCardDescription.displayName = "NeoCardDescription";

const NeoCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
NeoCardContent.displayName = "NeoCardContent";

const NeoCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
NeoCardFooter.displayName = "NeoCardFooter";

export {
  NeoCard,
  NeoCardHeader,
  NeoCardFooter,
  NeoCardTitle,
  NeoCardDescription,
  NeoCardContent,
};



