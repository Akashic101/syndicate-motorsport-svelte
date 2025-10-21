import type { PageServerLoad } from './$types';
import { getEvents } from '$lib/events';
import { getRaceStats } from '$lib/stats';
import { getAllChampionships } from '$lib/championships';
import type { Championship } from '$lib/types';

type EventItem = {
	title: string;
	href: string;
	time: number; // timestamp in milliseconds
};

type Stats = {
	discordMembers: number;
	totalRaces: number;
	simGames: number;
	yearsOfExperience: number;
};

export const load: PageServerLoad = async () => {
	
	try {
		const dbEvents = await getEvents();
		
		const events: EventItem[] = dbEvents.map(dbEvent => ({
			title: dbEvent.event || '',
			href: '',
			time: dbEvent.time
		})).filter(event => event.title);

		// Get championships/leagues
		const championships = await getAllChampionships();
		
		// Filter for running and planned championships (status is 'active', 'planned', or null/undefined)
		const activeChampionships = championships.filter(champ => 
			!champ.status || 
			champ.status.toLowerCase() === 'running' || 
			champ.status.toLowerCase() === 'planned'
		);

		// Get dynamic stats
		const raceStats = await getRaceStats();
		
		// Get Discord member count
		let discordMembers = 850; // Fallback
		try {
			// Use the Discord API directly instead of our endpoint during SSR
			const response = await fetch(
				`https://discord.com/api/v9/invites/c3N6ZkAEue?with_counts=true&with_expiration=true`,
				{
					method: 'GET',
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
					}
				}
			);
			
			if (response.ok) {
				const data = await response.json();
				discordMembers = data.approximate_member_count || 850;
			}
		} catch (error) {
			console.error('Error fetching Discord stats:', error);
		}

		const stats: Stats = {
			discordMembers,
			totalRaces: raceStats.totalRaces,
			simGames: raceStats.totalSimGames,
			yearsOfExperience: raceStats.yearsOfExperience
		};

		return { events, championships: activeChampionships, stats };
	} catch (error) {
		console.error('Error loading events:', error);
		return { 
			events: [],
			championships: [],
			stats: {
				discordMembers: 850,
				totalRaces: 1673,
				simGames: 3,
				yearsOfExperience: 4
			}
		};
	}
};
