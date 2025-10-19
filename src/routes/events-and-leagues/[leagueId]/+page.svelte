<script lang="ts">
    import { Table } from '@flowbite-svelte-plugins/datatable';
    import type { DataTableOptions } from '@flowbite-svelte-plugins/datatable';
    import {
        Card,
        Badge,
        Button,
        Breadcrumb,
        BreadcrumbItem
    } from 'flowbite-svelte';
    // Note: Using emoji flags instead of svelte-flags for better compatibility

    // Props from server
    let { data } = $props<{ 
        data: { 
            championship: any,
            drivers: any[],
            teams: any[],
            stats: any
        } 
    }>();

    let selectedTab = $state('drivers');

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

    // Country code mapping (3-letter to 2-letter ISO codes)
    const countryCodeMap: Record<string, string> = {
        'IRL': 'IE',  // Ireland
        'GBR': 'GB',  // Great Britain
        'DEU': 'DE',  // Germany
        'FRA': 'FR',  // France
        'USA': 'US',  // United States
        'AUT': 'AT',  // Austria
        'POL': 'PL',  // Poland
        'FIN': 'FI',  // Finland
        'ITA': 'IT',  // Italy
        'NRU': 'NR',  // Nauru
        'SCT': 'GB',  // Scotland (using GB)
        'ENG': 'GB',  // England (using GB)
        'ALB': 'AL',  // Albania
        'PHL': 'PH',  // Philippines
        'UKR': 'UA',  // Ukraine
        'HUN': 'HU',  // Hungary
        'NLD': 'NL',  // Netherlands
        'AUS': 'AU',  // Australia
        'SWE': 'SE',  // Sweden
        'LVA': 'LV',  // Latvia
        'LTU': 'LT',  // Lithuania
        'EST': 'EE',  // Estonia
        'CZE': 'CZ',  // Czech Republic
        'SVK': 'SK',  // Slovakia
        'CRO': 'HR',  // Croatia
        'BEL': 'BE',  // Belgium
        'BGR': 'BG',  // Bulgaria
        'ROU': 'RO',  // Romania
        'SRB': 'RS',  // Serbia
        'MNE': 'ME',  // Montenegro
        'MKD': 'MK',  // Macedonia
        'GEO': 'GE',  // Georgia
        'JER': 'JE',  // Jersey
        'CAN': 'CA',  // Canada
        'BLR': 'BY',  // Belarus
        'MDA': 'MD',  // Moldova
        'ARM': 'AM',  // Armenia
        'AZE': 'AZ',  // Azerbaijan
        'TUR': 'TR',  // Turkey
        'SYR': 'SY',  // Syria
        'JOR': 'JO',  // Jordan
        'QAT': 'QA',  // Qatar
        'KWT': 'KW',  // Kuwait
        'BHR': 'BH',  // Bahrain
        'OMN': 'OM',  // Oman
        'ARE': 'AE',  // United Arab Emirates
        'TTO': 'TT',  // Trinidad and Tobago
        'BRA': 'BR',  // Brazil
        'PRT': 'PT',  // Portugal
        'WLS': 'GB', // Wales
        'OTH': 'EU',  // Other
        '': ''        // Empty string
    };

    // Process driver data to show columns in correct order
    const processedDrivers = data.drivers.map((driver: any) => ({
        position: driver.position,
        name: driver.name,
        team: driver.team || '',
        nation: driver.nation || '',
        nationCode: countryCodeMap[driver.nation] || '',
        car: driver.car || '',
        points: driver.points,
        ballast: driver.ballast || 0,
        restrictor: driver.restrictor || 0
    }));

    // Process team data to show columns in correct order
    const processedTeams = data.teams.map((team: any) => ({
        position: team.position,
        name: team.name,
        points: team.points
    }));

    // DataTable options for drivers
    const driverTableOptions: DataTableOptions = {
        paging: true,
        perPage: 25,
        searchable: true,
        columns: [
            { select: 0, sort: 'asc', hidden: false, type: 'number' }, // Position
            { select: 1, hidden: false, type: 'string' }, // Name
            { select: 2, hidden: false, type: 'string' }, // Team
            { 
                select: 3, 
                hidden: false, 
                type: 'string',
                render: (data: any, row: any) => {
                    if (!row.nationCode || row.nationCode === '') return row.nation || '';
                    return `<div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-size: 16px;">${getCountryFlag(row.nationCode)}</span>
                        <span>${row.nation || ''}</span>
                    </div>`;
                }
            }, // Nation with flag
            { select: 4, hidden: false, type: 'string' }, // Car
            { select: 5, hidden: false, type: 'number' }, // Points
            { select: 6, hidden: false, type: 'number' }, // Ballast
            { select: 7, hidden: false, type: 'number' }  // Restrictor
        ]
    };

    // Function to get country flag emoji
    function getCountryFlag(countryCode: string): string {
        if (!countryCode) return '';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    // DataTable options for teams
    const teamTableOptions: DataTableOptions = {
        paging: true,
        perPage: 25,
        searchable: true,
        columns: [
            { select: 0, sort: 'asc', hidden: false, type: 'number' }, // Position
            { select: 1, hidden: false, type: 'string' }, // Name
            { select: 2, hidden: false, type: 'number' }  // Points
        ]
    };
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Breadcrumb -->
    <Breadcrumb class="mb-6">
        <BreadcrumbItem home href="/">
            Home
        </BreadcrumbItem>
        <BreadcrumbItem href="/events-and-leagues">
            Events and Leagues
        </BreadcrumbItem>
        <BreadcrumbItem>
            {data.championship.name}
        </BreadcrumbItem>
    </Breadcrumb>

    <!-- Championship Header -->
    <Card class="mb-6">
        <div class="text-center">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {data.championship.name}
            </h1>
            <div class="flex flex-wrap justify-center gap-2 mb-4">
                {#if data.championship.season}
                    <Badge color="blue">{data.championship.season}</Badge>
                {/if}
                {#if data.championship.status}
                    <Badge color={data.championship.status === 'running' ? 'green' : data.championship.status === 'finished' ? 'gray' : 'yellow'}>
                        {data.championship.status.charAt(0).toUpperCase() + data.championship.status.slice(1)}
                    </Badge>
                {/if}
                {#if data.championship.round_count > 0}
                    <Badge color="purple">{data.championship.round_count} Rounds</Badge>
                {/if}
            </div>
            
            <p class="text-gray-600 dark:text-gray-400 mb-4">
                {data.championship.description}
            </p>
            
            <!-- Date and Round Information -->
            {#if data.championship.start_date || data.championship.end_date || data.championship.round_count > 0}
                <div class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {#if data.championship.start_date || data.championship.end_date}
                        <p>📅 {formatDateRange(data.championship.start_date, data.championship.end_date)}</p>
                    {/if}
                </div>
            {/if}
            
            <!-- External Links -->
            <div class="flex justify-center space-x-4 mb-4">
                {#if data.championship.discord_invite}
                    <a 
                        href={data.championship.discord_invite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Join Discord Server
                    </a>
                {/if}
                
                {#if data.championship.website}
                    <a 
                        href={data.championship.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Visit Website
                    </a>
                {/if}
                
                {#if data.championship.status === 'running' && data.championship.sign_up_link}
                    <a 
                        href={data.championship.sign_up_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800"
                    >
                        Sign Up Now
                    </a>
                {/if}
            </div>
            
            {#if data.stats}
                <div class="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">{data.stats.driverCount}</div>
                        <div class="text-sm text-gray-600">Drivers</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">{data.stats.teamCount}</div>
                        <div class="text-sm text-gray-600">Teams</div>
                    </div>
                </div>
            {/if}
        </div>
    </Card>

    <!-- Navigation Tabs -->
    <div class="mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="-mb-px flex space-x-8">
                <button 
                    class="py-2 px-1 border-b-2 font-medium text-sm {selectedTab === 'drivers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                    onclick={() => selectedTab = 'drivers'}
                >
                    Driver Standings
                </button>
                <button 
                    class="py-2 px-1 border-b-2 font-medium text-sm {selectedTab === 'teams' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                    onclick={() => selectedTab = 'teams'}
                >
                    Team Standings
                </button>
            </nav>
        </div>
    </div>

    <!-- Tab Content -->
    <div class="w-full">
                {#if selectedTab === 'drivers'}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">Driver Standings</h2>
                {#if processedDrivers.length === 0}
                    <p class="py-8 text-center text-gray-400">No driver data available.</p>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="px-6 py-3">Position</th>
                                    <th scope="col" class="px-6 py-3">Name</th>
                                    <th scope="col" class="px-6 py-3">Team</th>
                                    <th scope="col" class="px-6 py-3">Nation</th>
                                    <th scope="col" class="px-6 py-3">Car</th>
                                    <th scope="col" class="px-6 py-3">Points</th>
                                    <th scope="col" class="px-6 py-3">Ballast (kg)</th>
                                    <th scope="col" class="px-6 py-3">Restrictor (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each processedDrivers as driver}
                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {driver.position}
                                        </td>
                                        <td class="px-6 py-4">
                                            {driver.name}
                                        </td>
                                        <td class="px-6 py-4">
                                            {driver.team}
                                        </td>
                                        <td class="px-6 py-4">
                                            {#if driver.nationCode && driver.nationCode !== ''}
                                                <div class="flex items-center gap-2">
                                                    <span class="text-lg">{getCountryFlag(driver.nationCode)}</span>
                                                    <span>{driver.nation}</span>
                                                </div>
                                            {:else}
                                                {driver.nation}
                                            {/if}
                                        </td>
                                        <td class="px-6 py-4">
                                            {driver.car}
                                        </td>
                                        <td class="px-6 py-4 font-medium">
                                            {driver.points}
                                        </td>
                                        <td class="px-6 py-4">
                                            {driver.ballast}
                                        </td>
                                        <td class="px-6 py-4">
                                            {driver.restrictor}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        {:else if selectedTab === 'teams'}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold mb-6 text-gray-900 dark:text-white">Team Standings</h2>
                {#if processedTeams.length === 0}
                    <p class="py-8 text-center text-gray-400">No team data available.</p>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="px-6 py-3">Position</th>
                                    <th scope="col" class="px-6 py-3">Team</th>
                                    <th scope="col" class="px-6 py-3">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each processedTeams as team}
                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {team.position}
                                        </td>
                                        <td class="px-6 py-4">
                                            {team.name}
                                        </td>
                                        <td class="px-6 py-4 font-medium">
                                            {team.points}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
    </div>
</div>
