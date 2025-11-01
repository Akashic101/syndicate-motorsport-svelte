import { supabase } from './supabaseClient';
import type { RaceSession, RaceCar, RaceLap } from './types';

// Re-export types for convenience
export type { RaceSession, RaceCar, RaceLap } from './types';

// Get all race sessions
export async function getAllRaceSessions(): Promise<RaceSession[]> {
	try {
		const { data, error } = await supabase
			.from('race_sessions')
			.select('*')
			.order('race_date', { ascending: false, nullsFirst: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching race sessions:', error);
		throw error;
	}
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

