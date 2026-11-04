import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        aria-invalid={invalid || undefined}
        className={cn(
          "bg-surface-0 text-strong h-10 w-full appearance-none rounded-sm border pr-9 pl-3 text-sm",
          invalid ? "border-danger" : "border-border",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        className="text-muted pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        aria-hidden
      />
    </div>
  );
}
