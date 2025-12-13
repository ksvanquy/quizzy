# 📊 MONITORING & LOGGING GUIDE

## Overview
Phase 8 implements comprehensive monitoring, logging, and observability infrastructure for the Quizzy application.

## Architecture

### 1. **Logger Service** (`lib/logger/logger.ts`)
- Structured logging with levels: DEBUG, INFO, WARN, ERROR
- Request/response logging
- Error tracking with context
- Contextual information (userId, requestId, etc.)

### 2. **Performance Monitoring** (`lib/performance-monitor.ts`)
- Track operation execution times
- Calculate performance statistics (avg, min, max, success rate)
- Identify slow operations (>5s)
- Performance decorator for automatic tracking

### 3. **Metrics Collection** (`lib/metrics-collector.ts`)
- Counter metrics (requests, errors)
- Gauge metrics (response times, memory)
- Response time tracking
- Memory usage monitoring
- HTTP status code tracking

### 4. **Structured Logging** (`lib/structured-logger.ts`)
- JSON formatted logs for aggregation tools
- Request context tracking
- Audit trail logging
- Event logging
- Performance logging
- Error logging with full context

### 5. **Error Tracking** (`lib/error-tracker.ts`)
- Error reporting and tracking
- External service integration (Sentry)
- Error grouping and analysis
- Fatal error handling

### 6. **Health Checking** (`lib/health-checker.ts`)
- Service health checks
- Dependency status monitoring
- Response time tracking
- Overall system health status

### 7. **Monitoring Dashboard** (`lib/monitoring-dashboard.ts`)
- Aggregate monitoring data
- Performance reports
- Metrics reports
- Error reports
- Health summary

### 8. **Monitoring Middleware** (`lib/monitoring-middleware.ts`)
- Automatic request/response tracking
- Request ID generation
- Performance measurement
- Response headers with metrics

## Usage Examples

### Basic Logging
```typescript
import { logger } from '@/lib/logger/logger';

logger.info('Operation started', { userId: '123' });
logger.warn('Slow query detected', { duration: 5000 });
logger.error('Database connection failed', error);
```

### Performance Monitoring
```typescript
import { PerformanceMonitor, trackPerformance } from '@/lib/performance-monitor';

// Manual tracking
const { startTime, mark } = PerformanceMonitor.start();
// ... do work ...
mark('database_query', 'success');

// Automatic tracking
await trackPerformance('api_call', async () => {
  return await fetch('...');
});

// Get statistics
const stats = PerformanceMonitor.getStats('database_query');
console.log(stats.avgDuration);
```

### Metrics Collection
```typescript
import { MetricsCollector } from '@/lib/metrics-collector';

// Record metrics
MetricsCollector.increment('user.registrations');
MetricsCollector.gauge('active_users', 150);
MetricsCollector.recordResponseTime(250);

// Get snapshot
const snapshot = MetricsCollector.getSnapshot();
console.log(snapshot.totalRequests);

// Report metrics
MetricsCollector.report();
```

### Structured Logging
```typescript
import { StructuredLogger } from '@/lib/structured-logger';

// Log request
StructuredLogger.logRequest('GET', '/api/users', requestId, userId);

// Log response
StructuredLogger.logResponse(requestId, 200, 125);

// Log event
StructuredLogger.logEvent('user.created', { userId: '123' }, requestId);

// Log error
StructuredLogger.logErrorWithContext(
  error,
  'User registration failed',
  { email: user.email }
);

// Log audit trail
StructuredLogger.logAudit('DELETE', 'user_123', 'user', 'success');
```

### Error Tracking
```typescript
import { ErrorTracker } from '@/lib/error-tracker';

// Initialize
ErrorTracker.initialize({ enabled: true });

// Report error
const report = ErrorTracker.reportError(error, {
  message: 'Failed to fetch user',
  userId: '123',
  tags: { severity: 'high' }
});

// Get reports
const reports = ErrorTracker.getAllReports();
const userErrors = ErrorTracker.getReportsByUser('123');
```

