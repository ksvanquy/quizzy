# 🚀 QUICK REFERENCE - Monitoring & Logging

## Import Everything
```typescript
import {
  logger,
  PerformanceMonitor,
  MetricsCollector,
  StructuredLogger,
  ErrorTracker,
  HealthChecker,
  MonitoringDashboard,
  withMonitoring
} from '@/lib/monitoring';
```

## Logging

### Simple Logging
```typescript
logger.info('User login', { userId: '123' });
logger.warn('Cache low', { size: 100 });
logger.error('DB failed', error);
```

## Performance Monitoring

### Manual Tracking
```typescript
const { startTime, mark } = PerformanceMonitor.start();
// ... do work ...
mark('operation', 'success');

// Get stats
const stats = PerformanceMonitor.getStats('operation');
console.log(stats.avgDuration); // ms
```

### Automatic Tracking
```typescript
await trackPerformance('operation', async () => {
  return await someWork();
});
```

### Decorator Pattern
```typescript
class UserService {
  @Monitored('user.service.create')
  async create(data: any) {
    // Automatically tracked
  }
}
```

## Metrics

### Record Metrics
```typescript
MetricsCollector.increment('requests');
MetricsCollector.gauge('active_users', 50);
MetricsCollector.recordResponseTime(250);
MetricsCollector.recordError(error);
```

### Get Snapshot
```typescript
const snapshot = MetricsCollector.getSnapshot();
console.log(snapshot.totalRequests);
console.log(snapshot.avgResponseTime);
console.log(snapshot.memoryUsage);
```

## Structured Logging

### Log Events
```typescript
StructuredLogger.logEvent('user.created', {
  userId: '123',
  email: 'user@example.com'
});
```

### Audit Trail
```typescript
StructuredLogger.logAudit(
  'DELETE',           // action
  'admin@example.com', // actor
  'user:456',         // resource
  'success'           // result
);
```

### Log Errors
```typescript
StructuredLogger.logErrorWithContext(
  error,
  'User creation failed',
  { email: user.email },
  requestId
);
```

## Error Tracking

### Initialize
```typescript
ErrorTracker.initialize({ enabled: true });
```

### Report Error
```typescript
const report = ErrorTracker.reportError(error, {
  userId: '123',
  message: 'Operation failed',
  tags: { severity: 'high' }
});

console.log(report.id); // Unique error ID
```

### Get Reports
```typescript
const allErrors = ErrorTracker.getAllReports();
const userErrors = ErrorTracker.getReportsByUser('123');
```

## Health Checking

### Register Checks
```typescript
import {
  HealthChecker,
  createDatabaseHealthCheck,
  createApiHealthCheck
} from '@/lib/health-checker';

HealthChecker.registerCheck('database', createDatabaseHealthCheck());
HealthChecker.registerCheck('api', createApiHealthCheck());
```

### Run Checks
```typescript
const result = await HealthChecker.runHealthChecks();
console.log(result.status); // 'healthy', 'degraded', 'unhealthy'
```

## Monitoring Middleware

### Use with Routes
```typescript
import { withMonitoring } from '@/lib/monitoring-middleware';

export const GET = withMonitoring(async (request: NextRequest) => {
  // Automatically monitored
  return APIResponse.success(data);
});
```

### Manual Middleware
```typescript
import { monitoringMiddleware } from '@/lib/monitoring-middleware';

// In custom handler
return monitoringMiddleware(request, yourHandler);
```

## Monitoring Dashboard

### Get Monitoring Data
```typescript
const data = MonitoringDashboard.getMonitoringData();
console.log(data.summary.healthStatus); // 'good', 'warning', 'critical'
console.log(data.summary.errorRate); // percentage
```

### Get Reports
```typescript
const perfReport = MonitoringDashboard.getPerformanceReport();
const metricsReport = MonitoringDashboard.getMetricsReport();
const errorsReport = MonitoringDashboard.getErrorReport();
```

### Export for Dashboard
```typescript
const exported = MonitoringDashboard.exportForDashboard();
// { timestamp, monitoring, performance, metrics, errors }
```

## API Endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
# Returns: { status, timestamp, checks, version, uptime }

# Kubernetes readiness
curl -I http://localhost:3000/api/health
# Returns: 200 or 503
```

### Monitoring
```bash
# Full monitoring data
curl http://localhost:3000/api/monitoring

# Metrics only
curl http://localhost:3000/api/monitoring/metrics

# Performance stats
curl http://localhost:3000/api/monitoring/performance

# Errors
curl http://localhost:3000/api/monitoring/errors
```

## Environment Variables

```env
# Logging
LOG_LEVEL=info              # debug, info, warn, error
LOG_FORMAT=json             # json or text

# Monitoring
MONITORING_ENABLED=true
ERROR_TRACKING_ENABLED=true
PERFORMANCE_SLOW_THRESHOLD=5000

# Optional
SENTRY_DSN=https://...
```

## Complete Route Example

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withMonitoring } from '@/lib/monitoring-middleware';
import { StructuredLogger } from '@/lib/structured-logger';
import { ErrorTracker } from '@/lib/error-tracker';
import { PerformanceMonitor } from '@/lib/performance-monitor';
import { APIResponse } from '@/lib/api-response';

export const POST = withMonitoring(async (request: NextRequest) => {
  const requestId = request.headers.get('x-request-id') || '';
  const { startTime, mark } = PerformanceMonitor.start();

  try {
    const body = await request.json();

    // Log request
    StructuredLogger.logEvent('operation.started', {
      operation: 'create_user',
      email: body.email
    });

    // Do work
    // const user = await userService.create(body);

    // Log success
    StructuredLogger.logEvent('user.created', {
      userId: 'new-id'
    });

    mark('operation', 'success');
    return APIResponse.success({ id: 'new-id' }, 201);

  } catch (error) {
    mark('operation', 'error');

    // Track error
    ErrorTracker.reportError(error as Error, {
      userId: 'anonymous',
      message: 'User creation failed'
    });

    return APIResponse.error('Creation failed');
  }
});
```

## Best Practices

✅ **Logging**
- Log at service boundaries
- Include request IDs for tracing
- Don't log sensitive data

✅ **Performance**
- Track key operations
- Set baselines for normal performance
- Alert on degradation

✅ **Metrics**
- Track business metrics
- Track technical metrics
- Set alert thresholds

✅ **Errors**
- Report all errors
- Include full context
- Track error trends

✅ **Health Checks**
- Check all dependencies
- Set reasonable timeouts
- Include health in deployment

## Documentation

📚 [MONITORING_LOGGING_GUIDE.md](../MONITORING_LOGGING_GUIDE.md) - Full guide  
📚 [lib/monitoring/README.md](../lib/monitoring/README.md) - Quick start  
📚 [lib/monitoring/examples.ts](../lib/monitoring/examples.ts) - 7 examples  
📚 [PHASE_8_DELIVERABLES.md](../PHASE_8_DELIVERABLES.md) - Phase 8 details  

---

**Version**: 1.0.0  
**Last Updated**: Phase 8  
**Next**: Phase 9 - Client-side Setup
