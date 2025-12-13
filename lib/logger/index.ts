/**
 * Logger Services Index
 * Central export point for all logger and monitoring services
 */

// Core Logger
export { logger } from './logger';
export type { LogEntry, LogLevel } from './logger';

// Re-export monitoring utilities for convenience
export { PerformanceMonitor, trackPerformance, Monitored } from '@/lib/performance-monitor';
export type { PerformanceMetric, PerformanceStats } from '@/lib/performance-monitor';

export { MetricsCollector, metricsMiddleware } from '@/lib/metrics-collector';
export type { Metric, MetricsSnapshot } from '@/lib/metrics-collector';

export { StructuredLogger } from '@/lib/structured-logger';
export type { StructuredLogEntry } from '@/lib/structured-logger';

export { ErrorTracker, initializeSentry } from '@/lib/error-tracker';
export type { ErrorReport } from '@/lib/error-tracker';

export { HealthChecker, handleHealthCheck, createDatabaseHealthCheck, createApiHealthCheck } from '@/lib/health-checker';
export type { HealthCheckResult, HealthStatus } from '@/lib/health-checker';

export { MonitoringDashboard, handleMonitoringRequest } from '@/lib/monitoring-dashboard';
export type { MonitoringData } from '@/lib/monitoring-dashboard';

export { monitoringMiddleware, withMonitoring } from '@/lib/monitoring-middleware';
