/**
 * Monitoring & Logging Utilities Index
 * Export all monitoring and logging utilities
 */

// Logger
export { logger } from '@/lib/logger/logger';
export type { LogEntry, LogLevel } from '@/lib/logger/logger';

// Performance Monitoring
export {
  PerformanceMonitor,
  trackPerformance,
  Monitored,
  type PerformanceMetric,
  type PerformanceStats,
} from '@/lib/performance-monitor';

// Metrics Collection
export {
  MetricsCollector,
  metricsMiddleware,
  type Metric,
  type MetricsSnapshot,
} from '@/lib/metrics-collector';

// Structured Logging
export {
  StructuredLogger,
  type StructuredLogEntry,
} from '@/lib/structured-logger';

// Error Tracking
export {
  ErrorTracker,
  initializeSentry,
  type ErrorReport,
} from '@/lib/error-tracker';

// Health Checking
export {
  HealthChecker,
  handleHealthCheck,
  createDatabaseHealthCheck,
  createApiHealthCheck,
  type HealthCheckResult,
  type HealthStatus,
} from '@/lib/health-checker';

// Monitoring Dashboard
export {
  MonitoringDashboard,
  handleMonitoringRequest,
  type MonitoringData,
} from '@/lib/monitoring-dashboard';

// Monitoring Middleware
export {
  monitoringMiddleware,
  withMonitoring,
} from '@/lib/monitoring-middleware';
