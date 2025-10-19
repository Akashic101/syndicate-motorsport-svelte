<script lang="ts">
    import { Card, Badge, Button } from 'flowbite-svelte';

    // Props from server
    let { data } = $props<{ 
        data: { 
            championships: any[],
            error?: string
        } 
    }>();

    function navigateToLeague(championshipId: string) {
        window.location.href = `/events-and-leagues/${championshipId}`;
    }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Events and Leagues
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
            Discover all available championships and racing leagues
        </p>
    </div>

    {#if data.error}
        <Card class="mb-6">
            <div class="text-center text-red-600">
                <h2 class="text-xl font-bold mb-2">Error Loading League Data</h2>
                <p>{data.error}</p>
            </div>
        </Card>
    {:else if data.championships.length === 0}
        <Card>
            <div class="text-center py-8">
                <h2 class="text-xl font-bold mb-2">No Leagues Available</h2>
                <p class="text-gray-600">Check back later for new championships and racing leagues.</p>
            </div>
        </Card>
    {:else}
        <!-- Leagues Grid -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {#each data.championships as championship}
                <Card class="hover:shadow-lg transition-shadow duration-200">
                    <div class="p-6">
                        <h2 class="font-semibold text-xl mb-3 text-gray-900 dark:text-white">
                            {championship.name}
                        </h2>
                        
                        {#if championship.season}
                            <Badge color="blue" class="mb-3">{championship.season}</Badge>
                        {/if}
                        
                        <p class="text-gray-600 dark:text-gray-400 mb-4">
                            {championship.description}
                        </p>
                        
                        <Button 
                            color="blue" 
                            class="w-full"
                            onclick={() => navigateToLeague(championship.id)}
                        >
                            View League Details
                        </Button>
                    </div>
                </Card>
            {/each}
        </div>
    {/if}
    </div>
</div>
