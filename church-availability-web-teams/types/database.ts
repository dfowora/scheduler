export type AvailabilityStatus = 'available' | 'unavailable' | 'maybe';

export interface Team {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Roster {
  id: string;
  team_id: string;
  name: string;
  created_at: string;
}

export interface Member {
  id: string;
  auth_user_id: string;
  team_id: string;
  full_name: string;
  roles: string[];
  is_coordinator: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  team_id: string;
  roster_id: string | null;
  service_date: string;
  service_time: string;
  title: string;
  notes: string | null;
  created_at: string;
}

export interface Availability {
  id: string;
  member_id: string;
  service_id: string;
  status: AvailabilityStatus;
  preferred_role: string | null;
  updated_at: string;
}

export interface Assignment {
  id: string;
  member_id: string;
  service_id: string;
  role: string;
  confirmed: boolean;
  created_at: string;
}