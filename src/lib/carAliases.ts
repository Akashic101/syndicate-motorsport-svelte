import { supabase } from './supabaseClient';

export interface CarAlias {
	id: number;
	created_at: string;
	original_name: string | null;
	fixed_name: string | null;
}

// Normalize car name for matching (trim, lowercase, remove extra spaces)
function normalizeCarName(name: string): string {
	return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Get all car aliases from Supabase
export async function getAllCarAliases(): Promise<CarAlias[]> {
	try {
		const { data, error } = await supabase
			.from('car_alias')
			.select('*')
			.order('original_name', { ascending: true });

		if (error) {
			throw error;
		}
		return data || [];
	} catch (error) {
		console.error('Error fetching car aliases:', error);
		throw error;
	}
}

// Create a plain object for serialization (SvelteKit can't serialize Maps)
export function createCarAliasObject(aliases: CarAlias[]): Record<string, string> {
	const aliasObject: Record<string, string> = {};

	for (const alias of aliases) {
		if (alias.original_name && alias.fixed_name) {
			// Normalize the original name for case-insensitive matching
			const normalizedOriginal = normalizeCarName(alias.original_name);
			aliasObject[normalizedOriginal] = alias.fixed_name;
		}
	}

	return aliasObject;
}

// Helper function: Get fixed car name from original name
// This is the main function to use - it takes the original car name and returns the fixed name
export function getFixedCarName(
	originalName: string | null,
	aliasMap: Record<string, string>
): string | null {
	if (!originalName) {
		return null;
	}

	// Normalize the input name for matching
	const normalized = normalizeCarName(originalName);

	// Look up the fixed name
	const fixedName = aliasMap[normalized];
	// Return fixed name if found, otherwise return original
	return fixedName || originalName;
}
