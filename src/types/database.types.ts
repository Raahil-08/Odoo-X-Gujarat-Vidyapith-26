export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: 'manager' | 'dispatcher' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: 'manager' | 'dispatcher' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: 'manager' | 'dispatcher' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          vehicle_id: string
          name: string
          model: string | null
          plate_number: string
          max_load_kg: number
          odometer_km: number
          status: 'ON TRIP' | 'IN SHOP' | 'AVAILABLE' | 'COMPLETED'
          current_driver_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          name: string
          model?: string | null
          plate_number: string
          max_load_kg?: number
          odometer_km?: number
          status?: 'ON TRIP' | 'IN SHOP' | 'AVAILABLE' | 'COMPLETED'
          current_driver_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          name?: string
          model?: string | null
          plate_number?: string
          max_load_kg?: number
          odometer_km?: number
          status?: 'ON TRIP' | 'IN SHOP' | 'AVAILABLE' | 'COMPLETED'
          current_driver_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          name: string
          license_number: string | null
          license_expiry: string | null
          phone: string | null
          email: string | null
          completion_rate: number
          safety_score: number
          status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SUSPENDED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          license_number?: string | null
          license_expiry?: string | null
          phone?: string | null
          email?: string | null
          completion_rate?: number
          safety_score?: number
          status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SUSPENDED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          license_number?: string | null
          license_expiry?: string | null
          phone?: string | null
          email?: string | null
          completion_rate?: number
          safety_score?: number
          status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SUSPENDED'
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          trip_id: string
          vehicle_id: string
          driver_id: string
          origin: string
          destination: string
          cargo_weight_kg: number
          estimated_fuel_cost: number
          actual_fuel_cost: number | null
          trip_duration_days: number | null
          stage: 'DRAFT' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          started_at: string | null
          completed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id?: string
          vehicle_id: string
          driver_id: string
          origin: string
          destination: string
          cargo_weight_kg?: number
          estimated_fuel_cost?: number
          actual_fuel_cost?: number | null
          trip_duration_days?: number | null
          stage?: 'DRAFT' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          started_at?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          vehicle_id?: string
          driver_id?: string
          origin?: string
          destination?: string
          cargo_weight_kg?: number
          estimated_fuel_cost?: number
          actual_fuel_cost?: number | null
          trip_duration_days?: number | null
          stage?: 'DRAFT' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          started_at?: string | null
          completed_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          log_id: string
          vehicle_id: string
          service_type: string
          description: string | null
          cost: number
          service_date: string
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          next_service_date: string | null
          odometer_at_service: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          log_id?: string
          vehicle_id: string
          service_type: string
          description?: string | null
          cost?: number
          service_date: string
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          next_service_date?: string | null
          odometer_at_service?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          log_id?: string
          vehicle_id?: string
          service_type?: string
          description?: string | null
          cost?: number
          service_date?: string
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          next_service_date?: string | null
          odometer_at_service?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fuel_entries: {
        Row: {
          id: string
          vehicle_id: string
          trip_id: string | null
          liters: number
          cost: number
          price_per_liter: number
          entry_date: string
          odometer_km: number | null
          station_name: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          trip_id?: string | null
          liters: number
          cost: number
          entry_date?: string
          odometer_km?: number | null
          station_name?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          trip_id?: string | null
          liters?: number
          cost?: number
          entry_date?: string
          odometer_km?: number | null
          station_name?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          vehicle_id: string | null
          trip_id: string | null
          category: 'FUEL' | 'MAINTENANCE' | 'TOLL' | 'PARKING' | 'REPAIR' | 'INSURANCE' | 'OTHER'
          description: string
          amount: number
          expense_date: string
          receipt_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id?: string | null
          trip_id?: string | null
          category: 'FUEL' | 'MAINTENANCE' | 'TOLL' | 'PARKING' | 'REPAIR' | 'INSURANCE' | 'OTHER'
          description: string
          amount: number
          expense_date?: string
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string | null
          trip_id?: string | null
          category?: 'FUEL' | 'MAINTENANCE' | 'TOLL' | 'PARKING' | 'REPAIR' | 'INSURANCE' | 'OTHER'
          description?: string
          amount?: number
          expense_date?: string
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      fleet_dashboard_stats: {
        Row: {
          active_fleet_count: number | null
          maintenance_alerts_count: number | null
          available_count: number | null
          total_fleet_count: number | null
          utilization_rate: number | null
        }
      }
      vehicles_with_driver: {
        Row: {
          id: string
          vehicle_id: string
          name: string
          model: string | null
          plate_number: string
          max_load_kg: number
          odometer_km: number
          status: 'ON TRIP' | 'IN SHOP' | 'AVAILABLE' | 'COMPLETED'
          current_driver_id: string | null
          created_at: string
          updated_at: string
          driver_name: string | null
          driver_license: string | null
          driver_status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SUSPENDED' | null
        }
      }
      trip_details: {
        Row: {
          id: string
          trip_id: string
          vehicle_id: string
          driver_id: string
          origin: string
          destination: string
          cargo_weight_kg: number
          estimated_fuel_cost: number
          actual_fuel_cost: number | null
          trip_duration_days: number | null
          stage: 'DRAFT' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          started_at: string | null
          completed_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          vehicle_code: string
          vehicle_name: string
          plate_number: string
          driver_name: string
          driver_license: string | null
        }
      }
    }
    Functions: {
      generate_trip_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_maintenance_log_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
  }
}
