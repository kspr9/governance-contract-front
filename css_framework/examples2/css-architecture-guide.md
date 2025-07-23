# Svelte + Tailwind CSS Architecture Guide

## 1. Architecture Layers (Decision Framework)

### Layer 1: app.css (Global Foundation)
```css
/* Design tokens and CSS custom properties */
:root {
  /* Semantic spacing scale */
  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
  --space-2xl: 3rem;      /* 48px */
  
  /* Component-specific tokens */
  --button-padding-x: var(--space-md);
  --button-padding-y: var(--space-sm);
  --card-padding: var(--space-lg);
  --input-height: 2.5rem;
  
  /* Brand colors (extend Tailwind) */
  --brand-primary: 220 100% 50%;
  --brand-secondary: 280 100% 70%;
}

/* Global component base classes */
@layer components {
  .btn-base {
    @apply inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50;
    padding: var(--button-padding-y) var(--button-padding-x);
  }
  
  .card-base {
    @apply bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm;
    padding: var(--card-padding);
  }
  
  .input-base {
    @apply w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
    height: var(--input-height);
  }
}
```

### Layer 2: Component Variants (Tailwind @apply)
```css
/* In app.css or separate variants.css */
@layer components {
  /* Button variants */
  .btn-primary {
    @apply btn-base bg-blue-600 hover:bg-blue-700 text-white;
  }
  
  .btn-secondary {
    @apply btn-base bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100;
  }
  
  .btn-ghost {
    @apply btn-base hover:bg-gray-100 dark:hover:bg-gray-800;
  }
  
  /* Card variants */
  .card-elevated {
    @apply card-base shadow-lg;
  }
  
  .card-bordered {
    @apply card-base border-2;
  }
}
```

### Layer 3: Component-Specific Styles (Svelte <style>)
```svelte
<style>
  /* Only for component-specific styling that can't be achieved with utilities */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
  }
  
  /* Animation keyframes */
  @keyframes slide-in {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  
  .slide-in {
    animation: slide-in 0.3s ease-out;
  }
</style>
```

### Layer 4: Inline Utilities (Tailwind classes)
```svelte
<!-- For layout, spacing adjustments, and one-off styling -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
```

## 2. Decision Framework

**Use app.css when:**
- Defining design tokens/custom properties
- Creating reusable component base classes
- Setting up global resets or utilities

**Use @layer components when:**
- Creating button/card/input variants
- Defining common patterns used 3+ times
- Building design system components

**Use component <style> when:**
- Pseudo-elements/selectors not possible in Tailwind
- Complex animations
- Component-specific styles that don't need reuse

**Use inline utilities when:**
- Layout and spacing
- One-off styling
- Responsive adjustments
- State-based styling

## 3. Component Abstraction Strategy

### Base Component Pattern
Create a base component library that wraps common patterns:

```typescript
// src/lib/components/ui/Button.svelte (example structure)
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}
```

### Compound Utility Pattern
```css
/* For frequently combined utilities */
@layer utilities {
  .flex-center {
    @apply flex items-center justify-center;
  }
  
  .flex-between {
    @apply flex items-center justify-between;
  }
  
  .grid-responsive {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
  }
}
```

## 4. Debugging & Maintenance

### CSS Custom Property Debugging
```css
/* Add debugging utilities in development */
@layer utilities {
  .debug-spacing {
    outline: 1px solid red;
  }
  
  .debug-grid {
    background-image: 
      linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px);
    background-size: 16px 16px;
  }
}
```

### Systematic Changes Workflow
1. **Design tokens first**: Change CSS custom properties
2. **Component variants second**: Update @layer components
3. **Utilities last**: Adjust inline classes

### Class Organization Pattern
```svelte
<!-- Organize classes by type for better readability -->
<button 
  class="
    btn-primary
    w-full md:w-auto
    mb-4 md:mb-0
    {extraClasses}
  "
>
  Submit
</button>
```

## 5. File Structure

```
src/
├── app.css                 # Global styles, design tokens
├── lib/
│   ├── styles/
│   │   ├── variants.css    # Component variants
│   │   └── utilities.css   # Custom utilities
│   └── components/
│       ├── ui/             # Base components (Button, Card, etc.)
│       └── composite/      # Feature-specific components
```

## 6. Theming Strategy

```css
/* CSS custom properties for easy theme switching */
[data-theme="light"] {
  --bg-primary: 255 255 255;
  --text-primary: 0 0 0;
}

[data-theme="dark"] {
  --bg-primary: 15 23 42;
  --text-primary: 248 250 252;
}

/* Use in Tailwind config */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          bg: 'hsl(var(--bg-primary) / <alpha-value>)',
          text: 'hsl(var(--text-primary) / <alpha-value>)'
        }
      }
    }
  }
}
```

## Key Benefits

- **Reduced verbosity**: Common patterns abstracted to single classes
- **Easy maintenance**: Change design tokens to update globally  
- **Clear debugging**: Hierarchical CSS structure
- **Flexibility**: Can still use utilities for edge cases
- **Performance**: Smaller HTML payload with semantic class names