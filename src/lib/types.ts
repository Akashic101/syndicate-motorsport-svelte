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

export interface ChampionshipInsert {
  name?: string;
  description?: string;
  season?: number;
  image_path?: string;
  start_date?: string;
  end_date?: string;
  round_count?: number;
  status?: string;
  sign_up_link?: string;
  championship_id?: string;
  server?: string;
}

export interface ChampionshipUpdate {
  name?: string;
  description?: string;
  season?: number;
  image_path?: string;
  start_date?: string;
  end_date?: string;
  round_count?: number;
  status?: string;
  sign_up_link?: string;
  championship_id?: string;
  server?: string;
}
