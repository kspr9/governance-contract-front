<script lang="ts">
// LoadingDots.svelte: Animated loading dots for Svelte 5
let dots = $state('.');

$effect(() => {
    const interval = setInterval(() => {
        dots = dots.length >= 3 ? '.' : dots + '.';
    }, 500);
    return () => clearInterval(interval);
});
</script>

<span>{dots}</span> 