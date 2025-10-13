import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
// Import the unified useHoverClickSounds hook from your SFX library
import { useHoverClickSounds } from "@/lib/sfx"

const buttonVariants = cva(
  "inline-flex dark:h-11 active:scale-95 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-product text-primary-foreground shadow-xs hover:bg-product-hover active:bg-product-active focus-visible:ring-product/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  // Removed hoverSoundUrl as useHoverClickSounds handles fixed URLs
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  // Removed hoverSoundUrl from destructuring
  onMouseEnter,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  
  // Use the unified hook
  const sfx = useHoverClickSounds(); 

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onMouseEnter={(e) => {
        sfx.onMouseEnter(); // Play hover sound
        onMouseEnter?.(e); // Call original onMouseEnter prop
      }}
      onClick={(e) => {
        sfx.onClick(); // Play click sound
        onClick?.(e); // Call original onClick prop
      }}
      {...props}
    />
  );
}

export { buttonVariants };