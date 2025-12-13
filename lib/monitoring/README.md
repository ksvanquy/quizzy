# Monitoring & Logging Utilities

This directory contains comprehensive monitoring and logging utilities for the Quizzy application.

## Core Utilities

### 1. **Logger** (`lib/logger/logger.ts`)
Structured logging service with support for multiple log levels.

```typescript
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: '123' });
logger.warn('Low cache', { percentage: 20 });
logger.error('Database error', error);
```

### 2. **Performance Monitor** (`lib/performance-monitor.ts`)
Track operation execution times and get performance statistics.

```typescript
import { PerformanceMonitor, trackPerformance } from '@/lib/performance-monitor';

// Manual tracking
const { startTime, mark } = PerformanceMonitor.start();
await performWork();
mark('operation', 'success');

// Automatic tracking
await trackPerformance('operation', () => performWork());

// Get statistics
const stats = PerformanceMonitor.getStats('operation');
```

### 3. **Metrics Collector** (`lib/metrics-collector.ts`)
Collect and aggregate application metrics.

```typescript
import { MetricsCollector } from '@/lib/metrics-collector';

MetricsCollector.increment('requests');
MetricsCollector.gauge('active_users', 150);
MetricsCollector.recordResponseTime(250);

const snapshot = MetricsCollector.getSnapshot();
```

### 4. **Structured Logger** (`lib/structured-logger.ts`)
JSON-formatted logging for integration with log aggregation tools.

```typescript
import { StructuredLogger } from '@/lib/structured-logger';

StructuredLogger.logRequest('GET', '/api/users', requestId, userId);
StructuredLogger.logEvent('user.created', { userId: '123' });
StructuredLogger.logAudit('DELETE', actor, resource, 'success');
```

### 5. **Error Tracker** (`lib/error-tracker.ts`)
Track and report application errors.

```typescript
import { ErrorTracker } from '@/lib/error-tracker';

ErrorTracker.initialize({ enabled: true });
const report = ErrorTracker.reportError(error, { userId: '123' });
```

### 6. **Health Checker** (`lib/health-checker.ts`)
Monitor service health and dependencies.

```typescript
import { HealthChecker } from '@/lib/health-checker';

HealthChecker.registerCheck('database', createDatabaseHealthCheck());
const result = await HealthChecker.runHealthChecks();
```

### 7. **Monitoring Dashboard** (`lib/monitoring-dashboard.ts`)
Aggregate monitoring data for dashboards.

```typescript
import { MonitoringDashboard } from '@/lib/monitoring-dashboard';

const data = MonitoringDashboard.getMonitoringData();
const perfReport = MonitoringDashboard.getPerformanceReport();
```

### 8. **Monitoring Middleware** (`lib/monitoring-middleware.ts`)
Automatic request/response monitoring.

```typescript
import { withMonitoring } from '@/lib/monitoring-middleware';

export const GET = withMonitoring(async (request) => {
  return APIResponse.success(data);
});
```

## API Endpoints

- `GET /api/health` - Service health status
- `HEAD /api/health` - Kubernetes readiness check
- `GET /api/monitoring` - Full monitoring data
- `GET /api/monitoring/metrics` - Metrics snapshot
- `GET /api/monitoring/performance` - Performance statistics
- `GET /api/monitoring/errors` - Error report

## Files

- `index.ts` - Consolidated exports
- `examples.ts` - 7 complete usage examples

## Documentation

See [MONITORING_LOGGING_GUIDE.md](../../MONITORING_LOGGING_GUIDE.md) for comprehensive documentation.

## Quick Start

1. **Enable JSON logging** for log aggregation:
   ```env
   LOG_FORMAT=json
   ```

2. **Add monitoring to routes**:
   ```typescript
   export const GET = withMonitoring(async (request) => {
     return APIResponse.success(data);
   });
   ```

3. **Track performance**:
   ```typescript
   import { trackPerformance } from '@/lib/performance-monitor';
   
   await trackPerformance('operation', () => doWork());
   ```

4. **Report errors**:
   ```typescript
   import { ErrorTracker } from '@/lib/error-tracker';
   
   ErrorTracker.reportError(error, { context: 'data' });
   ```

5. **Check health**:
   ```bash
   curl http://localhost:3000/api/health
   ```

## Configuration

```env
LOG_LEVEL=info                      # debug, info, warn, error
LOG_FORMAT=json                     # json or text
MONITORING_ENABLED=true
ERROR_TRACKING_ENABLED=true
SENTRY_DSN=                         # Optional
PERFORMANCE_SLOW_THRESHOLD=5000     # milliseconds
```

## Best Practices

1. **Use Request IDs** - Correlate logs across services
2. **Log at Boundaries** - Service entry/exit points
3. **Include Context** - User ID, request ID, timing
4. **Monitor Performance** - Track slow operations
5. **Report Errors** - Include full context
6. **Track Metrics** - Business and technical metrics
7. **Set Alerts** - Define thresholds for monitoring
8. **Regular Review** - Check logs and metrics regularly

## Integration

These utilities integrate with:
- ELK Stack (JSON logging)
- Datadog (metrics)
- Sentry (error tracking)
- Prometheus (metrics export)
- CloudWatch (AWS monitoring)
- Any log aggregation service supporting JSON format
