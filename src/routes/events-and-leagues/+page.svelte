<script lang="ts">
    import { Card, Badge, Button, Input } from 'flowbite-svelte';

    // Props from server
    let { data } = $props<{ 
        data: { 
            championships: any[],
            error?: string
        } 
    }>();

    // Search state
    let searchQuery = $state('');

    // Date formatting function
    function formatDate(dateString: string): string {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Format date range
    function formatDateRange(startDate: string, endDate: string): string {
        if (!startDate && !endDate) return '';
        if (startDate && endDate) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        } else if (startDate) {
            return `Starts ${formatDate(startDate)}`;
        } else if (endDate) {
            return `Ends ${formatDate(endDate)}`;
        }
        return '';
    }

    // Sort championships by status and date
    function sortChampionships(championships: any[]): any[] {
        return championships.sort((a, b) => {
            // First sort by status: planned (0), running (1), finished (2)
            const statusOrder = { 'planned': 0, 'running': 1, 'finished': 2 };
            const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
            const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
            
            if (statusA !== statusB) {
                return statusA - statusB;
            }
            
            // Within each status group, sort by date (most recent first)
            const getSortDate = (championship: any) => {
                // Use end_date if available, otherwise start_date
                const dateStr = championship.end_date || championship.start_date;
                if (!dateStr) return new Date(0); // Very old date for championships without dates
                
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? new Date(0) : date;
            };
            
            const dateA = getSortDate(a);
            const dateB = getSortDate(b);
            
            // Sort by date descending (most recent first)
            return dateB.getTime() - dateA.getTime();
        });
    }

    // Filtered and sorted championships
    let filteredChampionships = $derived(sortChampionships(data.championships.filter((championship: any) => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            championship.name.toLowerCase().includes(query) ||
            championship.description.toLowerCase().includes(query) ||
            championship.season.toLowerCase().includes(query)
        );
    })));

    function navigateToLeague(championshipId: string) {
        window.location.href = `/events-and-leagues/${championshipId}`;
    }

    function handleImageError(event: Event) {
        const target = event.target as HTMLImageElement;
        if (target) {
            target.style.display = 'none';
        }
    }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Events and Leagues
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
            Discover all available championships and racing leagues - Search enabled!
        </p>
        
        <!-- Search Bar -->
        <div class="max-w-md relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>
            <input
                bind:value={searchQuery}
                type="text"
                placeholder="Search championships..."
                class="block w-full pl-10 pr-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
        </div>
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
    {:else if filteredChampionships.length === 0}
        <Card>
            <div class="text-center py-8">
                <h2 class="text-xl font-bold mb-2">No Results Found</h2>
                <p class="text-gray-600">Try adjusting your search terms or browse all championships.</p>
                <Button 
                    color="gray" 
                    class="mt-4"
                    onclick={() => searchQuery = ''}
                >
                    Clear Search
                </Button>
            </div>
        </Card>
    {:else}
        <!-- Search Results Info -->
        {#if searchQuery.trim()}
            <div class="mb-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Found {filteredChampionships.length} championship{filteredChampionships.length === 1 ? '' : 's'} matching "{searchQuery}"
                </p>
            </div>
        {/if}
        
        <!-- Leagues Grid with Status Sections -->
        <div class="space-y-8">
            {#each ['planned', 'running', 'finished'] as status}
                {@const statusChampionships = filteredChampionships.filter(c => c.status === status)}
                {#if statusChampionships.length > 0}
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            {#if status === 'planned'}
                                <span class="w-3 h-3 bg-yellow-400 rounded-full"></span>
                                Planned Championships
                            {:else if status === 'running'}
                                <span class="w-3 h-3 bg-green-400 rounded-full"></span>
                                Running Championships
                            {:else if status === 'finished'}
                                <span class="w-3 h-3 bg-gray-400 rounded-full"></span>
                                Finished Championships
                            {/if}
                            <span class="text-sm font-normal text-gray-500">({statusChampionships.length})</span>
                        </h2>
                        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {#each statusChampionships as championship}
                <Card class="hover:shadow-lg transition-shadow duration-200">
                    {#if championship.image_path}
                        <div class="h-48 overflow-hidden rounded-t-lg">
                            <img 
                                src={championship.image_path} 
                                alt={championship.name}
                                class="w-full h-full object-cover"
                                onerror={handleImageError}
                            />
                        </div>
                    {/if}
                    
                    <div class="p-6">
                        <h2 class="font-semibold text-xl mb-3 text-gray-900 dark:text-white">
                            {championship.name}
                        </h2>
                        
                        <div class="flex flex-wrap gap-2 mb-3">
                            {#if championship.season}
                                <Badge color="blue">{championship.season}</Badge>
                            {/if}
                            {#if championship.status}
                                <Badge color={championship.status === 'running' ? 'green' : championship.status === 'finished' ? 'gray' : 'yellow'}>
                                    {championship.status.charAt(0).toUpperCase() + championship.status.slice(1)}
                                </Badge>
                            {/if}
                            {#if championship.round_count > 0}
                                <Badge color="purple">{championship.round_count} Rounds</Badge>
                            {/if}
                        </div>
                        
                        <p class="text-gray-600 dark:text-gray-400 mb-4">
                            {championship.description}
                        </p>
                        
                        <!-- Date Information -->
                        {#if championship.start_date || championship.end_date}
                            <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <p>📅 {formatDateRange(championship.start_date, championship.end_date)}</p>
                            </div>
                        {/if}
                        
                        <!-- Sign-up Link for Running Leagues -->
                        {#if championship.status === 'running' && championship.sign_up_link}
                            <div class="mb-4">
                                <a 
                                    href={championship.sign_up_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800"
                                >
                                    Sign Up Now
                                </a>
                            </div>
                        {/if}
                        
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
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
    </div>
</div>
