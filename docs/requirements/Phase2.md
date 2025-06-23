# Phase 2 Requirements: Extending the MFA-Sharing App

This document outlines the next phase of development, building upon the foundation established in Phase 1.

---

## 1. Feature Extensions

### 1.1. User Management (Admin Role)

*   **Objective:** Introduce an administrative role to manage users within the application.
*   **User Roles:**
    *   **Admin:** Can view all users, and manage their status (e.g., activate/deactivate).
    *   **User:** Standard user with capabilities defined in Phase 1.
*   **Implementation Details:**
    *   Add a `role` column to the `auth.users` table or a related `profiles` table (e.g., `role TEXT DEFAULT 'user'`).
    *   The first user or a designated user will be manually updated to `admin` in the Supabase dashboard.
    *   Create a new section in the dashboard, visible only to admins, at `/admin/users`.
    *   This admin view will list all registered users and provide controls to manage them.

---

### 1.2. Pricing Page

*   **Objective:** Create a public-facing pricing page to showcase different subscription tiers. This will be a static/mock page for now.
*   **Route:** `/pricing`
*   **Tiers:**
    *   **Free:**
        *   Up to 5 MFA entries.
        *   Standard sharing features.
        *   Community support.
    *   **Pro:**
        *   Unlimited MFA entries.
        *   Advanced sharing controls (e.g., detailed analytics on shared links).
        *   Priority email support.
        *   **Price:** $5/month
    *   **Enterprise:**
        *   All "Pro" features.
        *   Team management and shared workspaces.
        *   Audit logs.
        *   Single Sign-On (SSO) with providers like OneLogin.
        *   **Price:** Custom (Contact Sales)
*   **Component:** A new `PricingPage` component will be created to display these tiers in a visually appealing comparison table.

---

### 1.3. QR Code Scanning for MFA Setup

*   **Objective:** Allow users to add a new MFA entry by scanning a QR code directly within the app.
*   **Integration:**
    *   Use a client-side QR code scanning library (e.g., `react-qr-reader` or a similar modern equivalent).
    *   The "Add New MFA" modal/form will include a "Scan QR Code" button.
    *   This button will activate the device's camera to scan a code.
*   **Workflow:**
    1.  User clicks "Scan QR Code".
    2.  The app requests camera permissions.
    3.  Upon scanning a valid `otpauth://` QR code, the app will parse the URI.
    4.  The `name` (from the label) and `secret` from the URI will be used to pre-fill the "Add New MFA" form fields.
    5.  The user can then save the new entry.

---

### 1.4. Enhanced Sharing: Share Status Management

*   **Objective:** Give owners more control over their shared links by introducing a status system.
*   **Data Model Changes:**
    *   It's recommended to create a new table, `shared_links`, to better manage shares instead of adding more columns to `mfa_entries`.
    *   **Table: `shared_links`**
        *   `id`: UUID, Primary Key
        *   `mfa_entry_id`: UUID, FK to `mfa_entries`
        *   `share_token`: TEXT, Unique
        *   `status`: TEXT (`active`, `revoked`)
        *   `expires_at`: TIMESTAMP
        *   ... (other sharing options from Phase 1 like `require_password`, etc.)
*   **Workflow:**
    *   When a user generates a share link, a new record is created in `shared_links` with `status = 'active'`.
    *   The dashboard will be updated to show a list of active shares for each MFA entry.
    *   Owners will have a "Revoke" button next to each shared link.
    *   Clicking "Revoke" will update the link's `status` to `revoked`.
    *   The `/api/share/validate` endpoint and the `/share/[token]` page logic will be updated to check the `status` of the token in the `shared_links` table. Access will be denied if the status is `revoked`.

---

## 2. Deliverables for AI Agent

1.  **Database Migration:**
    *   SQL script to add a `role` to users.
    *   SQL script to create the new `shared_links` table and migrate existing sharing data if necessary.
2.  **API Route Updates:**
    *   Modify `/api/share/generate` and `/api/share/validate` to use the new `shared_links` table.
    *   Create a new API route `/api/admin/users` for user management, protected for admin-only access.
    *   Create a new API route `/api/shares/[id]/revoke` to update the status of a share.
3.  **React Components:**
    *   `PricingPage` component.
    *   `UserManagementTable` component for the admin dashboard.
    *   Integration of a QR scanner component into the `AddMfaEntry` modal.
    *   `ShareStatusDashboard` component to view and manage active shares.
4.  **Security & UI Enhancements:**
    *   Update middleware to protect admin routes.
    *   UI warnings and confirmations for revoking shared links.
