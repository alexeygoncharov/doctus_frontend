import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'primary';
}

export function Spinner({ 
  size = 'md', 
  className,
  variant = 'default'
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  }

  const variantClasses = {
    default: 'border-gray-300 border-t-gray-800',
    primary: 'border-blue-200 border-t-blue-600'
  }

  return (
    <div 
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className
      )} 
    />
  )
} 