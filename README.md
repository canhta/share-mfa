# MFA Share - Secure TOTP Code Sharing

A Next.js 15 application for securely sharing TOTP-based multi-factor authentication codes with trusted friends and family members.

## Features

- 🔐 **Secure by Design**: All secrets encrypted at rest, password-protected sharing
- 🔗 **Easy Sharing**: Generate shareable links with customizable expiration
- 🌐 **Google Integration**: Sign in with Google OAuth
- ⚡ **Real-time Codes**: Live TOTP codes with countdown timers
- 📱 **Mobile-First**: Responsive design inspired by Google Authenticator
- 🔒 **Row-Level Security**: Supabase RLS for data protection

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with Google OAuth
- **TOTP**: otplib for code generation
- **Styling**: Tailwind CSS
- **Encryption**: bcrypt for password hashing

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Cloud Console account (for OAuth)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd share-mfa
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the database migration:

```sql
-- Copy and paste the contents of prisma/migrations/001_initial_schema.sql
-- into the Supabase SQL Editor and execute
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback` (development)
   - `https://yourdomain.com/api/auth/callback` (production)

### 4. Supabase Auth Configuration

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth client ID and secret
4. Set the redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

### 5. Environment Variables

Create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### For Owners

1. **Sign in** with your Google account
2. **Add MFA entries** by:
   - Importing TOTP URIs from QR codes
   - Manually entering secrets
   - Auto-generating new secrets
3. **Share entries** by:
   - Clicking the share button on any entry
   - Configuring password protection and expiration
   - Copying the generated share link

### For Viewers

1. **Open the shared link** you received
2. **Enter password** if required
3. **View live TOTP codes** with countdown timer
4. **Copy codes** by clicking on them

## API Routes

- `GET /api/mfa` - List user's MFA entries
- `POST /api/mfa` - Create new MFA entry
- `GET /api/mfa/[id]` - Get specific MFA entry
- `PUT /api/mfa/[id]` - Update MFA entry
- `DELETE /api/mfa/[id]` - Delete MFA entry
- `POST /api/share/generate` - Generate share link
- `POST /api/share/validate` - Validate share token
- `GET /api/auth/callback` - OAuth callback
- `POST /api/auth/logout` - Sign out

## Security Features

- **Encryption**: All TOTP secrets encrypted at rest
- **Password Protection**: Optional password protection for shared links
- **Expiration**: Configurable link expiration (1 hour to 1 week)
- **Row-Level Security**: Database-level access control
- **HTTPS Only**: Secure cookie handling
- **Input Validation**: All API endpoints validate input

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Security Considerations

- Only share MFA codes with trusted individuals
- Use strong passwords for protected links
- Be cautious with embedded password links (less secure)
- Regularly review and revoke expired shares
- Consider the security implications before sharing sensitive accounts

## Support

For issues and questions, please open a GitHub issue or contact the maintainers.
