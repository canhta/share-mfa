# Phase 5 Requirements: Username/Password Authentication & Account Management

This document outlines Phase 5 development, focusing on adding traditional email and password-based authentication to complement the existing Google SSO login, powered by Supabase Auth.

---

## 1. Feature Extensions

### 1.1. Email & Password Authentication

- **Objective:** Allow users to sign up, log in, and manage their accounts using a traditional email and password combination. This provides an alternative to social login, catering to a wider range of user preferences.
- **Supabase Configuration:** Enable the "Email" provider in the Supabase Auth settings, including "Enable email confirmations" and "Enable secure email change."

### 1.2. User Sign-Up Flow

- **Objective:** Create a new user registration flow for email and password sign-ups.
- **Route:** `/signup`
- **Workflow:**
  1.  A new user navigates to the sign-up page.
  2.  The user enters their email address and a secure password (with a confirmation field).
  3.  The system validates the password against predefined strength requirements.
  4.  Upon form submission, a new user record is created in Supabase Auth with an unconfirmed status.
  5.  Supabase sends a verification email with a confirmation link to the user's email address.
  6.  The user must click the link in the email to verify their account. The link should redirect them to a confirmation page or directly to the login page.
  7.  The user can then log in with their credentials.

### 1.3. User Sign-In Flow

- **Objective:** Update the existing login page to accommodate email/password authentication.
- **Route:** `/login`
- **Workflow:**
  1.  The login page will now feature two options: "Sign in with Google" and a form for email/password entry.
  2.  Users can enter their registered email and password to log in.
  3.  The page should include a link to the "Forgot Password" flow.

### 1.4. Password Management

- **Objective:** Provide users with self-service password management tools, following Supabase's recommended flows.
- **Features:**
  - **Password Reset (Forgot Password):** A two-step flow for users who have forgotten their password.
    1.  **Request Reset Link:**
        - **Route:** `/forgot-password`
        - A user enters their email address. The application calls `supabase.auth.resetPasswordForEmail()`, specifying a redirect URL to a dedicated password update page.
    2.  **Update Password:**
        - **Route:** `/update-password` (or similar, must match the `redirectTo` URL)
        - The user clicks the secure link in their email and is taken to this page.
        - Here, the user can enter and confirm their new password. The application then calls `supabase.auth.updateUser()` to save the new password.
  - **Change Password (for authenticated users):**
    - **Route:** `/profile/security`
    - A logged-in user can update their password directly from their account settings.
    - The form will only require the new password (and a confirmation), as the user is already authenticated. The application calls `supabase.auth.updateUser()` to perform the update.

### 1.5. Account Linking & Social Provider Management

- **Objective:** Ensure a unified user identity, regardless of the authentication method used.
- **Workflow:**
  - If a user signed up with Google, they should have the option to add a password to their account in their security settings.
  - Supabase Auth inherently handles linking social providers to an email if the email is verified, preventing duplicate accounts for the same user. The UI should gracefully guide users if they try to sign up with an email that's already associated with a Google account (e.g., "An account with this email already exists. Would you like to log in with Google?").

### 1.6. Security Enhancements

- **Password Strength:** Enforce a password policy (e.g., minimum 8 characters, including uppercase, lowercase, numbers, and special characters) on the client and server sides.
- **Rate Limiting:** Implement rate limiting on login and password reset endpoints to protect against brute-force attacks. This is a built-in feature of Supabase Auth.

---

## 2. Data Model Extensions

- No significant changes are required to the custom database tables (`mfa_entries`, `shared_links`, etc.).
- All user identity and authentication data will be managed within Supabase's `auth.users` and related tables. The schema supports multiple identity providers per user out of the box.

---

## 3. Deliverables for AI Agent

1.  **Supabase Configuration:**
    - Instructions to enable the Email authentication provider in the Supabase project dashboard.
    - Customization of email templates (Welcome/Confirmation, Password Reset) in Supabase.

2.  **API Route Updates:**
    - `/api/auth/signup`: Handle new user registration with email and password using `supabase.auth.signUp()`.
    - `/api/auth/signin`: Handle user login with email and password credentials using `supabase.auth.signInWithPassword()`.
    - `/api/auth/password-reset-request`: Handle the initial "forgot password" request using `supabase.auth.resetPasswordForEmail()`.
    - `/api/auth/update-password`: A single endpoint to handle updating a user's password using `supabase.auth.updateUser()`. This will be used by both the "Change Password" form for logged-in users and the "Update Password" page from the password reset flow.
    - Update `/api/auth/user` to work seamlessly for users logged in via any method.

3.  **React Components & Layouts:**
    - `SignUpForm` component for the registration page.
    - `SignInForm` component to be added to the existing login page.
    - `ForgotPasswordForm` component for the password reset request page.
    - `ResetPasswordForm` component for setting a new password.
    - `ChangePasswordForm` component to be integrated into the user's profile/security page.
    - Update the main `Login` page component to display both Google SSO and email/password form options.

4.  **User Pages:**
    - `/signup`: New page to host the `SignUpForm`.
    - `/login`: Update the existing page to include the `SignInForm`.
    - `/forgot-password`: New page for password reset requests.
    - `/update-password`: New page (likely with a token in the URL) for users to enter their new password, matching the `redirectTo` URL.
    - Update `/profile/security` page to include the `ChangePasswordForm`.

5.  **Email Templates (via Supabase UI):**
    - Customize the "Confirm signup" email template.
    - Customize the "Reset password" email template.
    - Customize the "Change email address" template.

6.  **Security & UI Enhancements:**
    - Implement client-side and server-side password validation logic.
    - Add clear error messages for authentication failures (e.g., "Invalid credentials," "Email not verified").
    - Provide user feedback during async operations (e.g., loading spinners on forms).
    - Ensure all new pages are responsive and follow the established UI/UX guidelines.

---

## 4. Success Metrics

- **User Adoption:**
  - Track the ratio of sign-ups via email/password versus Google SSO.
  - Monitor the number of existing SSO users who add a password to their account.
- **Usability:**
  - Track the success rate of the password reset flow.
  - Monitor support requests related to login or password issues.
- **Security:**
  - Monitor for brute-force attempts or other authentication-related attacks (via Supabase logs).
