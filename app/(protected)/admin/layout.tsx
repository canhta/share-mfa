import { ReactNode } from 'react';

import ProtectedAdminLayout from '@/components/admin/ProtectedAdminLayout';

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin Layout - Handles role-based authorization for admin routes
 *
 * This layout is nested under the (protected) layout and ensures users
 * have admin role before accessing admin-only routes.
 *
 * Uses client-side authentication check via API endpoints.
 */
export default function AdminLayoutComponent({ children }: AdminLayoutProps) {
  return <ProtectedAdminLayout>{children}</ProtectedAdminLayout>;
}
