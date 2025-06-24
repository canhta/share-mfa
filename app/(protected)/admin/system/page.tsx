import { InView } from '@/components/motion-primitives/in-view';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

/**
 * Admin System Page
 *
 * Authentication and admin role authorization are handled by parent layouts.
 * This page focuses purely on rendering system monitoring content.
 */
export default function AdminSystemPage() {
  const systemStatuses = [
    { name: 'API Status', status: 'Operational', color: 'green' },
    { name: 'Database', status: 'Healthy', color: 'green' },
    { name: 'Storage', status: '80% Used', color: 'yellow' },
    { name: 'Cache', status: 'Optimal', color: 'green' },
  ];

  const performanceMetrics = [
    { label: 'Response Time', value: '120ms', color: 'green' },
    { label: 'Uptime', value: '99.9%', color: 'green' },
    { label: 'Error Rate', value: '0.01%', color: 'green' },
    { label: 'Active Users', value: '1,234', color: 'blue' },
  ];

  const resourceUsage = [
    { label: 'CPU Usage', value: 45, color: 'blue' },
    { label: 'Memory Usage', value: 62, color: 'green' },
    { label: 'Storage Usage', value: 80, color: 'yellow' },
  ];

  const systemActions = [
    { label: 'Clear Cache', variant: 'primary' as const },
    { label: 'Restart Services', variant: 'secondary' as const },
    { label: 'Emergency Stop', variant: 'destructive' as const },
  ];

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-400';
      case 'yellow':
        return 'bg-yellow-400';
      case 'red':
        return 'bg-red-400';
      default:
        return 'bg-slate-400';
    }
  };

  const getTextColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'red':
        return 'text-red-600';
      case 'blue':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-600';
      case 'green':
        return 'bg-green-600';
      case 'yellow':
        return 'bg-yellow-600';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-neutral bg-neutral-texture">
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <InView
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            viewOptions={{ once: true }}
          >
            <div>
              <TextEffect per="word" preset="slide" className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                System Health & Monitoring
              </TextEffect>
              <TextEffect per="word" preset="fade-in-blur" delay={0.3} className="text-base text-slate-600">
                Monitor system performance and health metrics.
              </TextEffect>
            </div>
          </InView>

          {/* System Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStatuses.map((status, index) => (
              <InView
                key={status.name}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                viewOptions={{ once: true }}
              >
                <Card className="surface-elevated p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status.color)}`}></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-slate-900">{status.name}</p>
                      <p className={`text-sm ${getTextColor(status.color)}`}>{status.status}</p>
                    </div>
                  </div>
                </Card>
              </InView>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InView
              variants={{
                hidden: { opacity: 0, x: -30, scale: 0.95 },
                visible: { opacity: 1, x: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              viewOptions={{ once: true }}
            >
              <Card className="surface-elevated p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Performance Metrics</h3>
                <div className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.label} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{metric.label}</span>
                      <span className={`text-sm font-medium ${getTextColor(metric.color)}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </InView>

            <InView
              variants={{
                hidden: { opacity: 0, x: 30, scale: 0.95 },
                visible: { opacity: 1, x: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              viewOptions={{ once: true }}
            >
              <Card className="surface-elevated p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Resource Usage</h3>
                <div className="space-y-6">
                  {resourceUsage.map((resource) => (
                    <div key={resource.label}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">{resource.label}</span>
                        <span className="font-medium text-slate-900">{resource.value}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ease-out ${getProgressColor(resource.color)}`}
                          style={{ width: `${resource.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </InView>
          </div>

          {/* System Actions */}
          <InView
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            viewOptions={{ once: true }}
          >
            <Card className="surface-elevated p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">System Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {systemActions.map((action) => (
                  <Button key={action.label} variant={action.variant} className="rounded-xl">
                    {action.label}
                  </Button>
                ))}
              </div>
            </Card>
          </InView>
        </div>
      </div>
    </div>
  );
}
