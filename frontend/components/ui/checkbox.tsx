'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, onChange, ...props }, ref) => {
        return (
            <span className="relative inline-flex items-center justify-center">
                <input
                    type="checkbox"
                    ref={ref}
                    className="sr-only peer"
                    onChange={(e) => {
                        onChange?.(e)
                        onCheckedChange?.(e.target.checked)
                    }}
                    {...props}
                />
                <span
                    className={cn(
                        'h-4 w-4 shrink-0 rounded border border-input shadow-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:bg-brand peer-checked:border-brand flex items-center justify-center',
                        className
                    )}
                >
                    <Check className="h-3 w-3 text-white hidden peer-checked:block" />
                </span>
            </span>
        )
    }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
