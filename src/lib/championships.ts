import { supabase } from './supabaseClient';
import type { Championship, ChampionshipInsert, ChampionshipUpdate } from './types';

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
        const { data, error } = await supabase
            .from('championships')
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
        console.error('Error fetching championship by ID:', error);
        throw error;
    }
}

// Add new championship
export async function addChampionship(championship: ChampionshipInsert): Promise<Championship> {
    try {
        const { data, error } = await supabase
            .from('championships')
            .insert(championship)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error adding championship:', error);
        throw error;
    }
}

// Update championship
export async function updateChampionship(id: number, updates: ChampionshipUpdate): Promise<Championship> {
    try {
        const { data, error } = await supabase
            .from('championships')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error updating championship:', error);
        throw error;
    }
}

// Delete championship
export async function deleteChampionship(id: number): Promise<void> {
    try {
        const { error } = await supabase
            .from('championships')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error deleting championship:', error);
        throw error;
    }
}