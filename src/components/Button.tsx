import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const buttonVariants = cva(
  'focus-visible:outline-focus inline-flex cursor-pointer items-center justify-center gap-3 rounded-xl text-base font-bold transition-[background-color,color,filter,box-shadow] duration-200 ease-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      tone: {
        brand: '',
        danger: '',
      },
      appearance: {
        solid: '',
        ghost: '',
      },
      size: {
        default: 'min-h-12 px-5',
        icon: 'size-12 min-h-12 p-0 [&>svg]:size-5',
      },
    },
    compoundVariants: [
      {
        tone: 'brand',
        appearance: 'solid',
        class:
          'bg-brand text-brand-ink shadow-lg shadow-page/20 hover:bg-brand-hover',
      },
      {
        tone: 'danger',
        appearance: 'solid',
        class:
          'bg-danger text-white shadow-lg shadow-page/20 hover:bg-danger-hover',
      },
      {
        tone: 'brand',
        appearance: 'ghost',
        class: 'text-muted hover:bg-surface hover:text-heading',
      },
      {
        tone: 'danger',
        appearance: 'ghost',
        class: 'text-danger hover:bg-danger/15',
      },
    ],
    defaultVariants: { tone: 'brand', appearance: 'solid', size: 'default' },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = ({
  tone,
  appearance,
  size,
  className = '',
  children,
  ...props
}: ButtonProps): React.JSX.Element => {
  return (
    <button
      className={cn(buttonVariants({ tone, appearance, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
}
