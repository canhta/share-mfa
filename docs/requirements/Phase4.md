# Phase 4 Requirements: Referral System & Invitation Management

This document outlines Phase 4 development, focusing on a referral system similar to Notion's invitation model, where users can earn subscription credits by inviting new users.

---

## 1. Feature Extensions

### 1.1. Invitation System Overview

*   **Objective:** Create a referral system where existing users can invite new users and earn subscription credits.
*   **Business Model:**
    *   When a user successfully invites someone who registers and completes onboarding, the inviter earns **1 month of subscription credit**.
    *   Credits can be applied to Pro tier subscriptions ($5/month value).
    *   Credits stack and can be used to extend subscription periods.
    *   Free tier users can use credits to access Pro features temporarily.
*   **Key Benefits:**
    *   Viral growth through user referrals
    *   Reduced customer acquisition cost
    *   Increased user engagement and retention
    *   Natural product advocacy

---

### 1.2. Invitation Management Dashboard

*   **Objective:** Provide users with a comprehensive interface to manage their invitations and track referral success.
*   **Route:** `/invitations` or `/dashboard/referrals`
*   **Features:**
    *   **Personal Invitation Code:**
        *   Each user gets a unique, permanent invitation code (e.g., `JOHN2024`, `SARAH_MFA`)
        *   Code is generated automatically upon user registration
        *   Users can regenerate their code if desired
    *   **Invitation Link Generation:**
        *   Generate shareable links with embedded invitation codes
        *   Multiple link formats: `app.com/signup?ref=JOHN2024` or `app.com/join/JOHN2024`
        *   QR code generation for easy mobile sharing
    *   **Invitation Tracking:**
        *   List of all sent invitations with status tracking
        *   Track clicks, registrations, and successful completions
        *   View earned credits and pending credits
    *   **Sharing Tools:**
        *   Copy invitation link to clipboard
        *   Direct email invitation sending
        *   Social media sharing templates
        *   WhatsApp/Telegram quick share

---

### 1.3. User Registration with Invitation Codes

*   **Objective:** Allow new users to enter invitation codes during registration to connect with their inviter.
*   **Registration Flow Updates:**
    *   Add optional "Invitation Code" field in the registration/onboarding process
    *   Support both direct code entry and URL parameter detection
    *   Validate invitation codes in real-time
    *   Show inviter's name/info after successful code validation
*   **Integration Points:**
    *   **Google/SSO Registration:** Check for invitation code in URL parameters
    *   **Onboarding Flow:** Include invitation code step in the profile setup
    *   **Landing Pages:** Support invitation links that pre-fill registration
*   **User Experience:**
    *   Clear messaging about invitation benefits
    *   Visual confirmation when invitation code is accepted
    *   Option to proceed without invitation code

---

### 1.4. Credit System and Management

*   **Objective:** Implement a credit system that tracks and applies referral rewards to user accounts.
*   **Credit Types:**
    *   **Earned Credits:** Credits earned from successful referrals
    *   **Applied Credits:** Credits already used for subscription benefits
    *   **Pending Credits:** Credits from users who registered but haven't completed qualifying actions
*   **Credit Mechanics:**
    *   **Earning Criteria:** New user must complete onboarding and be active for 7 days
    *   **Credit Value:** 1 month Pro subscription credit ($5 value) per successful referral
    *   **Credit Application:** Automatic application to next billing cycle or manual application
    *   **Credit Stacking:** Multiple credits can accumulate and be used over time
*   **Credit Display:**
    *   Credit balance shown in billing dashboard
    *   Clear indication of how credits will be applied
    *   History of earned and used credits
    *   Expiration dates (if applicable)

---

### 1.5. Referral Analytics and Gamification

*   **Objective:** Provide users with insights into their referral performance and gamify the experience.
*   **Analytics Features:**
    *   **Referral Performance:**
        *   Total invitations sent vs. successful conversions
        *   Conversion rate and performance over time
        *   Comparison with platform averages
    *   **Earnings Tracking:**
        *   Total credits earned to date
        *   Monetary value of earned credits
        *   Projection of future savings
*   **Gamification Elements:**
    *   **Referral Milestones:**
        *   Bronze: 1-2 successful referrals
        *   Silver: 3-5 successful referrals
        *   Gold: 6-10 successful referrals
        *   Platinum: 10+ successful referrals
    *   **Bonus Rewards:**
        *   Extra credits for reaching milestones
        *   Special badges and recognition
        *   Early access to new features
    *   **Leaderboards:**
        *   Monthly top referrers (with privacy options)
        *   Friendly competition among users

---

### 1.6. Integration with Existing Systems

*   **Billing Integration:**
    *   Automatic credit application during subscription renewals
    *   Manual credit redemption option in billing dashboard
    *   Credit balance display in all subscription-related interfaces
*   **Notification System:**
    *   Email notifications when credits are earned
    *   In-app notifications for referral milestones
    *   Weekly/monthly referral performance summaries
*   **Support Integration:**
    *   Customer support can view and manage user credits
    *   Ability to manually award or adjust credits
    *   Audit trail for all credit transactions