### Health Checking
```typescript
import { HealthChecker, createDatabaseHealthCheck } from '@/lib/health-checker';

// Register checks
HealthChecker.registerCheck('database', createDatabaseHealthCheck());

// Run checks
const result = await HealthChecker.runHealthChecks();
console.log(result.status); // 'healthy', 'degraded', 'unhealthy'
```

### Monitoring Dashboard
```typescript
import { MonitoringDashboard } from '@/lib/monitoring-dashboard';

// Get monitoring data
const data = MonitoringDashboard.getMonitoringData();

// Get specific reports
const perfReport = MonitoringDashboard.getPerformanceReport();
const metricsReport = MonitoringDashboard.getMetricsReport();
const errorsReport = MonitoringDashboard.getErrorReport();

// Export for external dashboard
const exported = MonitoringDashboard.exportForDashboard();
```

## API Endpoints

### Health Check
```
GET /api/health
HEAD /api/health (for Kubernetes)
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": { "status": "up" },
    "api": { "status": "up" }
  },
  "version": "1.0.0",
  "uptime": 3600000
}
```

### Monitoring
```
GET /api/monitoring                    # Full monitoring data
GET /api/monitoring/metrics            # Metrics snapshot
GET /api/monitoring/performance        # Performance statistics
GET /api/monitoring/errors             # Error report
```

## Configuration

### Environment Variables
```env
# Logging
LOG_LEVEL=info                         # debug, info, warn, error
LOG_FORMAT=json                        # json or text (for log aggregation)

# Monitoring
MONITORING_ENABLED=true
PERFORMANCE_SLOW_THRESHOLD=5000        # ms

# Error Tracking
ERROR_TRACKING_ENABLED=true
SENTRY_DSN=https://...                 # Optional Sentry integration

# Health Check
HEALTH_CHECK_INTERVAL=30000            # ms
```

## Integration Examples

### With Next.js API Routes
```typescript
import { withMonitoring } from '@/lib/monitoring-middleware';

export const GET = withMonitoring(async (request) => {
  // Your handler code
  return NextResponse.json({ data });
});
```

### With Service Layer
```typescript
import { trackPerformance } from '@/lib/performance-monitor';
import { StructuredLogger } from '@/lib/structured-logger';

export async function createUser(data: CreateUserDTO) {
  return trackPerformance('user.creation', async () => {
    try {
      const user = await repository.create(data);
      StructuredLogger.logEvent('user.created', { userId: user.id });
      return user;
    } catch (error) {
      StructuredLogger.logErrorWithContext(error, 'User creation failed');
      throw error;
    }
  });
}
```

### With Authentication
```typescript
import { StructuredLogger } from '@/lib/structured-logger';

export async function login(credentials: LoginDTO) {
  StructuredLogger.logAudit(
    'LOGIN_ATTEMPT',
    credentials.email,
    'auth',
    'success'
  );
}
```

## Monitoring Best Practices

### 1. **Use Request IDs**
- Track requests across multiple services
- Correlate logs from different sources
- Debug distributed issues

### 2. **Log Strategically**
- Log at service boundaries
- Log user actions
- Log errors with context
- Avoid logging sensitive data

### 3. **Monitor Performance**
- Track slow operations
- Set baselines for normal performance
- Alert on degradation

### 4. **Track Metrics**
- Business metrics (conversions, registrations)
- Technical metrics (response times, errors)
- Infrastructure metrics (memory, CPU)

### 5. **Error Handling**
- Report all errors
- Include context
- Track error trends
- Set up alerts

## Alerts & Thresholds

### Recommended Thresholds
```
- Response time P95: >500ms
- Error rate: >1%
- Database connection pool usage: >80%
- Memory usage: >85%
- CPU usage: >70%
```

## External Integrations

### Sentry (Error Tracking)
```typescript
import { initializeSentry } from '@/lib/error-tracker';

initializeSentry();
```

### DataDog (Metrics & APM)
```typescript
import { MetricsCollector } from '@/lib/metrics-collector';

// Metrics will be compatible with DataDog agent
const snapshot = MetricsCollector.getSnapshot();
```

### ELK Stack (Log Aggregation)
```env
LOG_FORMAT=json          # Enable JSON logging
```

## Next Steps
- Phase 9: Client-side Setup
- Phase 10: Integration Tests
- Phase 11: Documentation & Security
