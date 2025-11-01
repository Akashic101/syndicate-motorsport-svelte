// Database types for Supabase

export interface Championship {
	id: number;
	name: string | null;
	description: string | null;
	season: number | null;
	image_path: string | null;
	start_date: string | null; // date string
	end_date: string | null; // date string
	round_count: number | null;
	status: string | null;
	sign_up_link: string | null;
	created_at: string; // timestamp with time zone
	championship_id: string | null; // uuid
	server: number | null;
}

export interface Driver {
	id: number;
	created_at: string; // timestamp with time zone
	driver_guid: string | null;
	rank: number | null;
	driver: string | null;
	elo: number | null;
	license: string | null;
	safety_rating: string | null;
}

export interface RaceSession {
	id: number;
	version: number | null;
	session_file: string | null;
	race_date: string | null; // timestamp with time zone
	championship_id: string | null; // uuid
	created_at: string | null; // timestamp with time zone
	track_config: string | null;
	track_name: string | null;
	type: string | null;
	event_name: string | null;
}

export interface RaceCar {
	id: number;
	session_id: number | null;
	car_id: number | null;
	driver_guid: string | null;
	model: string | null;
	skin: string | null;
	ballast_kg: number | null;
	restrictor: number | null;
	class_id: string | null; // uuid
	min_ping: number | null;
	max_ping: number | null;
}

export interface RaceLap {
	id: number;
	session_id: number | null;
	car_id: number | null;
	driver_guid: string | null;
	lap_time: number | null;
	timestamp: number | null; // bigint
	tyre: string | null;
	ballast_kg: number | null;
	restrictor: number | null;
	cuts: number | null;
	contributed_to_fastest_lap: boolean | null;
	class_id: string | null; // uuid
	sector1: number | null;
	sector2: number | null;
	sector3: number | null;
	ambient: number | null;
	road: number | null;
	grip: number | null;
	wind_speed: number | null;
	wind_direction: number | null;
	rain_intensity: number | null;
	rain_wetness: number | null;
	rain_water: number | null;
}
