import React from "react"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef(({ className, onCheckedChange, checked, ...props }, ref) => (
    <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
            "h-4 w-4 shrink-0 rounded border border-purple-200 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-50 accent-purple-600",
            className
        )}
        {...props}
    />
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
