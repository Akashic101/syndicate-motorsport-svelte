import { supabase } from './supabaseClient';

// Lap Record type matching the Supabase schema
export interface LapRecord {
  id: number;
  created_at: string;
  driver_guid: string | null;
  track_name: string | null;
  car_model: string | null;
  platform: string | null;
  best_lap: string | null;
  driver: string | null;
  best_lap_num: number | null;
  lap_time: string | null;
}


// Get all lap records from Supabase
export async function getLapRecords(limit?: number, offset?: number): Promise<LapRecord[]> {
  try {
    let query = supabase
      .from('lap_records')
      .select('*')
      .order('lap_time', { ascending: true });

    // Apply pagination if parameters are provided
    if (limit !== undefined) {
      const start = offset || 0;
      const end = start + limit - 1;
      query = query.range(start, end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lap records:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching lap records:', error);
    throw error;
  }
}

// Get all lap records with automatic pagination (handles datasets > 1000 records)
export async function getAllLapRecords(): Promise<LapRecord[]> {
  const allRecords: LapRecord[] = [];
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await getLapRecords(batchSize, offset);
    allRecords.push(...batch);
    
    // If we got fewer records than requested, we've reached the end
    hasMore = batch.length === batchSize;
    offset += batchSize;
  }
  return allRecords;
}

// Get lap records by driver GUID
export async function getLapRecordsByDriver(driverGUID: string): Promise<LapRecord[]> {
  try {
    const { data, error } = await supabase
      .from('lap_records')
      .select('*')
      .eq('driver_guid', driverGUID)
      .order('lap_time', { ascending: true });

    if (error) {
      console.error('Error fetching lap records by driver:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching lap records by driver:', error);
    throw error;
  }
}

// Get lap records by track name
export async function getLapRecordsByTrack(trackName: string): Promise<LapRecord[]> {
  try {
    const { data, error } = await supabase
      .from('lap_records')
      .select('*')
      .eq('track_name', trackName)
      .order('lap_time', { ascending: true });

    if (error) {
      console.error('Error fetching lap records by track:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching lap records by track:', error);
    throw error;
  }
}

// Get lap records by car model
export async function getLapRecordsByCar(carModel: string): Promise<LapRecord[]> {
  try {
    const { data, error } = await supabase
      .from('lap_records')
      .select('*')
      .eq('car_model', carModel)
      .order('lap_time', { ascending: true });

    if (error) {
      console.error('Error fetching lap records by car:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching lap records by car:', error);
    throw error;
  }
}

// Get lap records by platform
export async function getLapRecordsByPlatform(platform: string): Promise<LapRecord[]> {
  try {
    const { data, error } = await supabase
      .from('lap_records')
      .select('*')
      .eq('platform', platform)
      .order('lap_time', { ascending: true });

    if (error) {
      console.error('Error fetching lap records by platform:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching lap records by platform:', error);
    throw error;
  }
}

// Get unique track names
export async function getTrackNames(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('lap_records')
      .select('track_name')
      .not('track_name', 'is', null);

    if (error) {
      console.error('Error fetching track names:', error);
      throw error;
    }

    // Extract unique track names
    const uniqueTracks = [...new Set((data || []).map(record => record.track_name).filter(Boolean))];
    return uniqueTracks.sort();
  } catch (error) {
    console.error('Error fetching track names:', error);
    throw error;
  }
}

// Get unique car models
export async function getCarModels(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('lap_records')
      .select('car_model')
      .not('car_model', 'is', null);

    if (error) {
      console.error('Error fetching car models:', error);
      throw error;
    }

    // Extract unique car models
    const uniqueCars = [...new Set((data || []).map(record => record.car_model).filter(Boolean))];
    return uniqueCars.sort();
  } catch (error) {
    console.error('Error fetching car models:', error);
    throw error;
  }
}

// Get unique platforms
export async function getPlatforms(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('lap_records')
      .select('platform')
      .not('platform', 'is', null);

    if (error) {
      console.error('Error fetching platforms:', error);
      throw error;
    }

    // Extract unique platforms
    const uniquePlatforms = [...new Set((data || []).map(record => record.platform).filter(Boolean))];
    return uniquePlatforms.sort();
  } catch (error) {
    console.error('Error fetching platforms:', error);
    throw error;
  }
}
