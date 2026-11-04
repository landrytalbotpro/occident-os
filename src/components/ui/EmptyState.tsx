import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center shadow-none">
      {Icon && (
        <div className="rounded-pill bg-surface-2 mb-4 flex size-12 items-center justify-center">
          <Icon className="text-muted size-6" aria-hidden />
        </div>
      )}
      <h2 className="text-strong text-base leading-6 font-semibold">{title}</h2>
      {text && <p className="text-muted mt-1 max-w-sm">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
