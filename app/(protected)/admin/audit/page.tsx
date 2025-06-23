import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormInput from "@/components/ui/FormInput";
import Select from "@/components/ui/Select";

/**
 * Admin Audit Page
 *
 * Authentication and admin role authorization are handled by parent layouts.
 * This page focuses purely on rendering audit logs content.
 */
export default function AdminAuditPage() {
  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture">
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewOptions={{ once: true }}
          >
            <div>
              <TextEffect
                per="word"
                preset="slide"
                className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2"
              >
                Audit Logs
              </TextEffect>
              <TextEffect
                per="word"
                preset="fade-in-blur"
                delay={0.3}
                className="text-base text-slate-600"
              >
                View and search through system audit logs and user activities.
              </TextEffect>
            </div>
          </InView>

          {/* Filters */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            viewOptions={{ once: true }}
          >
            <Card className="surface-elevated p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormInput
                  id="audit-date-range"
                  label="Date Range"
                  type="date"
                  className="focus-ring-neutral"
                />
                <Select
                  id="audit-action-type"
                  label="Action Type"
                  options={[
                    { value: "all", label: "All Actions" },
                    { value: "login", label: "User Login" },
                    { value: "mfa-creation", label: "MFA Creation" },
                    { value: "share-created", label: "Share Created" },
                    { value: "admin-action", label: "Admin Action" },
                  ]}
                  className="focus-ring-neutral"
                />
                <FormInput
                  id="audit-user-search"
                  label="User"
                  type="text"
                  placeholder="Search by user..."
                  className="focus-ring-neutral"
                />
                <div className="flex items-end">
                  <Button variant="primary" className="w-full rounded-xl">
                    Search
                  </Button>
                </div>
              </div>
            </Card>
          </InView>

          {/* Audit Log Table */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewOptions={{ once: true }}
          >
            <Card className="surface-elevated overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-border">
                    {/* Sample audit log entries */}
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        2024-01-15 14:30:25
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        john.doe@example.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        User Login
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        /dashboard
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        192.168.1.100
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Success
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        2024-01-15 14:25:10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        jane.smith@example.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        MFA Created
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        /api/mfa
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        10.0.0.50
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Success
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        2024-01-15 14:20:00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        admin@company.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        Admin Access
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        /admin/users
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        172.16.0.10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Authorized
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        2024-01-15 14:15:45
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        unknown@suspicious.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        Failed Login
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        /login
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        203.0.113.0
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Failed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-surface px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button variant="outline" className="rounded-xl">
                    Previous
                  </Button>
                  <Button variant="outline" className="rounded-xl ml-3">
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">10</span> of{" "}
                      <span className="font-medium">97</span> results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        className="rounded-l-xl border-r-0"
                      >
                        Previous
                      </Button>
                      <Button variant="primary" className="border-r-0">
                        1
                      </Button>
                      <Button variant="outline" className="border-r-0">
                        2
                      </Button>
                      <Button variant="outline" className="border-r-0">
                        3
                      </Button>
                      <Button variant="outline" className="rounded-r-xl">
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </Card>
          </InView>
        </div>
      </div>
    </div>
  );
}
