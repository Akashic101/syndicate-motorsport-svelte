import { supabase } from './supabaseClient';

export interface TrackAlias {
	id: number;
	created_at: string;
	original_name: string | null;
	fixed_name: string | null;
}

// Normalize track name for matching (trim, lowercase, remove extra spaces)
function normalizeTrackName(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Get all track aliases from Supabase
export async function getAllTrackAliases(): Promise<TrackAlias[]> {
	try {
		const { data, error } = await supabase
			.from('track_alias')
			.select('*')
			.order('original_name', { ascending: true });

		if (error) {
			throw error;
		}
		return data || [];
	} catch (error) {
		console.error('Error fetching track aliases:', error);
		throw error;
	}
}

// Create a plain object for serialization (SvelteKit can't serialize Maps)
export function createTrackAliasObject(aliases: TrackAlias[]): Record<string, string> {
	const aliasObject: Record<string, string> = {};

	for (const alias of aliases) {
		if (alias.original_name && alias.fixed_name) {
			// Normalize the original name for case-insensitive matching
			const normalizedOriginal = normalizeTrackName(alias.original_name);
			aliasObject[normalizedOriginal] = alias.fixed_name;
		}
	}

	return aliasObject;
}

// Helper function: Get fixed track name from original name
// This is the main function to use - it takes the original track name and returns the fixed name
export function getFixedTrackName(
	originalName: string | null,
	aliasMap: Record<string, string>
): string | null {
	if (!originalName) {
		return null;
	}

	// Normalize the input name for matching
	const normalized = normalizeTrackName(originalName);

	// Look up the fixed name
	const fixedName = aliasMap[normalized];
	// Return fixed name if found, otherwise return original
	return fixedName || originalName;
}
