import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useHoverClickSounds } from "@/lib/sfx";

const buttonVariants = cva(
  // root: no active scale on container; add group to target child label
  "group inline-flex dark:h-12 font-medium cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-sm text-[21px] transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none",
  {
    variants: {
      variant: {
        default:
          // keep hover bg, remove active:bg so the button itself doesn't change on click
          "bg-product text-primary-foreground shadow-xs hover:bg-product-hover focus-visible:ring-product/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 has-[>svg]:pr-5",
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
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function wrapTextNodes(children: React.ReactNode) {
  // Wrap only literal text/number nodes so icons/elements stay unaffected.
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <span
          className={cn(
            "btn-label inline-block will-change-transform transition-transform",
            "motion-reduce:transform-none motion-reduce:transition-none",
            "group-hover:scale-[1.03] group-active:scale-[0.96]",
            "duration-75",
            "[transition-timing-function:var(--ease-snap)]"
          )}
          style={
            {
              // Apple-like tactile snap curve
              "--ease-snap": "cubic-bezier(0.42, 0, 0.58, 1))",
            } as React.CSSProperties
          }
        >
          {child}
        </span>
      );
    }
    // Leave non-text nodes (e.g., <svg>, custom elements) untouched.
    return child as React.ReactNode;
  });
}

// Forward refs so this remains drop-in compatible with forms, tooltips, etc.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      onMouseEnter,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const sfx = useHoverClickSounds();

    return (
      <Comp
        data-slot="button"
        ref={ref as any}
        className={cn(buttonVariants({ variant, size, className }))}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          sfx.onMouseEnter();
          onMouseEnter?.(e);
        }}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          sfx.onClick();
          onClick?.(e);
        }}
        {...props}
      >
        {wrapTextNodes(children)}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
