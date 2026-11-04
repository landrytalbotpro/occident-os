import { cn } from "@/lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        "bg-surface-0 text-strong placeholder:text-muted min-h-24 w-full rounded-sm border px-3 py-2 text-sm",
        invalid ? "border-danger" : "border-border",
        className,
      )}
    />
  );
}
