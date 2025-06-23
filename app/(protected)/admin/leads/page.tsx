import LeadManagementTable from '@/components/admin/LeadManagementTable'

/**
 * Admin Leads Page
 * 
 * Authentication and admin role authorization are handled by parent layouts.
 * This page focuses purely on rendering lead management content.
 */
export default function AdminLeadsPage() {
  return <LeadManagementTable />
}
