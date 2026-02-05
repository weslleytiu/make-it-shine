# Supabase Setup Guide

This guide will help you set up Supabase for the CRM Antigravity project.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: CRM Antigravity (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Find the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Replace:
   - `https://your-project-id.supabase.co` with your **Project URL**
   - `your-anon-key-here` with your **anon public** key

## Step 4: Run the Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `docs/supabase-migration.sql` from this project
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click "Run" (or press Ctrl/Cmd + Enter)
7. Wait for the migration to complete

This will create:
- Three tables: `clients`, `professionals`, `jobs`
- Indexes for better query performance
- Row Level Security (RLS) policies
- Triggers for automatic `updated_at` timestamps

## Step 5: Verify the Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see three tables: `clients`, `professionals`, `jobs`
3. Check that the tables have the correct columns

## Step 6: Start the Application

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application should now connect to Supabase instead of localStorage!

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure you've created a `.env` file (not just `.env.example`)
- Verify that the variable names start with `VITE_`
- Restart your development server after creating/updating `.env`

### Error: "Failed to fetch clients"
- Check that your Supabase project is active (not paused)
- Verify your Project URL and anon key are correct
- Check the browser console for more detailed error messages
- In Supabase dashboard, check **Logs** → **API** for server-side errors

### RLS Policy Errors
- If you're getting permission errors, check that the RLS policies were created correctly
- For development, the migration includes policies for `anon` users
- For production, you should implement proper authentication and user-specific policies

### Data Not Showing
- Check the Supabase **Table Editor** to see if data exists
- Check the browser console for any errors
- Verify that the table names match exactly: `clients`, `professionals`, `jobs`

## Next Steps

- **Authentication**: Implement user authentication to replace the anon policies
- **Data Migration**: If you have existing data in localStorage, create a migration script
- **Type Generation**: Generate TypeScript types from your Supabase schema (see Supabase docs)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
