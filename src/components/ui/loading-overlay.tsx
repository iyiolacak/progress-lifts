// LoadingOutline.tsx
import * as React from "react";

export function LoadingOutline({
  targetRef,
  gap = 6,               // px outside the button box
  strokeWidth = 2,
  dash = 12,              // dash length
  dashGap = 10,           // space between dashes
  color = "hsl(var(--ring))",
  durationMs = 1100,      // rotation period
}: {
  targetRef: React.RefObject<HTMLElement>;
  gap?: number;
  strokeWidth?: number;
  dash?: number;
  dashGap?: number;
  color?: string;
  durationMs?: number;
}) {
  const [box, setBox] = React.useState({ w: 0, h: 0, r: 0 });

  React.useLayoutEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      // Use the *largest* corner radius to keep it simple and pleasant.
      const r = Math.max(
        ...["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"]
          .map(k => parseFloat(cs.getPropertyValue(k) || "0"))
      );
      setBox({ w: rect.width, h: rect.height, r });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [targetRef]);

  if (!box.w || !box.h) return null;

  // SVG is expanded by `gap` on all sides; rect expands radii as well.
  const W = box.w + gap * 2;
  const H = box.h + gap * 2;
  const R = Math.max(0, box.r + gap);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        // expand outward without shifting layout
        margin: -gap,
        overflow: "visible",
      }}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="size-full origin-center animate-[spin_var(--spin)_linear_infinite]
                   motion-reduce:animate-none"
        style={
          {
            "--spin": `${durationMs}ms`,
          } as React.CSSProperties
        }
      >
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={W - strokeWidth}
          height={H - strokeWidth}
          rx={R}
          ry={R}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${dash} ${dashGap}`}
          // Keep opacity subtle; tweak to taste per theme
          opacity={0.75}
        />
      </svg>
    </div>
  );
}
