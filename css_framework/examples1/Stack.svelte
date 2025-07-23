// src/lib/components/layout/Stack.svelte
// This handles vertical spacing - one of the most common layout needs

<script lang="ts">
  import { cva } from 'class-variance-authority'
  import { twMerge } from 'tailwind-merge'
  
  const stackVariants = cva(
    'flex flex-col', // Base always flexbox column
    {
      variants: {
        gap: {
          none: 'gap-0',
          xs: 'gap-1',      // 4px
          sm: 'gap-2',      // 8px  
          md: 'gap-4',      // 16px
          lg: 'gap-6',      // 24px
          xl: 'gap-8',      // 32px
          '2xl': 'gap-12'   // 48px
        },
        align: {
          start: 'items-start',
          center: 'items-center', 
          end: 'items-end',
          stretch: 'items-stretch'
        }
      },
      defaultVariants: {
        gap: 'md',
        align: 'stretch'
      }
    }
  )
  
  interface StackProps {
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    align?: 'start' | 'center' | 'end' | 'stretch'
    class?: string
    children?: any
  }
  
  let { 
    gap = 'md', 
    align = 'stretch', 
    class: className = '',
    children 
  }: StackProps = $props()
  
  const computedClass = $derived(
    twMerge(stackVariants({ gap, align }), className)
  )
</script>

<div class={computedClass}>
  {@render children?.()}
</div>

