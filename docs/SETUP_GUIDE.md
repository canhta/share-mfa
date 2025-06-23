# MFA Share - Complete Setup Guide

This guide will walk you through setting up all the required credentials and services for the MFA Share application.

## 📋 Prerequisites

- Node.js 18+ installed
- A Google account
- Basic understanding of environment variables

## 🗂️ Required Services & Credentials

You'll need accounts and credentials from:

1. **Supabase** (Database & Authentication)
2. **Google Cloud Console** (OAuth Authentication)

---

## 🔧 Step 1: Supabase Setup

### 1.1 Create Supabase Account & Project

1. **Visit Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project" or "Sign up"
   - Sign up using GitHub, Google, or email

2. **Create New Project**
   - Click "New Project"
   - Choose your organization (create one if needed)
   - Fill in project details:
     - **Name**: `mfa-share` (or any name you prefer)
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Choose closest to your location
   - Click "Create new project"
   - Wait 2-3 minutes for project setup

### 1.2 Get Supabase Credentials

1. **Navigate to Project Settings**
   - In your Supabase dashboard, click the gear icon ⚙️ (Settings)
   - Go to "API" section

2. **Copy Required Values**

   ```
   Project URL: https://[your-project-ref].supabase.co
   Anon (public) key: eyJ... (long string starting with eyJ)
   ```

3. **Save These Values** - You'll need them for your `.env.local` file

### 1.3 Setup Database Schema

1. **Open SQL Editor**
   - In Supabase dashboard, go to "SQL Editor"
   - Click "New query"

2. **Run Database Migration**
   - Copy the entire contents of `sql/migrations/001_initial_schema.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

3. **Verify Tables Created**
   - Go to "Table Editor"
   - You should see the `mfa_entries` table

---

## 🔐 Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. **Visit Google Cloud Console**
   - Go to [https://console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: `mfa-share` (or any name)
   - Click "Create"
   - Select your new project

### 2.2 Enable Required APIs

1. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

2. **Enable People API** (recommended)
   - Search for "People API"
   - Click on it and press "Enable"

### 2.3 Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - Navigate to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Click "Create"

2. **Fill Required Information**

   ```
   App name: MFA Share
   User support email: your-email@example.com
   Developer contact: your-email@example.com
   ```
   - Click "Save and Continue"

3. **Scopes** (optional for development)
   - Click "Save and Continue" (no additional scopes needed)

4. **Test Users** (for development)
   - Add your email address as a test user
   - Click "Save and Continue"

### 2.4 Create OAuth Credentials

1. **Create Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"

2. **Configure OAuth Client**

   ```
   Application type: Web application
   Name: MFA Share Web Client

   Authorized JavaScript origins:
   - http://localhost:3000 (for development)
   - https://yourdomain.com (for production)

   Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback (for development)
   - https://yourdomain.com/api/auth/callback (for production)
   ```

3. **Save Client ID**
   - Copy the "Client ID" (starts with numbers and ends with `.apps.googleusercontent.com`)
   - Copy the "Client Secret" (you'll need this for Supabase)

### 2.5 Configure Supabase Authentication

1. **Go to Supabase Authentication**
   - In your Supabase project, go to "Authentication" > "Sign In / Providers"

2. **Enable Google Provider**
   - Find "Google" in the list
   - Toggle it "Enabled"
   - Enter your Google OAuth credentials:
     ```
     Client ID: [Your Google Client ID from step 2.4]
     Client Secret: [Your Google Client Secret from step 2.4]
     ```

3. **Set Redirect URL**
   - The redirect URL should be automatically filled:
   - `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Copy this URL

4. **Update Google OAuth Settings**
   - Go back to Google Cloud Console > Credentials
   - Edit your OAuth 2.0 Client ID
   - Add the Supabase redirect URL to "Authorized redirect URIs"
   - Click "Save"

---

## 🌍 Step 3: Environment Variables Setup

### 3.1 Update Your `.env.local` File

Replace the placeholder values in your `.env.local` file with the real credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-anon-key]

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[your-google-client-id].apps.googleusercontent.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Replace Placeholder Values

Replace the bracketed values with your actual credentials:

- `[your-project-ref]`: Your Supabase project reference (from Supabase API settings)
- `[your-anon-key]`: Your Supabase anonymous key (from Supabase API settings)
- `[your-google-client-id]`: Your Google OAuth Client ID (from Google Cloud Console)

### 3.3 Example of Correct Values

Here's what your values should look like (with fake examples):

```env
# ✅ Correct format
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMTcwNjQ5MSwiZXhwIjoxOTQ3MjgyNDkxfQ.fake-signature-here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com

# ❌ Wrong format (placeholders)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🚀 Step 4: Test Your Setup

### 4.1 Restart Development Server

After updating your `.env.local` file:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### 4.2 Verify Each Component

1. **Homepage** (`http://localhost:3000`)
   - Should load without the "Invalid URL" error
   - Theme toggle should work

2. **Login Page** (`http://localhost:3000/login`)
   - Google Sign In button should appear
   - Clicking should redirect to Google OAuth

3. **Authentication Flow**
   - Complete Google sign-in
   - Should redirect to dashboard
   - No console errors

---

## 🔍 Troubleshooting

### Quick Fixes for Common Issues

#### 1. "Invalid URL" Error (Current Issue)

```bash
# Check your .env.local file
cat .env.local

# Make sure URLs start with https:// and keys start with eyJ
# NO quotes around values
# NO spaces around = signs
```

#### 2. Environment Variables Not Loading

```bash
# Restart dev server after changing .env.local
npm run dev

# Check if variables are loaded
node -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

#### 3. Google OAuth Errors

- Verify Client ID ends with `.apps.googleusercontent.com`
- Check redirect URIs match exactly (http vs https)
- Ensure Google APIs are enabled

#### 4. Database Connection Issues

- Verify the SQL migration ran successfully in Supabase
- Check the `mfa_entries` table exists in Table Editor

---

## 📞 Need Help?

If you're still having issues:

1. **Double-check each credential** in Supabase and Google Cloud Console
2. **Verify the format** of your `.env.local` file (no extra quotes or spaces)
3. **Check the console** for specific error messages
4. **Restart the dev server** after any changes to `.env.local`

The most common issue is copying the wrong values or having formatting issues in the `.env.local` file. Make sure each value is on its own line with no extra characters.

---

This guide should resolve the "Invalid URL" error you're seeing. The key is getting the correct Supabase project URL and anon key from your Supabase dashboard.
