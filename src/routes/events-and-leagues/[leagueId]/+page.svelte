<script lang="ts">
	import { Card, Badge, Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	import { getChampionshipOGData } from '$lib/og';
	import { getSupabaseImageUrl } from '$lib/imageUtils';
	import type { RaceSession } from '$lib/types';
	import { getFixedTrackName } from '$lib/trackAliases';
	// Note: Using emoji flags instead of svelte-flags for better compatibility

	// Props from server
	interface RaceWithPodium {
		race: RaceSession;
		podium: Array<{ position: number; driverName: string; driverGUID: string | null }>;
	}

	let { data } = $props<{
		data: {
			championship: any;
			drivers: any[];
			teams: any[];
			races: RaceWithPodium[];
			stats: any;
			trackAliasMap: Record<string, string>;
		};
	}>();

	// Generate Open Graph data for championship page
	const ogData = getChampionshipOGData(data.championship);

	let selectedTab = $state('drivers');

	// Format date for race display (user's local style)
	function formatRaceDate(dateString: string | null): string {
		if (!dateString) return 'N/A';
		try {
			const date = new Date(dateString);
			return date.toLocaleString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return 'Invalid Date';
		}
	}

	// Format track name with config in brackets, using track aliases
	function formatTrackName(trackName: string | null): string {
		const fixedName = getFixedTrackName(trackName, data.trackAliasMap);
		if (!fixedName) return 'N/A';
		return fixedName;
	}

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
		IRL: 'IE', // Ireland
		GBR: 'GB', // Great Britain
		DEU: 'DE', // Germany
		FRA: 'FR', // France
		USA: 'US', // United States
		AUT: 'AT', // Austria
		POL: 'PL', // Poland
		FIN: 'FI', // Finland
		ITA: 'IT', // Italy
		NRU: 'NR', // Nauru
		SCT: 'GB', // Scotland (using GB)
		ENG: 'GB', // England (using GB)
		ALB: 'AL', // Albania
		PHL: 'PH', // Philippines
		UKR: 'UA', // Ukraine
		HUN: 'HU', // Hungary
		NLD: 'NL', // Netherlands
		AUS: 'AU', // Australia
		SWE: 'SE', // Sweden
		LVA: 'LV', // Latvia
		LTU: 'LT', // Lithuania
		EST: 'EE', // Estonia
		CZE: 'CZ', // Czech Republic
		SVK: 'SK', // Slovakia
		CRO: 'HR', // Croatia
		BEL: 'BE', // Belgium
		BGR: 'BG', // Bulgaria
		ROU: 'RO', // Romania
		SRB: 'RS', // Serbia
		MNE: 'ME', // Montenegro
		MKD: 'MK', // Macedonia
		GEO: 'GE', // Georgia
		JER: 'JE', // Jersey
		CAN: 'CA', // Canada
		BLR: 'BY', // Belarus
		MDA: 'MD', // Moldova
		ARM: 'AM', // Armenia
		AZE: 'AZ', // Azerbaijan
		TUR: 'TR', // Turkey
		SYR: 'SY', // Syria
		JOR: 'JO', // Jordan
		QAT: 'QA', // Qatar
		KWT: 'KW', // Kuwait
		BHR: 'BH', // Bahrain
		OMN: 'OM', // Oman
		ARE: 'AE', // United Arab Emirates
		TTO: 'TT', // Trinidad and Tobago
		BRA: 'BR', // Brazil
		PRT: 'PT', // Portugal
		WLS: 'GB', // Wales
		OTH: 'EU', // Other
		'': '' // Empty string
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

	// Function to get country flag emoji
	function getCountryFlag(countryCode: string): string {
		if (!countryCode) return '';
		const codePoints = countryCode
			.toUpperCase()
			.split('')
			.map((char) => 127397 + char.charCodeAt(0));
		return String.fromCodePoint(...codePoints);
	}
</script>

<svelte:head>
	<title>{ogData.title}</title>
	<meta name="description" content={ogData.description} />
	<meta property="og:title" content={ogData['og:title']} />
	<meta property="og:description" content={ogData['og:description']} />
	<meta property="og:image" content={ogData['og:image']} />
	<meta property="og:url" content={ogData['og:url']} />
	<meta property="og:type" content={ogData['og:type']} />
	<meta property="og:site_name" content={ogData['og:site_name']} />
	<meta property="og:locale" content={ogData['og:locale']} />

	<meta name="twitter:card" content={ogData['twitter:card']} />
	<meta name="twitter:title" content={ogData['twitter:title']} />
	<meta name="twitter:description" content={ogData['twitter:description']} />
	<meta name="twitter:image" content={ogData['twitter:image']} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Breadcrumb -->
		<Breadcrumb class="mb-6">
			<BreadcrumbItem home href="/">Home</BreadcrumbItem>
			<BreadcrumbItem href="/events-and-leagues">Events and Leagues</BreadcrumbItem>
			<BreadcrumbItem>
				{data.championship.name}
			</BreadcrumbItem>
		</Breadcrumb>

		<!-- Championship Header -->
		<div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Championship Info Card -->
			<Card class="min-w-xl">
				<div class="text-center">
					<h1 class="m-3 text-3xl font-bold text-gray-900 dark:text-white">
						{data.championship.name}
					</h1>
					<div class="mb-4 flex flex-wrap justify-center gap-2">
						{#if data.championship.season}
							<Badge color="blue">Season {data.championship.season}</Badge>
						{/if}
						{#if data.championship.status}
							<Badge
								color={data.championship.status === 'running'
									? 'green'
									: data.championship.status === 'finished'
										? 'gray'
										: 'yellow'}
							>
								{data.championship.status.charAt(0).toUpperCase() +
									data.championship.status.slice(1)}
							</Badge>
						{/if}
						{#if data.championship.round_count > 0}
							<Badge color="purple">{data.championship.round_count} Rounds</Badge>
						{/if}
					</div>

					<p class="mb-4 text-gray-600 dark:text-gray-400">
						{data.championship.description}
					</p>

					<!-- Date and Round Information -->
					{#if data.championship.start_date || data.championship.end_date || data.championship.round_count > 0}
						<div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
							{#if data.championship.start_date || data.championship.end_date}
								<p>
									📅 {formatDateRange(data.championship.start_date, data.championship.end_date)}
								</p>
							{/if}
						</div>
					{/if}

					<!-- External Links -->
					<div class="mb-4 flex justify-center space-x-4">
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
								class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none dark:focus:ring-green-800"
							>
								Sign Up Now
							</a>
						{/if}
					</div>

					{#if data.stats}
						<div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-2">
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

			<!-- Championship Image Card -->
			<Card class="min-w-xl">
				<div class="text-center">
					{#if data.championship.image_path}
						{@const imageUrl =
							getSupabaseImageUrl(data.championship.image_path) || '/images/events_and_leagues.jpg'}
						<div class="flex h-full items-center justify-center">
							<img
								src={imageUrl}
								alt={data.championship.name || 'Championship Image'}
								class="max-h-full max-w-full rounded-lg object-contain shadow-lg"
							/>
						</div>
					{:else}
						<div
							class="flex h-full min-h-[300px] items-center justify-center text-gray-400 dark:text-gray-600"
						>
							<div class="text-center">
								<div class="mb-4 text-6xl">🏁</div>
								<p class="text-lg">No image available</p>
							</div>
						</div>
					{/if}
				</div>
			</Card>
		</div>

		<!-- Navigation Tabs -->
		<div class="mb-6">
			<div class="border-b border-gray-200 dark:border-gray-700">
				<nav class="-mb-px flex space-x-8">
					<button
						class="border-b-2 px-1 py-2 text-sm font-medium {selectedTab === 'drivers'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						onclick={() => (selectedTab = 'drivers')}
					>
						Driver Standings
					</button>
					<button
						class="border-b-2 px-1 py-2 text-sm font-medium {selectedTab === 'teams'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						onclick={() => (selectedTab = 'teams')}
					>
						Team Standings
					</button>
					<button
						class="border-b-2 px-1 py-2 text-sm font-medium {selectedTab === 'races'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						onclick={() => (selectedTab = 'races')}
					>
						Races
					</button>
				</nav>
			</div>
		</div>

		<!-- Tab Content -->
		<div class="w-full">
			{#if selectedTab === 'drivers'}
				<div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
					<h2 class="mb-6 text-xl font-bold text-gray-900 dark:text-white">Driver Standings</h2>
					{#if processedDrivers.length === 0}
						<p class="py-8 text-center text-gray-400">No driver data available.</p>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
								<thead
									class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400"
								>
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
										<tr
											class="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
										>
											<td
												class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
											>
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
				<div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
					<h2 class="mb-6 text-xl font-bold text-gray-900 dark:text-white">Team Standings</h2>
					{#if processedTeams.length === 0}
						<p class="py-8 text-center text-gray-400">No team data available.</p>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
								<thead
									class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400"
								>
									<tr>
										<th scope="col" class="px-6 py-3">Position</th>
										<th scope="col" class="px-6 py-3">Team</th>
										<th scope="col" class="px-6 py-3">Points</th>
									</tr>
								</thead>
								<tbody>
									{#each processedTeams as team}
										<tr
											class="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
										>
											<td
												class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
											>
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
			{:else if selectedTab === 'races'}
				<div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
					<h2 class="mb-6 text-xl font-bold text-gray-900 dark:text-white">Championship Races</h2>
					{#if data.races.length === 0}
						<p class="py-8 text-center text-gray-400">
							No race data available for this championship.
						</p>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
								<thead
									class="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400"
								>
									<tr>
										<th scope="col" class="px-6 py-3">Event Name</th>
										<th scope="col" class="px-6 py-3">Track</th>
										<th scope="col" class="px-6 py-3">Race Date</th>
										<th scope="col" class="px-6 py-3">Podium</th>
									</tr>
								</thead>
								<tbody>
									{#each data.races as raceWithPodium}
										<tr
											class="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
										>
											<td class="px-6 py-4">
												<a
													data-umami-event="navigate-to-race-details"
													data-umami-event-race-id={raceWithPodium.race.id}
													href="/race/{raceWithPodium.race.id}"
													class="font-semibold text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
												>
													{raceWithPodium.race.event_name || 'N/A'}
												</a>
											</td>
											<td class="px-6 py-4">
												{formatTrackName(raceWithPodium.race.track_name)}
											</td>
											<td class="px-6 py-4">
												{formatRaceDate(raceWithPodium.race.race_date)}
											</td>
											<td class="px-6 py-4">
												{#if raceWithPodium.podium && raceWithPodium.podium.length > 0}
													{#each raceWithPodium.podium as podiumDriver, index}
														{#if index > 0},
														{/if}
														{@const isLast = index === raceWithPodium.podium.length - 1}
														{#if podiumDriver.driverGUID && podiumDriver.driverGUID !== 'unknown' && podiumDriver.driverGUID !== null}
															{podiumDriver.position}.
															<a
																data-umami-event="navigate-to-driver-details"
																data-umami-event-driver-guid={podiumDriver.driverGUID}
																href="/driver/{podiumDriver.driverGUID}"
																class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
																>{podiumDriver.driverName}</a
															>
														{:else}
															{podiumDriver.position}. {podiumDriver.driverName}
														{/if}
													{/each}
												{:else}
													N/A
												{/if}
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
