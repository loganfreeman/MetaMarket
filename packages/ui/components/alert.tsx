import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

const alertVariants = cva("rounded-md border p-4 text-sm", {
  variants: {
    variant: {
      default: "border-slate-200 bg-white text-slate-900",
      destructive: "border-red-200 bg-red-50 text-red-900",
      success: "border-emerald-200 bg-emerald-50 text-emerald-900"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export type AlertProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>;

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div className={cn(alertVariants({ variant }), className)} {...props} />;
}
