<script lang="ts">
  /**
   * Reusable help tooltip component
   * Shows an info icon with tooltip on hover/focus
   */
  
  let { text, position = 'top' }: {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  } = $props();
  
  let showTooltip = $state(false);
</script>

<div class="relative inline-flex items-center">
  <button
    type="button"
    class="ml-1 p-0.5 text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] focus:text-[color:var(--primary)] focus:outline-none transition-colors"
    onmouseenter={() => showTooltip = true}
    onmouseleave={() => showTooltip = false}
    onfocus={() => showTooltip = true}
    onblur={() => showTooltip = false}
    aria-label="Help information"
  >
    <svg 
      class="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="1.5" 
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </button>
  
  {#if showTooltip}
    <div 
      class="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap"
      class:bottom-full={position === 'top'}
      class:top-full={position === 'bottom'}
      class:right-full={position === 'left'}
      class:left-full={position === 'right'}
      class:mb-2={position === 'top'}
      class:mt-2={position === 'bottom'}
      class:mr-2={position === 'left'}
      class:ml-2={position === 'right'}
      style="left: 50%; transform: translateX(-50%);"
    >
      {text}
      <!-- Tooltip arrow -->
      <div 
        class="absolute w-2 h-2 bg-gray-900 transform rotate-45"
        class:top-full={position === 'top'}
        class:bottom-full={position === 'bottom'}
        class:left-full={position === 'left'}
        class:right-full={position === 'right'}
        style="left: 50%; margin-left: -4px;"
      ></div>
    </div>
  {/if}
</div>
