import { InView } from "@/components/motion-primitives/in-view";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import Card from "@/components/ui/Card";

/**
 * Admin Analytics Page
 *
 * Authentication and admin role authorization are handled by parent layouts.
 * This page focuses purely on rendering analytics content.
 */
export default function AdminAnalyticsPage() {
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
                Analytics Dashboard
              </TextEffect>
              <TextEffect
                per="word"
                preset="fade-in-blur"
                delay={0.3}
                className="text-base text-slate-600"
              >
                Detailed platform metrics and business intelligence.
              </TextEffect>
            </div>
          </InView>

          <InView
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            viewOptions={{ once: true }}
          >
            <Card className="surface-elevated p-8">
              <div className="text-center py-12">
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
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Detailed charts and analytics dashboard coming soon.
                </p>
                <p className="text-sm text-slate-500">
                  Basic analytics are available in the main dashboard.
                </p>
              </div>
            </Card>
          </InView>

          {/* Placeholder for future analytics components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InView
              variants={{
                hidden: { opacity: 0, x: -30, scale: 0.95 },
                visible: { opacity: 1, x: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              viewOptions={{ once: true }}
            >
              <Card className="surface-elevated p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  User Growth
                </h3>
                <div className="text-center py-8 text-slate-400">
                  Chart placeholder
                </div>
              </Card>
            </InView>

            <InView
              variants={{
                hidden: { opacity: 0, x: 30, scale: 0.95 },
                visible: { opacity: 1, x: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              viewOptions={{ once: true }}
            >
              <Card className="surface-elevated p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Usage Patterns
                </h3>
                <div className="text-center py-8 text-slate-400">
                  Chart placeholder
                </div>
              </Card>
            </InView>
          </div>
        </div>
      </div>
    </div>
  );
}
