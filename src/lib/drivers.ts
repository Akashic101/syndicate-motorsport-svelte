import { supabase } from './supabaseClient';
import type { Driver, DriverOverview } from './types';

// Re-export types for convenience
export type { Driver, DriverOverview } from './types';

// Get all drivers (from 'driver_data' table - using same source as driver detail page)
export async function getAllDrivers(): Promise<DriverOverview[]> {
	try {
		const { data, error } = await supabase
			.from('driver_data')
			.select('id, created_at, driver_guid, rank, driver, elo, license, safety_rating')
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
		let { data, error } = await supabase
			.from('driver_data')
			.select('*')
			.eq('driver_guid', driverGUID)
			.single();

		// If string query fails, try as number
		if (error && error.code === 'PGRST116') {
			const numericGUID = parseInt(driverGUID);
			if (!isNaN(numericGUID)) {
				const result = await supabase
					.from('driver_data')
					.select('*')
					.eq('driver_guid', numericGUID)
					.single();

				data = result.data;
				error = result.error;
			}
		}

		// If still not found, try checking the drivers table as fallback (uses driver_guid)
		if (error && error.code === 'PGRST116') {
			const driversResult = await supabase
				.from('drivers')
				.select('*')
				.eq('driver_guid', driverGUID)
				.single();

			if (driversResult.data) {
				// Driver exists in overview but not in detailed data
				// Return null so we can show a proper error
				return null;
			}

			// Try numeric in drivers table too
			const numericGUID = parseInt(driverGUID);
			if (!isNaN(numericGUID)) {
				const driversNumericResult = await supabase
					.from('drivers')
					.select('*')
					.eq('driver_guid', numericGUID)
					.single();

				if (driversNumericResult.data) {
					return null;
				}
			}
		}

		if (error) {
			if (error.code === 'PGRST116') {
				// No rows returned
				return null;
			}
			console.error(`[getDriverByGUID] Supabase error:`, error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error('[getDriverByGUID] Error fetching driver by GUID:', error);
		throw error;
	}
}

// Get drivers by list of GUIDs (from 'driver_data' table - using same source as driver detail page)
export async function getDriversByGUIDs(
	driverGUIDs: (string | null)[]
): Promise<Map<string, DriverOverview>> {
	try {
		// Filter out nulls and get unique GUIDs
		const validGUIDs = [...new Set(driverGUIDs.filter((guid): guid is string => guid !== null))];

		if (validGUIDs.length === 0) {
			return new Map();
		}

		// Query with 'in' filter - try as strings first
		const { data, error } = await supabase
			.from('driver_data')
			.select('id, created_at, driver_guid, rank, driver, elo, license, safety_rating')
			.in('driver_guid', validGUIDs);

		if (error) {
			throw error;
		}

		// Create a map of driver_guid -> DriverOverview
		const driverMap = new Map<string, DriverOverview>();
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
