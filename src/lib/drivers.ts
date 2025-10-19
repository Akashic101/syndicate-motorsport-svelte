import { supabase } from './supabaseClient';
import type { Driver, DriverInsert, DriverUpdate } from './types';

// Re-export types for convenience
export type { Driver, DriverInsert, DriverUpdate } from './types';

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
export async function getDriverByGUID(driverGUID: number): Promise<Driver | null> {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .eq('driver_guid', driverGUID)
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
        console.error('Error fetching driver by GUID:', error);
        throw error;
    }
}

// Get driver by ID
export async function getDriverById(id: number): Promise<Driver | null> {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .eq('id', id)
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
        console.error('Error fetching driver by ID:', error);
        throw error;
    }
}

// Add new driver
export async function addDriver(driver: DriverInsert): Promise<Driver> {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .insert(driver)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error adding driver:', error);
        throw error;
    }
}

// Update driver
export async function updateDriver(id: number, updates: DriverUpdate): Promise<Driver> {
    try {
        const { data, error } = await supabase
            .from('drivers')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error updating driver:', error);
        throw error;
    }
}

// Delete driver
export async function deleteDriver(id: number): Promise<void> {
    try {
        const { error } = await supabase
            .from('drivers')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error deleting driver:', error);
        throw error;
    }
}
