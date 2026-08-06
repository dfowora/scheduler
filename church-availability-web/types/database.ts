export type AvailabilityStatus = 'available' | 'unavailable' | 'maybe';

export interface Member {
  id: string;
  auth_user_id: string;
  full_name: string;
  roles: string[];
  is_coordinator: boolean;
  created_at: string;
}

export interface Service {
  id: string;
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
