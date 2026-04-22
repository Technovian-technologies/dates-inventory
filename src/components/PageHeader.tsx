import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-olive font-semibold mb-3">
          {eyebrow}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight text-balance">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}
