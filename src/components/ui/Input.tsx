import { cn } from "@/lib/cn";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label {...props} className={cn("text-strong block text-[13px] leading-4 font-semibold", className)} />
  );
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        "bg-surface-0 text-strong placeholder:text-muted h-10 w-full rounded-sm border px-3 text-sm",
        invalid ? "border-danger" : "border-border",
        className,
      )}
    />
  );
}
