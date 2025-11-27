import { cn } from "@/lib/utils";
import { createContext, useContext, useState } from "react";

type SwitchContextType = {
  checked: boolean;
  disabled: boolean;
};

const SwitchContext = createContext<SwitchContextType | null>(null);

// helper hook to use the context safely
const useSwitchContext = () => {
  const context = useContext(SwitchContext);
  if (!context)
    throw new Error("Switch components must be used within a Switch.Root");
  return context;
};

type SwitchRootProps = {
  checked: boolean;
  defaultChecked: boolean;
  onCheckedChange: (c: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
  id?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const SwitchRoot = ({
  checked: controlledChecked,
  onCheckedChange,
  defaultChecked,
  children,
  disabled = false,
  id,
  ...rest
}: SwitchRootProps) => {
  const [uncontrolledChecked, setUncontrolledChecked] =
    useState<boolean>(defaultChecked);

  const isControlled = controlledChecked !== undefined;

  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !checked;

    if (!isControlled) {
      setUncontrolledChecked(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <SwitchContext.Provider value={{ checked, disabled }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={toggle}
        id={id}
        {...rest}
        className={cn(
          "transition-colors bg-card rounded-lg",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {children}
      </button>
    </SwitchContext.Provider>
  );
};

const SwitchThumb = () => {
  const { checked } = useSwitchContext();

  return (
    <div
      data-state={checked ? "checked" : "unchecked"}
      className="size-7 bg-white block data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 transition-transform"
    ></div>
  );
};
