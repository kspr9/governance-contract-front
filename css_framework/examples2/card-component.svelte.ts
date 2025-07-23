<script lang="ts">
import { type Snippet } from 'svelte';

interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  class?: string;
  children: Snippet;
  header?: Snippet;
  footer?: Snippet;
}

let {
  variant = 'default',
  padding = 'md',
  class: className = '',
  children,
  header,
  footer
}: CardProps = $props();

const variants = {
  default: 'card-base',
  elevated: 'card-elevated', 
  bordered: 'card-bordered'
};

const paddings = {
  none: 'p-0',
  sm: 'p-3',
  md: '', // uses --card-padding from card-base
  lg: 'p-6'
};
</script>

<div class="{variants[variant]} {paddings[padding]} {className}">
  {#if header}
    <header class="border-b border-gray-200 dark:border-gray-700 -mx-6 -mt-6 px-6 py-4 mb-6">
      {@render header()}
    </header>
  {/if}

  <div class="card-content">
    {@render children()}
  </div>

  {#if footer}
    <footer class="border-t border-gray-200 dark:border-gray-700 -mx-6 -mb-6 px-6 py-4 mt-6">
      {@render footer()}
    </footer>
  {/if}
</div>

<style>
  /* Component-specific styles that can't be achieved with utilities */
  .card-content :global(> *:first-child) {
    margin-top: 0;
  }
  
  .card-content :global(> *:last-child) {
    margin-bottom: 0;
  }
</style>