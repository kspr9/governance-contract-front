// src/lib/components/layout/Container.svelte
// Your main content container with consistent max-widths

<script lang="ts">
  import { cva } from 'class-variance-authority'
  import { twMerge } from 'tailwind-merge'
  
  const containerVariants = cva(
    'mx-auto px-4', // Always centered with padding
    {
      variants: {
        maxWidth: {
          sm: 'max-w-(--breakpoint-sm)',   // 640px
          md: 'max-w-(--breakpoint-md)',   // 768px  
          lg: 'max-w-(--breakpoint-lg)',   // 1024px
          xl: 'max-w-(--breakpoint-xl)',   // 1280px
          '2xl': 'max-w-(--breakpoint-2xl)', // 1536px
          full: 'max-w-full',
          prose: 'max-w-prose'     // Optimal reading width ~65ch
        },
        padding: {
          none: 'px-0',
          sm: 'px-4',
          md: 'px-6', 
          lg: 'px-8'
        }
      },
      defaultVariants: {
        maxWidth: 'lg',
        padding: 'sm'
      }
    }
  )
  
  interface ContainerProps {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'prose'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    class?: string
    children?: any
  }
  
  let {
    maxWidth = 'lg',
    padding = 'sm',
    class: className = '',
    children
  }: ContainerProps = $props()
  
  const computedClass = $derived(
    twMerge(containerVariants({ maxWidth, padding }), className)
  )
</script>

<div class={computedClass}>
  {@render children?.()}
</div>

// ================================================================