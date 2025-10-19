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

// Legacy type for backward compatibility with existing components
export interface LapRecordRow {
  DriverGUID: string;
  TrackName: string;
  CarModel: string;
  Platform: string;
  BestLap: string;
  Driver: string;
  BestLap_Num: string;
  'Lap Time': string;
}

// Convert Supabase LapRecord to legacy LapRecordRow format
function convertToLegacyFormat(lapRecord: LapRecord): LapRecordRow {
  return {
    DriverGUID: lapRecord.driver_guid || '',
    TrackName: lapRecord.track_name || '',
    CarModel: lapRecord.car_model || '',
    Platform: lapRecord.platform || '',
    BestLap: lapRecord.best_lap || '',
    Driver: lapRecord.driver || '',
    BestLap_Num: lapRecord.best_lap_num?.toString() || '',
    'Lap Time': lapRecord.lap_time || ''
  };
}

// Get all lap records from Supabase
export async function getLapRecords(): Promise<LapRecordRow[]> {
  try {
    const { data, error } = await supabase
      .from('lap_records')
      .select('*')
      .order('lap_time', { ascending: true });

    if (error) {
      console.error('Error fetching lap records:', error);
      throw error;
    }

    // Convert to legacy format for backward compatibility
    return (data || []).map(convertToLegacyFormat);
  } catch (error) {
    console.error('Error fetching lap records:', error);
    throw error;
  }
}

// Get lap records by driver GUID
export async function getLapRecordsByDriver(driverGUID: string): Promise<LapRecordRow[]> {
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

    return (data || []).map(convertToLegacyFormat);
  } catch (error) {
    console.error('Error fetching lap records by driver:', error);
    throw error;
  }
}

// Get lap records by track name
export async function getLapRecordsByTrack(trackName: string): Promise<LapRecordRow[]> {
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

    return (data || []).map(convertToLegacyFormat);
  } catch (error) {
    console.error('Error fetching lap records by track:', error);
    throw error;
  }
}

// Get lap records by car model
export async function getLapRecordsByCar(carModel: string): Promise<LapRecordRow[]> {
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

    return (data || []).map(convertToLegacyFormat);
  } catch (error) {
    console.error('Error fetching lap records by car:', error);
    throw error;
  }
}

// Get lap records by platform
export async function getLapRecordsByPlatform(platform: string): Promise<LapRecordRow[]> {
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

    return (data || []).map(convertToLegacyFormat);
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
