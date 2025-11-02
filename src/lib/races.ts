import { supabase } from './supabaseClient';
import type { RaceSession, RaceCar, RaceLap } from './types';

// Re-export types for convenience
export type { RaceSession, RaceCar, RaceLap } from './types';

// Get race sessions with pagination
export async function getRaceSessions(
	limit?: number,
	offset?: number
): Promise<{ data: RaceSession[]; total: number }> {
	try {
		let query = supabase
			.from('race_sessions')
			.select('*', { count: 'exact' })
			.order('race_date', { ascending: false, nullsFirst: false });

		if (limit !== undefined && offset !== undefined) {
			// range is inclusive on both ends, so offset to offset+limit-1
			query = query.range(offset, offset + limit - 1);
		} else if (limit !== undefined) {
			query = query.limit(limit);
		}

		const { data, error, count } = await query;

		if (error) {
			throw error;
		}

		return {
			data: data || [],
			total: count || 0
		};
	} catch (error) {
		console.error('Error fetching race sessions:', error);
		throw error;
	}
}

// Get all race sessions (for backwards compatibility)
export async function getAllRaceSessions(): Promise<RaceSession[]> {
	const result = await getRaceSessions();
	return result.data;
}

// Get race session by ID
export async function getRaceSessionById(sessionId: number): Promise<RaceSession | null> {
	try {
		const { data, error } = await supabase
			.from('race_sessions')
			.select('*')
			.eq('id', sessionId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				// No rows returned
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error fetching race session by ID:', error);
		throw error;
	}
}

// Get race cars for a session
export async function getRaceCarsBySessionId(sessionId: number): Promise<RaceCar[]> {
	try {
		const { data, error } = await supabase
			.from('race_cars')
			.select('*')
			.eq('session_id', sessionId)
			.order('car_id', { ascending: true });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching race cars:', error);
		throw error;
	}
}

// Get race laps for a session
export async function getRaceLapsBySessionId(sessionId: number): Promise<RaceLap[]> {
	try {
		const { data, error } = await supabase
			.from('race_laps')
			.select('*')
			.eq('session_id', sessionId)
			.order('timestamp', { ascending: true });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching race laps:', error);
		throw error;
	}
}

// Get race sessions by championship_id
export async function getRaceSessionsByChampionshipId(
	championshipId: string
): Promise<RaceSession[]> {
	try {
		const { data, error } = await supabase
			.from('race_sessions')
			.select('*')
			.eq('championship_id', championshipId)
			.order('race_date', { ascending: false, nullsFirst: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching race sessions by championship ID:', error);
		throw error;
	}
}
