import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 min-h-12 px-5',
  {
    variants: {
      variant: {
        default: 'bg-primary-700 text-white hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700',
        accent: 'bg-accent-600 text-white hover:bg-accent-700',
        outline: 'border-2 border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
        ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
        danger: 'bg-danger-600 text-white hover:bg-danger-500',
        link: 'text-primary-700 underline-offset-4 hover:underline dark:text-primary-300 min-h-0 px-0',
      },
      size: {
        default: 'h-12 px-5 py-2',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-14 px-7 text-lg',
        icon: 'h-12 w-12 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'
