import React from 'react'
import { cva } from 'class-variance-authority'
import clsx from 'clsx'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
        secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-50',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button ref={ref} className={clsx(buttonVariants({ variant, size }), className)} {...props} />
  )
})

Button.displayName = 'Button'


