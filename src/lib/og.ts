export interface OpenGraphData {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	type?: 'website' | 'article' | 'profile';
	siteName?: string;
	locale?: string;
}

export function generateOpenGraphTags(data: OpenGraphData, baseUrl: string = 'https://syndicate-motorsport.com') {
	const {
		title = 'Syndicate Motorsport - Professional Sim Racing Community',
		description = 'Join Syndicate Motorsport, a professional sim racing community with championships, leagues, and competitive racing across multiple platforms.',
		image = `${baseUrl}/images/home.png`,
		url,
		type = 'website',
		siteName = 'Syndicate Motorsport',
		locale = 'en_US'
	} = data;

	const fullUrl = url ? `${baseUrl}${url}` : baseUrl;

	return {
		// Basic meta tags
		title,
		description,
		
		// Open Graph tags
		'og:title': title,
		'og:description': description,
		'og:image': image,
		'og:url': fullUrl,
		'og:type': type,
		'og:site_name': siteName,
		'og:locale': locale,
		
		// Twitter Card tags
		'twitter:card': 'summary_large_image',
		'twitter:title': title,
		'twitter:description': description,
		'twitter:image': image,
		
		// Additional meta tags
		'robots': 'index, follow',
		'author': 'Syndicate Motorsport',
		'viewport': 'width=device-width, initial-scale=1'
	};
}

export function getDriverOGData(driver: any, baseUrl: string = 'https://syndicate-motorsport.com') {
	return generateOpenGraphTags({
		title: `${driver.driver} - Driver Profile | Syndicate Motorsport`,
		description: `View ${driver.driver}'s racing profile, statistics, and achievements in Syndicate Motorsport championships.`,
		image: `${baseUrl}/images/drivers.jpg`,
		url: `/driver/${driver.driver_guid}`,
		type: 'profile'
	}, baseUrl);
}

export function getChampionshipOGData(championship: any, baseUrl: string = 'https://syndicate-motorsport.com') {
	return generateOpenGraphTags({
		title: `${championship.name} - Championship | Syndicate Motorsport`,
		description: championship.description || `Join the ${championship.name} championship at Syndicate Motorsport. Professional sim racing competition.`,
		image: championship.image_path ? `${baseUrl}${championship.image_path}` : `${baseUrl}/images/events_and_leagues.jpg`,
		url: `/events-and-leagues/${championship.championship_id}`,
		type: 'article'
	}, baseUrl);
}

export function getHomeOGData(stats: any, baseUrl: string = 'https://syndicate-motorsport.com') {
	return generateOpenGraphTags({
		title: 'Syndicate Motorsport - Professional Sim Racing Community',
		description: `Join ${stats.discordMembers}+ members in professional sim racing. ${stats.totalRaces} races completed across ${stats.simGames} platforms.`,
		image: `${baseUrl}/images/home.jpg`,
		type: 'website'
	}, baseUrl);
}

export function getDriversOGData(baseUrl: string = 'https://syndicate-motorsport.com') {
	return generateOpenGraphTags({
		title: 'Driver Rankings | Syndicate Motorsport',
		description: 'View driver rankings, statistics, and profiles of Syndicate Motorsport racing community members.',
		image: `${baseUrl}/images/drivers.jpg`,
		url: '/drivers',
		type: 'website'
	}, baseUrl);
}

export function getLapRecordsOGData(baseUrl: string = 'https://syndicate-motorsport.com') {
	return generateOpenGraphTags({
		title: 'Lap Records | Syndicate Motorsport',
		description: 'View the fastest lap times and records set by Syndicate Motorsport drivers across various tracks and championships.',
		image: `${baseUrl}/images/lap_records.jpg`,
		url: '/lap-records',
		type: 'website'
	}, baseUrl);
}

export function getEventsLeaguesOGData(baseUrl: string = 'https://syndicate-motorsport.com') {
	return generateOpenGraphTags({
		title: 'Events & Leagues | Syndicate Motorsport',
		description: 'Discover upcoming events, championships, and leagues at Syndicate Motorsport. Join competitive sim racing competitions.',
		image: `${baseUrl}/images/events_and_leagues.jpg`,
		url: '/events-and-leagues',
		type: 'website'
	}, baseUrl);
}
