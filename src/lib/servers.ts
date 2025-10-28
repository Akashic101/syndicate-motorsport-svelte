import { supabase } from './supabaseClient';

// Server type matching the Supabase schema
export interface Server {
	id: number;
	created_at: string;
	name: string | null;
	url: string | null;
	cookie: string | null;
	description: string | null;
	owner: string | null;
	live_timing: string | null;
	direct_join: string | null;
}

// Get server by ID
export async function getServerById(id: number): Promise<Server | null> {
	try {
		const { data, error } = await supabase.from('servers').select('*').eq('id', id).single();

		if (error) {
			if (error.code === 'PGRST116') {
				// No rows returned
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error fetching server by ID:', error);
		throw error;
	}
}

// Get server by URL (kept for backward compatibility)
export async function getServerByUrl(url: string): Promise<Server | null> {
	try {
		const { data, error } = await supabase.from('servers').select('*').eq('url', url).single();

		if (error) {
			if (error.code === 'PGRST116') {
				// No rows returned
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error fetching server by URL:', error);
		throw error;
	}
}

// Get all servers
export async function getAllServers(): Promise<Server[]> {
	try {
		const { data, error } = await supabase
			.from('servers')
			.select('*')
			.order('created_at', { ascending: false });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching servers:', error);
		throw error;
	}
}
