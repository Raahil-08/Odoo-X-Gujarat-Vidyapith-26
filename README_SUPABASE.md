# Supabase Backend Setup Guide

This guide will help you set up the complete Supabase backend for the Fleet Command Center application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to **Settings** → **API**
   - Copy your **Project URL** and **anon/public key**

3. Update `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Run Database Migration

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run the migration:
   ```bash
   supabase db push
   ```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and click **Run**
5. Run the second migration so the app can read/write without login: copy `supabase/migrations/002_allow_anon_read.sql` and run it in the SQL Editor

## Step 4: Verify Setup

After running the migration, verify that:

1. All tables are created:
   - `profiles`
   - `vehicles`
   - `drivers`
   - `trips`
   - `maintenance_logs`
   - `fuel_entries`
   - `expenses`

2. RLS policies are enabled (check in **Authentication** → **Policies**)

3. Functions are created:
   - `generate_trip_id()`
   - `generate_maintenance_log_id()`
   - `handle_new_user()`
   - `update_vehicle_status_on_trip_change()`
   - `update_vehicle_status_on_maintenance()`

## Step 5: Set Up Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider (or your preferred authentication method)
3. Configure email templates if needed

## Step 6: Create Test Users (Optional)

You can create test users through:
- Supabase Dashboard → **Authentication** → **Users** → **Add User**
- Or use the signup flow in your application

When a user signs up, a profile will be automatically created via the `handle_new_user()` trigger.

## Database Schema Overview

### Tables

- **profiles**: User profiles extending Supabase auth
- **vehicles**: Fleet vehicle information
- **drivers**: Driver information and performance metrics
- **trips**: Trip/dispatch records
- **maintenance_logs**: Vehicle maintenance history
- **fuel_entries**: Fuel consumption tracking
- **expenses**: Operational expense tracking

### Views

- **fleet_dashboard_stats**: Aggregated dashboard KPIs
- **vehicles_with_driver**: Vehicles with current driver info
- **trip_details**: Trips with vehicle and driver details

### Key Features

- **Automatic ID Generation**: Trip IDs (DSP-XXX) and Maintenance Log IDs (MNT-XXX) are auto-generated
- **Status Management**: Vehicle status automatically updates based on trip and maintenance status
- **Row Level Security**: All tables have RLS policies based on user roles (manager, dispatcher, admin)
- **Audit Trail**: All tables track `created_at` and `updated_at` timestamps

## Usage in Your Application

### Import the Supabase Client

```typescript
import { supabase } from '@/lib/supabase';
```

### Use Query Helpers

```typescript
import { getVehicles, createVehicle, updateVehicle } from '@/lib/supabase-queries';

// Get all vehicles
const vehicles = await getVehicles();

// Create a new vehicle
const newVehicle = await createVehicle({
  vehicle_id: 'TRK-007',
  name: 'Mercedes Actros',
  model: '2024',
  plate_number: 'MH-12-AB-9999',
  max_load_kg: 25000,
  odometer_km: 0,
  status: 'AVAILABLE',
});
```

### Authentication

```typescript
import { supabase } from '@/lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'dispatcher',
    },
  },
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## Role-Based Access Control

The application uses three roles:

- **dispatcher**: Can view all data and create/update trips
- **manager**: Can view all data and manage vehicles, drivers, and maintenance
- **admin**: Full access to all operations

Roles are stored in the `profiles` table and checked via RLS policies.

## Troubleshooting

### RLS Policies Not Working

- Ensure RLS is enabled on all tables
- Check that policies are correctly defined
- Verify user authentication is working

### Functions Not Found

- Ensure migrations ran successfully
- Check that functions exist in **Database** → **Functions**

### Type Errors

- Regenerate TypeScript types using Supabase CLI:
  ```bash
  supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
  ```

## Next Steps

1. Update your React components to use the Supabase queries
2. Implement authentication flow
3. Replace mock data with real database queries
4. Add error handling and loading states
5. Implement real-time subscriptions if needed

## Support

For Supabase-specific issues, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
