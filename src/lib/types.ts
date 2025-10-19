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
  server: string | null;
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
