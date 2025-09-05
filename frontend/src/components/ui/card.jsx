import React from 'react'
import clsx from 'clsx'

export const Card = ({ className, children, ...props }) => (
  <div className={clsx('rounded-xl border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm', className)} {...props}>
    {children}
  </div>
)

export const CardHeader = ({ className, children, ...props }) => (
  <div className={clsx('px-5 py-4 border-b border-gray-100 dark:border-gray-800', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={clsx('text-sm font-semibold text-gray-900 dark:text-gray-100', className)} {...props}>
    {children}
  </h3>
)

export const CardContent = ({ className, children, ...props }) => (
  <div className={clsx('px-5 py-4', className)} {...props}>
    {children}
  </div>
)


