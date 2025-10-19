import type { PageServerLoad } from './$types';
import { getChampionshipById } from '$lib/championships';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const leagueId = params.leagueId;
        console.log('Loading league data for ID:', leagueId);
        
        // Get championship info from database first
        const championshipData = await getChampionshipById(leagueId);
        
        // API endpoint for championship standings
        const apiUrl = `http://138.201.226.34:8092/championship/${leagueId}/standings.json`;
        
        // Required cookies for API access
        const cookies = '_acsm_cookies=MTc0Nzg1OTMzOXxEWDhFQVFMX2dBQUJFQUVRQUFCTF80QUFBUVp6ZEhKcGJtY01Fd0FSWTI5dmEybGxYM0J5WldabGNtVnVZMlVtYW5WemRHRndaVzVuZFM1cGJpOWhZM050TDNZeUxtTnZiMnRwWlZCeVpXWmxjbVZ1WTJVRUFnQUF8c5I9dyF55nVxW655zZ7S0IdWNJDT1sXrq3ne7IVPAOM=; current-server=MTc2MDY0MTMxM3xEWDhFQVFMX2dBQUJFQUVRQUFBZF80QUFBUVp6ZEhKcGJtY01DQUFHYzJWeWRtVnlBMmx1ZEFRQ0FBQT18PUUhNaCcQhKZ1mpmWoxn_E61XSo3W5OsZSWlsNrCPkY=; _acsm_data=MTc2MDg3MTAxMnxEWDhFQVFMX2dBQUJFQUVRQUFCSV80QUFBUVp6ZEhKcGJtY01EQUFLWVdOamIzVnVkRjlwWkFaemRISnBibWNNSmdBa09UUTJNREUzTUdFdE56ZGtOUzAwTURrNUxUaGtZakF0TWpZd1pqTTNObVpqTkdObXyRtI9abzBy2JMbkbd45_uk_H_so1UwpBys8wPL4Svr7w==';
        
        // Fetch data from API
        const response = await fetch(apiUrl, {
            headers: {
                'Cookie': cookies,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch championship data: ${response.status} ${response.statusText}`);
        }
        
        const apiData = await response.json();
        
        // Process driver standings data - handle both data structures
        const driverStandings = apiData.DriverStandings?.[""] || apiData.DriverStandings?.["All"] || [];
        const drivers = driverStandings.map((driver: any, index: number) => ({
            position: index + 1,
            name: driver.Car.Driver.Name,
            team: driver.Car.Driver.Team || '',
            nation: driver.Car.Driver.Nation || '',
            car: driver.Car.Model,
            points: driver.Points,
            ballast: driver.Car.BallastKG,
            restrictor: driver.Car.Restrictor
        }));
        
        // Process team standings data - handle both data structures
        const teamStandings = apiData.TeamStandings?.[""] || apiData.TeamStandings?.["All"] || [];
        const teams = teamStandings.map((team: any, index: number) => ({
            position: index + 1,
            name: team.Team,
            points: team.Points
        }));
        
        // Use championship data from database, or fallback to generic info
        const championship = championshipData || {
            id: leagueId,
            name: `Championship ${leagueId}`,
            description: 'Championship standings from API',
            season: '2024',
            discord_invite: null,
            website: null
        };
        
        // Calculate stats
        const stats = {
            driverCount: drivers.length,
            teamCount: teams.length
        };
        
        return {
            championship,
            drivers,
            teams,
            races: [], // Empty array for compatibility
            stats
        };
        
    } catch (error) {
        console.error('Error loading league data:', error);
        throw error;
    }
};
