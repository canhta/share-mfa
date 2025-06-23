import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

/**
 * Admin Reports Page
 *
 * Authentication and admin role authorization are handled by parent layouts.
 * This page focuses purely on rendering reports content.
 */
export default function AdminReportsPage() {
  const reportTypes = [
    {
      title: "User Reports",
      description: "Download user activity and registration data",
      icon: (
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      buttonText: "Generate Report",
      buttonVariant: "primary" as const,
    },
    {
      title: "Usage Analytics",
      description: "Export platform usage statistics",
      icon: (
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      buttonText: "Generate Report",
      buttonVariant: "secondary" as const,
    },
    {
      title: "Security Audit",
      description: "Download security and audit logs",
      icon: (
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      buttonText: "Generate Report",
      buttonVariant: "outline" as const,
    },
  ];

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
                Reports & Exports
              </TextEffect>
              <TextEffect
                per="word"
                preset="fade-in-blur"
                delay={0.3}
                className="text-base text-slate-600"
              >
                Generate and download comprehensive reports.
              </TextEffect>
            </div>
          </InView>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reportTypes.map((report, index) => (
              <InView
                key={report.title}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewOptions={{ once: true }}
              >
                <Card
                  hover
                  className="surface-elevated p-6 h-full flex flex-col"
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-xl">
                      {report.icon}
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {report.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Button
                      variant={report.buttonVariant}
                      className="w-full rounded-xl"
                    >
                      {report.buttonText}
                    </Button>
                  </div>
                </Card>
              </InView>
            ))}
          </div>

          {/* Recent Reports */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            viewOptions={{ once: true }}
          >
            <Card className="surface-elevated">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Reports
                </h3>
              </div>
              <div className="px-6 py-12">
                <div className="text-center">
                  <div className="text-slate-400 mb-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-600 mb-2">
                    No reports generated yet.
                  </p>
                  <p className="text-sm text-slate-500">
                    Use the options above to generate your first report.
                  </p>
                </div>
              </div>
            </Card>
          </InView>
        </div>
      </div>
    </div>
  );
}
