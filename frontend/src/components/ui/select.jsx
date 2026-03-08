import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

// Simplified Select implementation using native select
// adapting to the API expected by the user's code:
// <Select value={sortBy} onValueChange={setSortBy}>
//   <SelectTrigger><SelectValue /></SelectTrigger>
//   <SelectContent><SelectItem value="...">...</SelectItem></SelectContent>


// RE-IMPLEMENTING with state in parent
const SelectContext = React.createContext({})

const SelectActual = ({ children, value, onValueChange }) => {
    const [open, setOpen] = React.useState(false)
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative inline-block w-full">{children}</div>
        </SelectContext.Provider>
    )
}

const SelectTriggerActual = React.forwardRef(({ className, children, ...props }, ref) => {
    const { setOpen, open } = React.useContext(SelectContext)
    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            ref={ref}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
})

const SelectContentActual = ({ className, children, ...props }) => {
    const { open } = React.useContext(SelectContext)
    if (!open) return null
    return (
        <div
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-80 mt-1 w-full",
                className
            )}
            {...props}
        >
            <div className="p-1">{children}</div>
        </div>
    )
}

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
    const { onValueChange, setOpen } = React.useContext(SelectContext)
    return (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-100 cursor-pointer",
                className
            )}
            onClick={(e) => {
                e.stopPropagation()
                onValueChange(value)
                setOpen(false)
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {/* Checkmark could go here if selected */}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
})

const SelectValue = React.forwardRef(({ className, placeholder = "Select an option", ...props }, ref) => {
    const { value } = React.useContext(SelectContext)
    return (
        <span ref={ref} className={cn("truncate", className)} {...props}>
            {value || placeholder}
        </span>
    )
})

export { SelectActual as Select, SelectTriggerActual as SelectTrigger, SelectValue, SelectContentActual as SelectContent, SelectItem }
