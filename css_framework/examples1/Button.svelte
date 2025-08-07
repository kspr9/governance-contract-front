<script lang="ts">
    import { twMerge } from 'tailwind-merge'
    import { cva, type VariantProps } from 'class-variance-authority'
    
    // This is where the magic happens - we combine our global design tokens
    // with Tailwind's utility classes to create predictable, reusable variants
    const buttonVariants = cva(
      // Base classes - notice we use 'btn-base' from our global CSS
      // This combines our CSS custom properties with Tailwind utilities
      'btn-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      {
        variants: {
          variant: {
            // Primary uses our design tokens through Tailwind
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
            secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500',
            destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
            outline: 'border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-500',
            ghost: 'hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-500',
            link: 'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500'
          },
          size: {
            sm: 'h-9 px-3 text-sm',
            md: 'h-10 px-4 py-2',
            lg: 'h-11 px-8 text-lg',
            icon: 'h-10 w-10'
          }
        },
        defaultVariants: {
          variant: 'primary',
          size: 'md'
        }
      }
    )
    
    // TypeScript interfaces for props
    interface ButtonProps extends VariantProps<typeof buttonVariants> {
      onclick?: (event: MouseEvent) => void
      href?: string
      disabled?: boolean
      type?: 'button' | 'submit' | 'reset'
      class?: string
      children?: any
    }
    
    // Destructure props with defaults
    let {
      variant = 'primary',
      size = 'md',
      onclick,
      href,
      disabled = false,
      type = 'button',
      class: className = '',
      children,
      ...restProps
    }: ButtonProps = $props()
    
    // Compute the final class string - this is where we merge our design system
    // classes with any custom classes passed in
    const computedClass = $derived(
      twMerge(buttonVariants({ variant, size }), className)
    )
  </script>
  
  <!-- 
    The component template - notice how clean this is because all the complexity
    is handled in the class computation above
  -->
  {#if href}
    <!-- Render as link if href is provided -->
    <a 
      {href} 
      class={computedClass}
      role="button"
      tabindex={disabled ? -1 : 0}
      aria-disabled={disabled}
      {...restProps}
    >
      {@render children?.()}
    </a>
  {:else}
    <!-- Render as button otherwise -->
    <button 
      {type}
      {disabled}
      {onclick}
      class={computedClass}
      {...restProps}
    >
      {@render children?.()}
    </button>
  {/if}
  
  <style>
    /* 
      Component-specific styles go here ONLY if:
      1. They can't be achieved with Tailwind + your design tokens
      2. They're complex animations or pseudo-elements
      3. They're truly unique to this component
      
      In most cases, your style block will be empty or very minimal
      because your global CSS + Tailwind handles everything
    */
    
    /* Example: Custom loading state animation that would be verbose in Tailwind */
    :global(.btn-loading) {
      position: relative;
      color: transparent !important;
    }
    
    :global(.btn-loading::after) {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-right-color: transparent;
      animation: btn-spin 0.75s linear infinite;
    }
    
    @keyframes btn-spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>