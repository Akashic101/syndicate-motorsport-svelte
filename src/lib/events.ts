import { supabase } from './supabaseClient';

// Event type matching the Supabase schema
export interface Event {
	id: number;
	created_at: string;
	name: string | null;
	time: string | null;
}

export interface EventRow {
	event: string;
	time: string; // timestamptz string
}

// Convert Supabase Event to EventRow format
function convertToLegacyFormat(event: Event): EventRow {
	return {
		event: event.name || '',
		time: event.time || ''
	};
}

// Get all events from Supabase
export async function getEvents(): Promise<EventRow[]> {
	try {
		const { data, error } = await supabase
			.from('events')
			.select('*')
			.order('time', { ascending: true });

		if (error) {
			console.error('Error fetching events:', error);
			throw error;
		}

		// Convert to legacy format for backward compatibility
		return (data || []).map(convertToLegacyFormat);
	} catch (error) {
		console.error('Error fetching events:', error);
		throw error;
	}
}

// Get events by time range
export async function getEventsByTimeRange(
	startTime: number,
	endTime: number
): Promise<EventRow[]> {
	try {
		// Convert numeric timestamps (milliseconds) to ISO 8601 timestamptz strings
		const startTimeIso = new Date(startTime).toISOString();
		const endTimeIso = new Date(endTime).toISOString();

		const { data, error } = await supabase
			.from('events')
			.select('*')
			.gte('time', startTimeIso)
			.lte('time', endTimeIso)
			.order('time', { ascending: true });

		if (error) {
			console.error('Error fetching events by time range:', error);
			throw error;
		}

		return (data || []).map(convertToLegacyFormat);
	} catch (error) {
		console.error('Error fetching events by time range:', error);
		throw error;
	}
}

// Get upcoming events (events with time greater than current time)
export async function getUpcomingEvents(): Promise<EventRow[]> {
	try {
		// Convert current time (milliseconds) to ISO 8601 timestamptz string
		const currentTimeIso = new Date().toISOString();

		const { data, error } = await supabase
			.from('events')
			.select('*')
			.gte('time', currentTimeIso)
			.order('time', { ascending: true });

		if (error) {
			console.error('Error fetching upcoming events:', error);
			throw error;
		}

		return (data || []).map(convertToLegacyFormat);
	} catch (error) {
		console.error('Error fetching upcoming events:', error);
		throw error;
	}
}

// Add a new event
export async function addEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
	try {
		const { data, error } = await supabase.from('events').insert([event]).select().single();

		if (error) {
			console.error('Error adding event:', error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error adding event:', error);
		throw error;
	}
}

// Update an event
export async function updateEvent(id: number, updates: Partial<Event>): Promise<Event> {
	try {
		const { data, error } = await supabase
			.from('events')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating event:', error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error('Error updating event:', error);
		throw error;
	}
}

// Delete an event
export async function deleteEvent(id: number): Promise<void> {
	try {
		const { error } = await supabase.from('events').delete().eq('id', id);

		if (error) {
			console.error('Error deleting event:', error);
			throw error;
		}
	} catch (error) {
		console.error('Error deleting event:', error);
		throw error;
	}
}
