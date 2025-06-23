Complete Requirements Specification for MFA-Sharing App
Guide for an AI-driven (Cursor) agent to scaffold and implement

⸻

1. Project Overview
   • Objective: Build a lightweight Next.js 15 application with Supabase backend that allows users to create, manage, and securely share TOTP-based MFA entries with friends.
   • User Roles:
   • Owner: Authenticates via Google SSO, manages their MFA entries (create, update, delete, share).
   • Viewer: Accesses a shared link (with or without embedded password), enters password if required, and views live TOTP codes in read-only mode.

⸻

2. Technology Stack
   • Framework: Next.js 15 (App Router)
   • Backend & Auth: Supabase (PostgreSQL + Supabase Auth)
   • TOTP Generation: otplib (or equivalent TOTP library)
   • SSO Providers:
   • Mandatory: Google (via Supabase Auth)
   • Optional: OneLogin (OIDC integration)

⸻

3. Authentication & Session Management
   1. Google SSO
      • Enable “Sign in with Google” in Supabase Auth dashboard.
      • On first login, persist user_id, email, and profile metadata.
   2. Session Handling
      • Leverage Supabase client’s session cookie for SSR and protected API routes.

⸻

4. Data Model

Table: mfa_entries

Column Type Notes
id UUID Primary key
user_id UUID FK → auth.users
name Text User-defined label
secret Text Encrypted TOTP secret
notes Text Optional user notes
share_password Text Hashed (bcrypt/argon2); nullable if open link
share_token Text Unique opaque or JWT; expires per configuration
require_password Boolean If true, viewer must enter password
embed_password_in_link Boolean If true, password appended to URL as query parameter
created_at Timestamp Auto-populated
updated_at Timestamp Auto-populated

⸻

5. MFA Entry Management
   • Create:
   • Generate a new TOTP secret.
   • Accept name, notes.
   • Read:
   • List all entries for current user with name, “Share” action, notes preview, and live TOTP code/countdown.
   • Update:
   • Edit name, notes.
   • Optionally regenerate secret.
   • Reset share settings (require_password, embed_password_in_link, share_password).
   • Delete:
   • Remove entry and invalidate any active share_token.

⸻

6. Sharing Workflow
   1. Generate Share Link
      • API: POST /api/share/generate
      • Request Body:

{
"mfaEntryId": "<UUID>",
"requirePassword": true | false,
"embedPasswordInLink": true | false,
"password": "<plaintext>" /_ required if either flag is true _/,
"expirationHours": <number>
}

    •	Response:

{
"shareToken": "<string>",
"shareUrl": "https://app.example.com/share/<token>?p=<encryptedPwd>"
}

    •	Behavior:
    •	If requirePassword && !embedPasswordInLink: Viewer must enter password at access.
    •	If embedPasswordInLink: Password auto-verified via ?p= query.
    •	If both flags false: Link grants open, read-only access.

    2.	Viewer Access
    •	Route: GET /share/[token]
    •	Flow:
    1.	Validate shareToken and expiry.
    2.	Handle password logic per flags:
    •	Prompt input if requirePassword && !embedPasswordInLink.
    •	Auto-verify if embedPasswordInLink.
    •	Skip if open link.
    3.	On success, render entry details and live TOTP code (read-only).
    4.	On failure, show “Invalid token or password” with retry link.
    3.	Security Notes
    •	Hash share_password (bcrypt/argon2).
    •	Encrypt secret at rest.
    •	Use HTTPS and secure cookies.
    •	Warn owners about risks of embedding passwords in URLs (exposed in logs).

⸻

7. User Interface & UX
   • Design Inspiration: Google Authenticator—minimal, list-based.
   • Pages/Components:
   1. Login Page: Google SSO button.
   2. Dashboard:
      • MFA list with live codes.
      • “Add New” button launches a form modal.
   3. Entry Form (Modal/Page): Fields for name, notes, secret import (QR/paste URI).
   4. Share Modal: Options to configure password flags, expiration, and generate link.
   5. Share View: Public read-only display of entry name, notes, and live code.
      • Mobile-First: Responsive styling, simple layouts, clear prompts.

⸻

8. Integrations
   • TOTP Import: Allow scanning of Google Authenticator QR codes or manual URI paste.
   • OneLogin: Support manual secret import or OIDC provisioning if required.

⸻

9. Deliverables for AI Agent
   1. Project Scaffold:
      • npx create-next-app@latest --experimental-app
      • Configure Supabase client and environment variables.
   2. Database Migration: SQL script for mfa_entries table with all fields.
   3. Auth Setup:
      • Supabase Auth configuration for Google SSO.
      • Optional OIDC stub for OneLogin.
   4. API Routes:
      • CRUD: /api/mfa/[create|list|update|delete]
      • Sharing: /api/share/generate, /api/share/validate
   5. React Components:
      • Dashboard list, Entry form, Share modal, Share view.
      • TOTP timer hook/component.
   6. Security Utilities:
      • Encryption/decryption helpers for secrets.
      • Password hashing utilities.
   7. Testing:
      • End-to-end tests covering login, CRUD, and share flows.

⸻

This comprehensive, concise specification equips a Cursor agent to generate boilerplate, implement core features, and guide further refinements.

Refer: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
