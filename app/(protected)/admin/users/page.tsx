import UserManagementTable from '@/components/admin/UserManagementTable'

/**
 * Admin Users Page
 * 
 * Authentication and admin role authorization are handled by parent layouts.
 * This page focuses purely on rendering user management content.
 */
export default function AdminUsersPage() {
  return <UserManagementTable />
}
