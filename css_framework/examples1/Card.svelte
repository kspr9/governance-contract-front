// src/lib/components/layout/Card.svelte
// Your basic content card component

<script lang="ts">
  import { cva } from 'class-variance-authority'
  import { twMerge } from 'tailwind-merge'
  
  const cardVariants = cva(
    'card-base', // Uses our global base class
    {
      variants: {
        padding: {
          none: 'p-0',
          sm: 'p-4',
          md: 'p-6',
          lg: 'p-8'
        },
        shadow: {
          none: 'shadow-none',
          sm: 'shadow-sm',
          md: 'shadow-md', 
          lg: 'shadow-lg'
        },
        border: {
          none: 'border-0',
          subtle: 'border border-slate-200',
          strong: 'border-2 border-slate-300'
        }
      },
      defaultVariants: {
        padding: 'md',
        shadow: 'sm',
        border: 'subtle'
      }
    }
  )
  
  interface CardProps {
    padding?: 'none' | 'sm' | 'md' | 'lg'
    shadow?: 'none' | 'sm' | 'md' | 'lg'
    border?: 'none' | 'subtle' | 'strong'
    class?: string
    children?: any
  }
  
  let {
    padding = 'md',
    shadow = 'sm',
    border = 'subtle',
    class: className = '',
    children
  }: CardProps = $props()
  
  const computedClass = $derived(
    twMerge(cardVariants({ padding, shadow, border }), className)
  )
</script>

<div class={computedClass}>
  {@render children?.()}
</div>