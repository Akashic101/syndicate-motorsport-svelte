import { supabase } from './supabaseClient';
import type { Championship } from './types';

// Get all championships
export async function getAllChampionships(): Promise<Championship[]> {
	try {
		const { data, error } = await supabase
			.from('championships')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching championships:', error);
		throw error;
	}
}

// Get championship by ID
export async function getChampionshipById(id: number): Promise<Championship | null> {
	try {
		const { data, error } = await supabase.from('championships').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') {
				// No rows returned
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error fetching championship by ID:', error);
		throw error;
	}
}

// Get championship by championship_id (UUID)
export async function getChampionshipByChampionshipId(
	championshipId: string
): Promise<Championship | null> {
	try {
		const { data, error } = await supabase
			.from('championships')
			.select('*')
			.eq('championship_id', championshipId)
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
		console.error('Error fetching championship by championship_id:', error);
		throw error;
	}
}
