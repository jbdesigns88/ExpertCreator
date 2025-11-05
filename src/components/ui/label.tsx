import * as React from "react";
import { Label as RadixLabel, type LabelProps as RadixLabelProps } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<React.ElementRef<typeof RadixLabel>, RadixLabelProps>(
  ({ className, ...props }, ref) => (
    <RadixLabel
      ref={ref}
      className={cn("text-sm font-medium text-slate-600", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
