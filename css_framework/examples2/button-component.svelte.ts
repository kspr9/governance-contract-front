<script lang="ts">
import { type Snippet } from 'svelte';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  class?: string;
  onclick?: () => void;
  children: Snippet;
}

let {
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  class: className = '',
  onclick,
  children
}: ButtonProps = $props();

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary', 
  ghost: 'btn-ghost',
  destructive: 'btn-base bg-red-600 hover:bg-red-700 text-white'
};

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: '', // uses CSS custom properties from btn-base
  lg: 'text-lg px-6 py-3'
};

$effect(() => {
  // Component-specific reactive logic
  if (loading) {
    // Handle loading state
  }
});
</script>

<button
  class="
    {variants[variant]}
    {sizes[size]}
    {className}
  "
  {disabled}
  {onclick}
  aria-busy={loading}
>
  {#if loading}
    <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  {/if}
  
  {@render children()}
</button>