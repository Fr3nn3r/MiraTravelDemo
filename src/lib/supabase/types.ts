// Database types for Supabase
// These types match the schema defined in supabase/schema.sql

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          status: 'draft' | 'active' | 'archived';
          active_version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          status?: 'draft' | 'active' | 'archived';
          active_version: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          status?: 'draft' | 'active' | 'archived';
          active_version?: string;
          updated_at?: string;
        };
      };
      product_versions: {
        Row: {
          id: string;
          product_id: string;
          version: string;
          hash: string;
          status: 'draft' | 'published';
          config: ProductConfig;
          created_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          version: string;
          hash: string;
          status?: 'draft' | 'published';
          config: ProductConfig;
          created_at?: string;
          published_at?: string | null;
        };
        Update: {
          status?: 'draft' | 'published';
          config?: ProductConfig;
          published_at?: string | null;
        };
      };
      decisions: {
        Row: {
          id: string;
          booking_ref: string;
          flight_no: string;
          flight_date: string;
          passenger_token: string;
          product_id: string;
          product_version: string;
          product_hash: string;
          outcome: 'approved' | 'denied';
          payout_amount_usd: number;
          reason_codes: string[];
          trace: TraceStep[];
          flight_data: FlightData;
          processing_time_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_ref: string;
          flight_no: string;
          flight_date: string;
          passenger_token: string;
          product_id: string;
          product_version: string;
          product_hash: string;
          outcome: 'approved' | 'denied';
          payout_amount_usd: number;
          reason_codes: string[];
          trace: TraceStep[];
          flight_data: FlightData;
          processing_time_ms: number;
          created_at?: string;
        };
        Update: never; // Decisions are immutable
      };
      audit_log: {
        Row: {
          id: string;
          entity_type: 'product' | 'decision';
          entity_id: string;
          action: string;
          actor: string;
          details: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: 'product' | 'decision';
          entity_id: string;
          action: string;
          actor?: string;
          details?: Record<string, unknown>;
          created_at?: string;
        };
        Update: never; // Audit logs are immutable
      };
    };
  };
}

// Re-export types from engine for convenience
interface ProductConfig {
  eligibility: {
    claimWindowHours: number;
  };
  payoutTiers: {
    id: string;
    minDelayMinutes: number;
    maxDelayMinutes: number | null;
    payoutUSD: number;
  }[];
  exclusions: {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  }[];
}

interface TraceStep {
  id: string;
  rule: string;
  description: string;
  result: 'pass' | 'fail' | 'skip';
  explanation: string;
  input: Record<string, unknown>;
}

interface FlightData {
  flightNo: string;
  flightDate: string;
  status: string;
  delayMinutes: number;
  delayReason: string;
}
