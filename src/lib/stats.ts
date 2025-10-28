import { supabase } from './supabaseClient';

// Get race statistics from Supabase
export async function getRaceStats() {
	try {
		// Get lap records count
		const { count: lapRecordsCount, error: lapRecordsError } = await supabase
			.from('lap_records')
			.select('*', { count: 'exact', head: true });

		if (lapRecordsError) {
			console.error('Error fetching lap records count:', lapRecordsError);
		}

		// Get unique platforms for sim games count
		const { data: platforms, error: platformsError } = await supabase
			.from('lap_records')
			.select('platform')
			.not('platform', 'is', null);

		if (platformsError) {
			console.error('Error fetching platforms:', platformsError);
		}

		const uniquePlatforms = new Set();
		platforms?.forEach((record) => {
			if (record.platform) {
				uniquePlatforms.add(record.platform);
			}
		});

		const totalRaces = lapRecordsCount || 0;

		// Calculate years of experience since October 15, 2020
		const startDate = new Date('2020-10-15');
		const yearsOfExperience = Math.max(
			1,
			Math.floor((Date.now() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
		);

		// If no platforms found, default to 3
		const totalSimGames = uniquePlatforms.size > 0 ? uniquePlatforms.size : 3;

		return {
			totalRaces,
			yearsOfExperience,
			totalSimGames
		};
	} catch (error) {
		console.error('Error fetching race stats:', error);
		// Return fallback values
		return {
			totalRaces: 1673,
			yearsOfExperience: 4,
			totalSimGames: 3
		};
	}
}

// Get Discord member count (this will be called from the API endpoint)
export async function getDiscordMemberCount(): Promise<number> {
	try {
		const response = await fetch('/api/discord-stats');
		const data = await response.json();
		return data.memberCount || 850;
	} catch (error) {
		console.error('Error fetching Discord member count:', error);
		return 850; // Fallback
	}
}
