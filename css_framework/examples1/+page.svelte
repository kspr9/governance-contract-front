<script lang="ts">
    // Import your design system components
    import Container from './lib/components/layout/Container.svelte'
    import Stack from './lib/components/layout/Stack.svelte'
    import Grid from './lib/components/layout/Grid.svelte'
    import Card from './lib/components/layout/Card.svelte'
    import Button from './lib/components/layout/Button.svelte'
    
    // Example data - imagine this comes from your API
    const features = [
      { title: 'Fast Performance', description: 'Lightning fast load times' },
      { title: 'Secure by Default', description: 'Built-in security features' },
      { title: 'Developer Friendly', description: 'Great developer experience' }
    ]
  </script>
  
  <!-- 
    Notice how clean and semantic this markup becomes when you have 
    the right abstractions. Each component has a single, clear purpose.
  -->
  
  <Container maxWidth="xl" padding="md">
    <!-- Hero Section - Uses Stack for vertical flow -->
    <Stack gap="xl" align="center" class="py-16 text-center">
      <h1 class="text-4xl md:text-6xl font-bold text-gradient">
        Welcome to Our Platform
      </h1>
      
      <p class="text-xl text-slate-600 max-w-2xl">
        Build amazing applications with our comprehensive design system
        and component library.
      </p>
      
      <!-- Button group - using Tailwind for one-off spacing -->
      <div class="flex gap-4 flex-wrap justify-center">
        <Button variant="primary" size="lg">Get Started</Button>
        <Button variant="outline" size="lg">Learn More</Button>
      </div>
    </Stack>
    
    <!-- Features Grid - Uses Grid for automatic responsive layout -->
    <Grid cols={3} gap="lg" class="py-16">
      {#each features as feature}
        <Card padding="lg" shadow="md">
          <Stack gap="sm">
            <h3 class="text-xl font-semibold">{feature.title}</h3>
            <p class="text-slate-600">{feature.description}</p>
            <Button variant="ghost" size="sm" class="self-start mt-4">
              Learn More →
            </Button>
          </Stack>
        </Card>
      {/each}
    </Grid>
    
    <!-- CTA Section -->
    <Card padding="xl" shadow="lg" class="bg-gradient-to-r from-blue-50 to-purple-50 text-center">
      <Stack gap="md" align="center">
        <h2 class="text-3xl font-bold">Ready to Get Started?</h2>
        <p class="text-lg text-slate-600 max-w-md">
          Join thousands of developers building with our platform.
        </p>
        <Button variant="primary" size="lg">
          Start Building Today
        </Button>
      </Stack>
    </Card>
  </Container>
  
  <style>
    /* 
      Component-specific styles - notice how little we need here!
      Most styling is handled by our design system components.
    */
    
    /* Custom gradient that's specific to this page */
    .bg-gradient-to-r {
      background: linear-gradient(
        to right, 
        var(--color-primary-50), 
        rgb(250 245 255)
      );
    }
    
    /* 
      Only add styles here if:
      1. It's truly unique to this component/page
      2. It can't be easily achieved with your design system + Tailwind
      3. It's complex enough that making it a utility would be overkill
    */
  </style>