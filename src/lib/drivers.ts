import { supabase } from './supabaseClient';
import type { Driver } from './types';

// Re-export types for convenience
export type { Driver } from './types';

// Get all drivers
export async function getAllDrivers(): Promise<Driver[]> {
	try {
		const { data, error } = await supabase
			.from('drivers')
			.select('*')
			.order('rank', { ascending: true });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error('Error fetching drivers:', error);
		throw error;
	}
}

// Get driver by GUID
export async function getDriverByGUID(driverGUID: string): Promise<Driver | null> {
	try {
		// Try as string first
		let { data, error } = await supabase
			.from('drivers')
			.select('*')
			.eq('driver_guid', driverGUID)
			.single();

		if (error && error.code === 'PGRST116') {
			// If string query fails, try as number
			const numericGUID = parseInt(driverGUID);
			if (!isNaN(numericGUID)) {
				const result = await supabase
					.from('drivers')
					.select('*')
					.eq('driver_guid', numericGUID)
					.single();

				data = result.data;
				error = result.error;
			}
		}

		if (error) {
			if (error.code === 'PGRST116') {
				// No rows returned
				return null;
			}
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error fetching driver by GUID:', error);
		throw error;
	}
}

// Get drivers by list of GUIDs
export async function getDriversByGUIDs(
	driverGUIDs: (string | null)[]
): Promise<Map<string, Driver>> {
	try {
		// Filter out nulls and get unique GUIDs
		const validGUIDs = [...new Set(driverGUIDs.filter((guid): guid is string => guid !== null))];

		if (validGUIDs.length === 0) {
			return new Map();
		}

		// Query with 'in' filter - try as strings first
		const { data, error } = await supabase
			.from('drivers')
			.select('*')
			.in('driver_guid', validGUIDs);

		if (error) {
			throw error;
		}

		// Create a map of driver_guid -> Driver
		const driverMap = new Map<string, Driver>();
		if (data) {
			for (const driver of data) {
				if (driver.driver_guid) {
					driverMap.set(String(driver.driver_guid), driver);
				}
			}
		}

		return driverMap;
	} catch (error) {
		console.error('Error fetching drivers by GUIDs:', error);
		return new Map();
	}
}
