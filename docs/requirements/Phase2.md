# Phase 2 Requirements: Core User Experience & Monetization

This document outlines Phase 2 development, focusing on core user features, onboarding, billing, and enhanced MFA functionality.

---

## 1. Feature Extensions

### 1.1. Pricing Page

*   **Objective:** Create a public-facing pricing page to showcase different subscription tiers. This will be a static/mock page for now.
*   **Route:** `/pricing`
*   **Tiers:**
    *   **Free:**
        *   Up to 5 MFA entries.
        *   Up to 10 code shares per month.
        *   Standard sharing features.
        *   Community support.
    *   **Pro:**
        *   Unlimited MFA entries.
        *   Unlimited code shares.
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
*   **Lead Capture:** Include a newsletter signup form and "Contact Sales" form for Enterprise tier to capture potential leads and user interest.

---

### 1.2. Usage Tracking and Limits

*   **Objective:** Implement usage tracking to enforce the free tier limitations on code sharing.
*   **Data Model:**
    *   Add a `user_tier` column to track subscription level (`free`, `pro`, `enterprise`).
    *   Create a `usage_tracking` table to monitor monthly share usage:
        *   `id`: UUID, Primary Key
        *   `user_id`: UUID, FK to auth.users
        *   `month`: DATE (YYYY-MM-01 format)
        *   `shares_count`: INTEGER, default 0
        *   `created_at`: TIMESTAMP
        *   `updated_at`: TIMESTAMP
*   **Implementation:**
    *   Track each share generation in the usage table.
    *   Before generating a new share, check if the user has exceeded their monthly limit.
    *   Reset counters monthly for free tier users.
    *   Display usage statistics in the dashboard (e.g., "7/10 shares used this month").

---

### 1.3. User Onboarding and Profile Setup

*   **Objective:** Create a seamless onboarding experience for new users after Google/SSO authentication.
*   **Flow:**
    *   Upon first sign-in with Google/SSO, users are automatically assigned the `free` tier.
    *   Redirect new users to an onboarding flow to complete their profile setup.
*   **Onboarding Pages:**
    *   `/onboarding/welcome` - Welcome screen with app overview and benefits.
    *   `/onboarding/profile` - Basic profile information setup.
    *   `/onboarding/complete` - Onboarding completion with option to upgrade or continue with free tier.
*   **Profile Configuration:**
    *   Display name (optional, defaults to Google profile name)
    *   Company/Organization (optional)
    *   Use case preferences (personal, business, team)
    *   Communication preferences (newsletter, product updates)
    *   Invitation code (optional) - for referral system (Phase 4 integration)
*   **Implementation:**
    *   Check if user has completed onboarding in middleware.
    *   Redirect incomplete users to onboarding flow.
    *   Store onboarding completion status in user profile.

---

### 1.4. Subscription and Billing Management

*   **Objective:** Implement subscription management with credit card processing and billing history.
*   **Billing Routes:**
    *   `/billing` - Main billing dashboard showing current plan and usage.
    *   `/billing/subscribe` - Subscription upgrade page with plan selection.
    *   `/billing/payment` - Credit card setup and payment method management.
    *   `/billing/history` - Billing history and invoice downloads.
*   **Payment Integration:**
    *   Integrate with Stripe for secure payment processing.
    *   Support credit card payments for Pro tier subscriptions.
    *   Handle subscription lifecycle (create, update, cancel, renew).
*   **Billing Features:**
    *   View current subscription status and next billing date.
    *   Upgrade/downgrade between tiers.
    *   Update payment methods and billing information.
    *   Download invoices and payment receipts.
    *   Cancel subscription with confirmation flow.
    *   Proration handling for mid-cycle changes.
