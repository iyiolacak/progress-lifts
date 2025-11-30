import Image from "next/image";
import { cn } from "@/lib/utils";

const ICONS = {
  "alert-octagon": "/icons/alert-octagon.svg",
  attachment: "/icons/attachment.svg",
  "audio-file": "/icons/audio-file.svg",
  bin: "/icons/bin.svg",
  binocular: "/icons/binocular.svg",
  "check-badge": "/icons/check-badge.svg",
  check: "/icons/check.svg",
  cog: "/icons/cog.svg",
  "common-file-stack": "/icons/common-file-stack.svg",
  delete: "/icons/delete.svg",
  "export-file": "/icons/export-file.svg",
  "face-id": "/icons/face-id.svg",
  "flag-plain": "/icons/flag-plain.svg",
  "flash-off": "/icons/flash-off.svg",
  "house-chimney": "/icons/house-chimney.svg",
  "lock-shield": "/icons/lock-shield.svg",
  "login-key": "/icons/login-key.svg",
  "navigation-menu": "/icons/navigation-menu.svg",
  "reward-stars": "/icons/reward-stars.svg",
  scissors: "/icons/scissors.svg",
  "smiley-smile": "/icons/smiley-smile.svg",
  "smiley-unhappy": "/icons/smiley-unhappy.svg",
  tags: "/icons/tags.svg",
} as const;

export type AppIconName = keyof typeof ICONS;

type AppIconProps = Omit<
  React.ComponentProps<typeof Image>,
  "src" | "alt" | "width" | "height"
> & {
  name: AppIconName;
  size?: number;
  alt?: string;
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 18,
  alt,
  className,
  ...props
}) => {
  const src = ICONS[name];

  return (
    <Image
      src={src}
      alt={alt ?? name}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
};

export const availableAppIcons = Object.keys(ICONS) as AppIconName[];
