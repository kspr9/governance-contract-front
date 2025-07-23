// src/lib/components/layout/Grid.svelte  
// Handles grid layouts with sensible defaults

<script lang="ts">
  import { cva } from 'class-variance-authority'
  import { twMerge } from 'tailwind-merge'
  
  const gridVariants = cva(
    'grid',
    {
      variants: {
        cols: {
          1: 'grid-cols-1',
          2: 'grid-cols-1 md:grid-cols-2',
          3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 
          4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]' // Smart responsive
        },
        gap: {
          none: 'gap-0',
          xs: 'gap-1',
          sm: 'gap-2', 
          md: 'gap-4',
          lg: 'gap-6',
          xl: 'gap-8'
        }
      },
      defaultVariants: {
        cols: 'auto',
        gap: 'md'
      }
    }
  )
  
  interface GridProps {
    cols?: 1 | 2 | 3 | 4 | 'auto'
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    class?: string
    children?: any
  }
  
  let {
    cols = 'auto',
    gap = 'md', 
    class: className = '',
    children
  }: GridProps = $props()
  
  const computedClass = $derived(
    twMerge(gridVariants({ cols, gap }), className)
  )
</script>

<div class={computedClass}>
  {@render children?.()}
</div>