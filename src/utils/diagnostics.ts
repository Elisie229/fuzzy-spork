/**
 * Diagnostics utility for debugging application issues
 */

export const diagnostics = {
  /**
   * Check if the application environment is properly configured
   */
  checkEnvironment: () => {
    const checks = {
      localStorage: typeof localStorage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      supabase: true, // Will be checked dynamically
      timestamp: new Date().toISOString(),
    };

    console.log('[Diagnostics] Environment check:', checks);
    return checks;
  },

  /**
   * Check authentication state
   */
  checkAuth: () => {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

    const authState = {
      hasToken: !!accessToken && accessToken !== 'undefined' && accessToken !== 'null',
      hasUserId: !!userId && userId !== 'undefined' && userId !== 'null',
      tokenLength: accessToken?.length || 0,
      timestamp: new Date().toISOString(),
    };

    console.log('[Diagnostics] Auth state:', authState);
    return authState;
  },

  /**
   * Log performance metrics
   */
  logPerformance: (label: string, startTime: number) => {
    const duration = performance.now() - startTime;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  },

  /**
   * Log component lifecycle
   */
  logLifecycle: (component: string, event: string, data?: any) => {
    console.log(`[Lifecycle] ${component} - ${event}`, data || '');
  },

  /**
   * Check for common issues
   */
  runHealthCheck: () => {
    const env = diagnostics.checkEnvironment();
    const auth = diagnostics.checkAuth();

    const issues: string[] = [];

    if (!env.localStorage) {
      issues.push('localStorage is not available');
    }

    if (!env.fetch) {
      issues.push('fetch API is not available');
    }

    if (auth.hasToken && !auth.hasUserId) {
      issues.push('Token exists but no userId - inconsistent state');
    }

    if (!auth.hasToken && auth.hasUserId) {
      issues.push('UserId exists but no token - inconsistent state');
    }

    const health = {
      healthy: issues.length === 0,
      issues,
      environment: env,
      auth,
      timestamp: new Date().toISOString(),
    };

    console.log('[Diagnostics] Health check:', health);
    return health;
  },

  /**
   * Test server connectivity
   */
  testServerConnection: async (baseUrl: string) => {
    console.log('[Diagnostics] Testing server connection to:', baseUrl);
    const startTime = performance.now();
    
    try {
      // Test health endpoint
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const duration = performance.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        console.log('[Diagnostics] Server is healthy:', data, `(${duration.toFixed(2)}ms)`);
        return {
          connected: true,
          status: response.status,
          duration,
          data,
        };
      } else {
        console.error('[Diagnostics] Server returned error:', response.status, response.statusText);
        return {
          connected: false,
          status: response.status,
          duration,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error: any) {
      const duration = performance.now() - startTime;
      console.error('[Diagnostics] Server connection failed:', error);
      return {
        connected: false,
        duration,
        error: error?.message || 'Unknown error',
        errorType: error?.name,
      };
    }
  },
};

// Health check can be run manually if needed:
// import { diagnostics } from './utils/diagnostics';
// diagnostics.runHealthCheck();
