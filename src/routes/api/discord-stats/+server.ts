import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Discord server invite code (extract from your Discord invite URL)
const DISCORD_INVITE_CODE = 'c3N6ZkAEue'; // From your Discord link: https://discord.gg/c3N6ZkAEue

export const GET: RequestHandler = async () => {
	try {
		// Use Discord's internal API to get server stats
		const response = await fetch(
			`https://discord.com/api/v9/invites/${DISCORD_INVITE_CODE}?with_counts=true&with_expiration=true`,
			{
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
				}
			}
		);

		if (!response.ok) {
			console.error('Discord API error:', response.status, response.statusText);
			// Return fallback count if API fails
			return json({ memberCount: 850 });
		}

		const data = await response.json();
		const memberCount = data.approximate_member_count || 850;

		return json({ memberCount });
	} catch (error) {
		console.error('Error fetching Discord member count:', error);
		// Return fallback count if request fails
		return json({ memberCount: 850 });
	}
};
