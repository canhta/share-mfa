import UserManagementTable from "@/components/admin/UserManagementTable";
import { InView } from "@/components/motion-primitives/in-view";

/**
 * Admin Users Page
 *
 * Authentication and admin role authorization are handled by parent layouts.
 * This page focuses purely on rendering user management content.
 */
export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture">
      <InView
        variants={{
          hidden: { opacity: 0, y: 20, scale: 0.95 },
          visible: { opacity: 1, y: 0, scale: 1 },
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewOptions={{ once: true }}
      >
        <UserManagementTable />
      </InView>
    </div>
  );
}
