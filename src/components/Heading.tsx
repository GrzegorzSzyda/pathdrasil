import type { ElementType, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const headingVariants = cva('text-heading tracking-tight', {
  variants: {
    level: {
      h1: 'text-4xl font-semibold leading-tight sm:text-5xl',
      h2: 'text-3xl font-semibold leading-tight',
      h3: 'text-2xl font-semibold leading-snug',
      h4: 'text-xl font-semibold leading-snug',
    },
  },
  defaultVariants: { level: 'h1' },
})

type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & { as?: ElementType }

export const Heading = ({
  as: Component = 'h2',
  level,
  className,
  children,
  ...props
}: HeadingProps): React.JSX.Element => (
  <Component className={cn(headingVariants({ level }), className)} {...props}>
    {children}
  </Component>
)