*   **Data Model:**
    *   Add subscription-related fields to user profile:
        *   `stripe_customer_id`: TEXT
        *   `subscription_id`: TEXT
        *   `subscription_status`: TEXT (`active`, `canceled`, `past_due`)
        *   `current_period_start`: TIMESTAMP
        *   `current_period_end`: TIMESTAMP
        *   `cancel_at_period_end`: BOOLEAN
        *   `available_credits`: DECIMAL, default 0 (for Phase 4 referral system)

---

### 1.5. QR Code Scanning for MFA Setup

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

### 1.6. Enhanced Sharing: Share Status Management

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
    *   SQL script to add `user_tier` to users (role will be added in Phase 3).
    *   SQL script to add subscription and billing fields to user profiles.
    *   SQL script to add onboarding completion tracking (`onboarding_completed`, `profile_setup_completed`).
    *   SQL script to add `available_credits` field for future referral system (Phase 4).
    *   SQL script to create the new `shared_links` table and migrate existing sharing data if necessary.
    *   SQL script to create the `usage_tracking` table for monitoring share limits.
    *   SQL script to create the `leads` table for lead capture.
    *   SQL script to create `billing_events` table for subscription history tracking.
2.  **API Route Updates:**
    *   Modify `/api/share/generate` and `/api/share/validate` to use the new `shared_links` table.
    *   Update `/api/share/generate` to enforce usage limits based on user tier.
    *   Create `/api/shares/[id]/revoke` to update the status of a share.
    *   Create `/api/leads` to capture lead information from the pricing page.
    *   Create `/api/usage/stats` to get current usage statistics for the dashboard.
    *   Create `/api/onboarding/profile` to save user profile information during onboarding (including invitation codes for Phase 4).
    *   Create `/api/onboarding/complete` to mark onboarding as completed.
    *   Create `/api/billing/subscription` for subscription management (create, update, cancel).
    *   Create `/api/billing/payment-methods` for credit card management.
    *   Create `/api/billing/invoices` for billing history and invoice downloads.
    *   Create `/api/billing/portal` for Stripe customer portal integration.
    *   Create `/api/webhooks/stripe` for handling Stripe webhook events.
3.  **React Components & Layouts:**
    *   `PricingPage` component with lead capture forms.
    *   `OnboardingLayout` component - Layout for onboarding flow pages.
    *   `WelcomeStep` component - Welcome screen with app overview.
    *   `ProfileSetupStep` component - Profile configuration form.
    *   `OnboardingComplete` component - Completion screen with upgrade options.
    *   `BillingDashboard` component - Main billing overview and current plan status (with credit display for Phase 4).
    *   `SubscriptionPlans` component - Plan selection and upgrade interface.
    *   `PaymentMethodForm` component - Credit card setup and management.
    *   `BillingHistory` component - Invoice history and download functionality.
    *   Integration of a QR scanner component into the `AddMfaEntry` modal.
    *   `ShareStatusDashboard` component to view and manage active shares.
    *   `UsageStats` component to display current usage limits and statistics.
    *   `LeadCaptureForm` component for newsletter and sales inquiries.
    *   `InvitationCodeInput` component - For invitation code entry during onboarding (Phase 4 preparation).
4.  **User Pages:**
    *   `/pricing` - Public pricing page with lead capture.
    *   `/onboarding/welcome` - Onboarding welcome page.
    *   `/onboarding/profile` - Profile setup page.
    *   `/onboarding/complete` - Onboarding completion page.
    *   `/billing` - Main billing dashboard.
    *   `/billing/subscribe` - Subscription upgrade page.
    *   `/billing/payment` - Payment method management.
    *   `/billing/history` - Billing history page.
5.  **Security & UI Enhancements:**
    *   Update middleware to redirect incomplete onboarding users to onboarding flow.
    *   Create onboarding-specific navigation and progress indicators.
    *   UI warnings and confirmations for revoking shared links.
    *   Usage limit warnings when approaching monthly share limits.
    *   Upgrade prompts for users who have reached their free tier limits.
    *   Secure payment form handling with Stripe Elements.
    *   Subscription cancellation confirmations and retention flows.