---

## 2. Data Model Extensions

### 2.1. New Tables

**`user_invitations`:**
*   `id`: UUID, Primary Key
*   `user_id`: UUID, FK to auth.users (inviter)
*   `invitation_code`: TEXT, Unique
*   `is_active`: BOOLEAN, default true
*   `created_at`: TIMESTAMP
*   `updated_at`: TIMESTAMP

**`invitation_usage`:**
*   `id`: UUID, Primary Key
*   `invitation_id`: UUID, FK to user_invitations
*   `invitee_user_id`: UUID, FK to auth.users (invited user)
*   `invitation_code_used`: TEXT
*   `status`: TEXT (`pending`, `completed`, `expired`)
*   `completed_at`: TIMESTAMP, nullable
*   `created_at`: TIMESTAMP

**`user_credits`:**
*   `id`: UUID, Primary Key
*   `user_id`: UUID, FK to auth.users
*   `credit_type`: TEXT (`referral_bonus`, `milestone_bonus`, `manual_adjustment`)
*   `amount`: DECIMAL (credit amount in dollars)
*   `source_invitation_id`: UUID, FK to invitation_usage, nullable
*   `status`: TEXT (`earned`, `applied`, `expired`)
*   `earned_at`: TIMESTAMP
*   `applied_at`: TIMESTAMP, nullable
*   `expires_at`: TIMESTAMP, nullable

### 2.2. Table Updates

**`auth.users` (or profiles table):**
*   Add `referral_count`: INTEGER, default 0
*   Add `total_credits_earned`: DECIMAL, default 0
*   Add `available_credits`: DECIMAL, default 0

---

## 3. Deliverables for AI Agent

1.  **Database Migration:**
    *   SQL script to create `user_invitations` table
    *   SQL script to create `invitation_usage` table  
    *   SQL script to create `user_credits` table
    *   SQL script to add referral-related fields to user profiles
    *   SQL script to create indexes for performance optimization

2.  **API Route Updates:**
    *   Create `/api/invitations` for managing user invitation codes and links
    *   Create `/api/invitations/generate-link` for creating shareable invitation URLs
    *   Create `/api/invitations/validate` for validating invitation codes during registration
    *   Create `/api/invitations/stats` for referral analytics and performance data
    *   Create `/api/credits` for viewing and managing user credits
    *   Create `/api/credits/apply` for manually applying credits to subscriptions
    *   Update `/api/onboarding/complete` to process invitation codes and award credits
    *   Update `/api/billing/subscription` to automatically apply available credits

3.  **React Components & Layouts:**
    *   `InvitationDashboard` component - Main referral management interface
    *   `InvitationCodeDisplay` component - Show and manage personal invitation code
    *   `InvitationLinkGenerator` component - Create and share invitation links
    *   `ReferralStats` component - Display referral performance and analytics
    *   `InvitationList` component - Track sent invitations and their status
    *   `CreditBalance` component - Display available credits and earnings
    *   `CreditHistory` component - Show credit earning and usage history
    *   `InvitationCodeInput` component - For new users to enter invitation codes
    *   `ReferralMilestones` component - Gamification elements and achievements
    *   `SocialShareButtons` component - Easy sharing to social platforms
    *   Update `BillingDashboard` to show credit balance and application options
    *   Update `OnboardingLayout` to include invitation code step

4.  **User Pages:**
    *   `/invitations` - Main invitation management dashboard
    *   `/invitations/analytics` - Detailed referral performance analytics
    *   `/join/[code]` - Landing page for invitation links
    *   Update `/onboarding/profile` to include invitation code input
    *   Update `/billing` to show credit balance and application options

5.  **Email Templates:**
    *   Invitation email template for direct invitations
    *   Credit earned notification email
    *   Milestone achievement notification email
    *   Welcome email for invited users mentioning their inviter

6.  **Security & Business Logic:**
    *   Invitation code validation and fraud prevention
    *   Credit earning qualification rules (e.g., 7-day activity requirement)
    *   Rate limiting for invitation sending
    *   Analytics tracking for referral funnel optimization
    *   Integration with existing billing system for credit application

7.  **Integration Enhancements:**
    *   Update registration flow to handle invitation parameters
    *   Modify billing system to automatically apply credits
    *   Add referral tracking to user analytics
    *   Integration with notification system for credit alerts

---

## 4. Success Metrics

*   **User Acquisition:**
    *   Percentage of new users acquired through referrals
    *   Referral conversion rate (invitations sent vs. successful registrations)
    *   Viral coefficient (how many new users each user brings)

*   **User Engagement:**
    *   Referral participation rate among existing users
    *   Average number of invitations sent per active user
    *   Time to first referral after user registration

*   **Business Impact:**
    *   Reduced customer acquisition cost (CAC)
    *   Increased customer lifetime value through referral activity
    *   Credit redemption rate and impact on subscription renewals

*   **Product Growth:**
    *   Month-over-month growth in referral-driven signups
    *   Quality of referred users (retention and engagement rates)
    *   Impact on overall platform growth metrics
