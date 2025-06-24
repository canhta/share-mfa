# Phase 6 Requirements: Prisma ORM Integration

This document outlines Phase 6 development, which focuses on a complete migration from the Supabase Data API to Prisma ORM.

---

## 1. Project-Wide Refactoring: Migrating to Prisma

### 1.1. Objective

Fully transition the application's data access layer to Prisma ORM. This will centralize data access, provide compile-time type safety with a generated client, and align with best practices for scalable database management. The `supabase-js` client will be retained solely for authentication and storage-related operations.

### 1.2. Rationale

- **Type Safety:** Prisma Client is fully type-safe, which helps catch data-related errors at build time, not runtime.
- **Developer Experience:** Enjoy auto-completion, intuitive query APIs, and a streamlined workflow for database operations.
- **Performance:** Direct database connections via Prisma can be more performant for complex queries compared to API-based access.
- **Migration Management:** `prisma migrate` provides a robust, version-controlled system for schema evolution.

### 1.3. Key Changes

- All data-fetching logic (e.g., in `lib/data/` files) will be refactored to use Prisma.
- All API routes (`app/api/**/*.ts`) will be updated to use Prisma Client for database operations.
- The Supabase Data API (PostgREST) will be disabled in the Supabase project settings to ensure all data access flows through Prisma.

---

## 2. Deliverables for AI Agent

### 2.1. Initial Setup & Installation

1.  **Install Dependencies:**
    - Add `prisma` as a development dependency.
    - Add `@prisma/client` as a production dependency.
2.  **Initialize Prisma:**
    - Run `npx prisma init` to create the initial `prisma` directory and `schema.prisma` file.

### 2.2. Database & Environment Configuration

1.  **Create Prisma Database User:**
    - Execute the following SQL script in the Supabase SQL Editor to create a dedicated `prisma` role with the necessary permissions. This isolates Prisma's access and improves security.

    ```sql
    -- Create custom user
    create user "prisma" with password 'your_secure_password_here' bypassrls createdb;

    -- Extend prisma's privileges to postgres (necessary to view changes in Dashboard)
    grant "prisma" to "postgres";

    -- Grant it necessary permissions over the relevant schemas (public)
    grant usage on schema public to prisma;
    grant create on schema public to prisma;
    grant all on all tables in schema public to prisma;
    grant all on all routines in schema public to prisma;
    grant all on all sequences in schema public to prisma;

    alter default privileges for role postgres in schema public grant all on tables to prisma;
    alter default privileges for role postgres in schema public grant all on routines to prisma;
    alter default privileges for role postgres in schema public grant all on sequences to prisma;
    ```

2.  **Configure Environment Variables:**
    - Update the `.env` file with the `DATABASE_URL`. Use the **Supavisor connection string** from your Supabase project settings, ensuring it uses the `prisma` user and the password you created.
    - Example for serverless deployments (using transaction mode):
      ```
      DATABASE_URL="postgres://prisma.[YOUR-PROJECT-REF]:[YOUR-PRISMA-PASSWORD]@[AWS-REGION].pooler.supabase.com:6543/postgres"
      ```

### 2.3. Schema Introspection & Client Generation

1.  **Introspect Database:**
    - Run `npx prisma db pull` to connect to your Supabase database and automatically generate the Prisma schema from your existing tables.
2.  **Generate Prisma Client:**
    - Run `npx prisma generate` to create the fully type-safe Prisma Client based on the introspected schema.
3.  **Create Prisma Client Singleton:**
    - Create a file (e.g., `lib/prisma.ts`) to instantiate and export a single instance of the Prisma Client, ensuring efficient connection management.

### 2.4. Code Refactoring

1.  **API Routes:**
    - Systematically refactor all API routes under `app/api/` that perform database operations. Replace all Supabase data queries (e.g., `supabase.from('...').select()`) with their Prisma Client equivalents (e.g., `prisma.mfa_entries.findMany()`).
2.  **Server-Side Data Fetching:**
    - Refactor all server components and data-fetching functions that currently use the Supabase client for data access.
3.  **Preserve Auth Logic:**
    - Ensure that all Supabase client usage for authentication (`supabase.auth.*`) and storage remains untouched. The refactoring is strictly for database CRUD operations.

### 2.5. Establish Migration Workflow

- With the schema now managed by Prisma, establish `prisma migrate` as the standard for all future schema changes. Any new database modifications should be implemented by creating a new migration file with `npx prisma migrate dev`.

### 2.6. Disable Supabase Data API

- As a final step, navigate to your Supabase project's **API Settings** and **disable the PostgREST API**. This enforces that all data access goes through the Prisma ORM, completing the migration.

---

## 3. Success Metrics

- **Code Quality:** All data-access logic is fully type-safe, and the usage of `any` for data models is eliminated.
- **Functionality:** The application is fully functional with no regressions. All features, from MFA sharing to user management and billing, work as expected.
- **Performance:** API response times are benchmarked and are either maintained or improved after the migration.
- **Developer Experience:** Future schema modifications are cleanly managed through `prisma migrate`, improving the development workflow.
