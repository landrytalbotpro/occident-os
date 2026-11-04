import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("border-border bg-surface-0 shadow-card rounded-md border p-4", className)}
    />
  );
}
