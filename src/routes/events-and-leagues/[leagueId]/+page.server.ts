import type { PageServerLoad } from './$types';
import { getChampionshipByChampionshipId } from '$lib/championships';
import { getServerById } from '$lib/servers';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const leagueId = params.leagueId;
        
        // Get championship info from database using championship_id (UUID)
        const championshipData = await getChampionshipByChampionshipId(leagueId);
        
        if (!championshipData) {
            throw new Error(`Championship not found for ID: ${leagueId}`);
        }
        
        if (!championshipData.server) {
            throw new Error(`Server ID not configured for championship: ${championshipData.name || leagueId}`);
        }
        
        // Get server configuration from database using server ID
        const serverId = championshipData.server;
        
        if (!serverId) {
            throw new Error(`Server ID not found for championship: ${championshipData.name || leagueId}`);
        }
        
        const serverData = await getServerById(serverId);
        
        if (!serverData || !serverData.cookie || !serverData.url) {
            throw new Error(`Server configuration not found or cookies/URL not configured for server ID: ${serverId}`);
        }
        
        // API endpoint for championship standings using championship_id from URL
        // Remove trailing slash from server URL to avoid double slashes
        const baseUrl = serverData.url.endsWith('/') ? serverData.url.slice(0, -1) : serverData.url;
        const apiUrl = `${baseUrl}/championship/${leagueId}/standings.json`;
        
        // Use cookies from database
        const cookies = serverData.cookie;
        
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
        
        // Process driver standings data - handle multiple data structures
        let driverStandings = [];
        if (apiData.DriverStandings) {
            // Try different possible keys for driver standings
            const possibleKeys = ["", "All", "Super GT Vs DTM", "Rookies", "GT500", "60s WSC 2L", "TCL 70s", "1923 GP", "WSC 1967 5L+"];
            for (const key of possibleKeys) {
                if (apiData.DriverStandings[key]) {
                    driverStandings = apiData.DriverStandings[key];
                    break;
                }
            }
        }
        
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
        
        // Process team standings data - handle multiple data structures
        let teamStandings = [];
        if (apiData.TeamStandings) {
            // Try different possible keys for team standings
            const possibleKeys = ["", "All", "Super GT Vs DTM", "Rookies", "GT500", "60s WSC 2L", "TCL 70s", "1923 GP", "WSC 1967 5L+"];
            for (const key of possibleKeys) {
                if (apiData.TeamStandings[key]) {
                    teamStandings = apiData.TeamStandings[key];
                    break;
                }
            }
        }
        
        const teams = teamStandings.map((team: any, index: number) => ({
            position: index + 1,
            name: team.Team,
            points: team.Points
        }));
        
        // Use championship data from database
        const championship = championshipData;
        
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