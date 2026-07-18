import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      accent: 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200',
      success: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
      warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
      danger: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
      neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
