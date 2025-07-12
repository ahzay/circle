export interface Circle {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  name: string;
  created_at: Date;
  last_active: Date;
}

export interface Resource {
  id: string;
  circle_id: string;
  created_by: string;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Claim {
  id: string;
  resource_id: string;
  user_id: string;
  start_time: Date;
  end_time: Date;
  is_recurring: boolean;
  recurring_pattern?: 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  joined_at: Date;
  is_active: boolean;
}

export interface CircleEvent {
  type: 'resource_created' | 'resource_updated' | 'resource_deleted' | 
        'claim_created' | 'claim_updated' | 'claim_cancelled' | 'claim_returned' |
        'user_joined';
  data: any;
  timestamp: Date;
}
