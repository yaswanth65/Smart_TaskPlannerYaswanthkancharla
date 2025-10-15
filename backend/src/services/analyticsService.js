/**
 * Analytics service for tracking API usage, costs, and performance
 */

class AnalyticsService {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      totalAICalls: 0,
      totalCachedResponses: 0,
      totalMockResponses: 0,
      totalErrors: 0,
      totalLatency: 0,
      parseStatusCounts: {
        json: 0,
        text: 0,
        mock: 0
      },
      statusCodes: {},
      requestsByHour: {},
      averageTasksPerPlan: 0,
      totalPlansGenerated: 0
    };

    this.recentRequests = []; // Keep last 100 requests
    this.maxRecentRequests = 100;
  }

  recordRequest(data) {
    this.metrics.totalRequests++;
    
    const hour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    this.metrics.requestsByHour[hour] = (this.metrics.requestsByHour[hour] || 0) + 1;

    // Add to recent requests
    this.recentRequests.unshift({
      timestamp: new Date().toISOString(),
      ...data
    });

    if (this.recentRequests.length > this.maxRecentRequests) {
      this.recentRequests.pop();
    }
  }

  recordAICall(parseStatus, latency, tasksCount, cached = false) {
    if (cached) {
      this.metrics.totalCachedResponses++;
    } else {
      this.metrics.totalAICalls++;
    }

    if (parseStatus) {
      this.metrics.parseStatusCounts[parseStatus] = 
        (this.metrics.parseStatusCounts[parseStatus] || 0) + 1;
    }

    if (parseStatus === 'mock') {
      this.metrics.totalMockResponses++;
    }

    if (latency) {
      this.metrics.totalLatency += latency;
    }

    if (tasksCount) {
      const prevTotal = this.metrics.averageTasksPerPlan * this.metrics.totalPlansGenerated;
      this.metrics.totalPlansGenerated++;
      this.metrics.averageTasksPerPlan = (prevTotal + tasksCount) / this.metrics.totalPlansGenerated;
    }
  }

  recordError(statusCode, message) {
    this.metrics.totalErrors++;
    this.metrics.statusCodes[statusCode] = (this.metrics.statusCodes[statusCode] || 0) + 1;

    this.recordRequest({
      type: 'error',
      statusCode,
      message
    });
  }

  recordSuccess(statusCode) {
    this.metrics.statusCodes[statusCode] = (this.metrics.statusCodes[statusCode] || 0) + 1;
  }

  getMetrics() {
    const aiCalls = this.metrics.totalAICalls;
    const avgLatency = aiCalls > 0 
      ? Math.round(this.metrics.totalLatency / aiCalls) 
      : 0;

    const successRate = this.metrics.totalRequests > 0
      ? ((this.metrics.totalRequests - this.metrics.totalErrors) / this.metrics.totalRequests * 100).toFixed(2)
      : 100;

    const cacheHitRate = (this.metrics.totalAICalls + this.metrics.totalCachedResponses) > 0
      ? (this.metrics.totalCachedResponses / (this.metrics.totalAICalls + this.metrics.totalCachedResponses) * 100).toFixed(2)
      : 0;

    return {
      summary: {
        totalRequests: this.metrics.totalRequests,
        totalAICalls: this.metrics.totalAICalls,
        totalCachedResponses: this.metrics.totalCachedResponses,
        totalMockResponses: this.metrics.totalMockResponses,
        totalErrors: this.metrics.totalErrors,
        successRate: successRate + '%',
        cacheHitRate: cacheHitRate + '%'
      },
      performance: {
        averageLatency: avgLatency + 'ms',
        totalLatency: this.metrics.totalLatency + 'ms',
        averageTasksPerPlan: this.metrics.averageTasksPerPlan.toFixed(2)
      },
      parseStatus: this.metrics.parseStatusCounts,
      statusCodes: this.metrics.statusCodes,
      requestsByHour: this.metrics.requestsByHour,
      recentRequests: this.recentRequests.slice(0, 10) // Last 10
    };
  }

  // Estimate costs (rough approximation for Gemini)
  estimateCosts() {
    // Rough estimate: ~$0.001 per request for Gemini Flash
    const estimatedCostPerCall = 0.001;
    const totalCost = this.metrics.totalAICalls * estimatedCostPerCall;
    const savedCost = this.metrics.totalCachedResponses * estimatedCostPerCall;

    return {
      estimatedTotalCost: '$' + totalCost.toFixed(4),
      estimatedSavedCost: '$' + savedCost.toFixed(4),
      aiCallsMade: this.metrics.totalAICalls,
      cachedResponsesServed: this.metrics.totalCachedResponses,
      note: 'Cost estimates are approximate and based on typical API pricing'
    };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      totalAICalls: 0,
      totalCachedResponses: 0,
      totalMockResponses: 0,
      totalErrors: 0,
      totalLatency: 0,
      parseStatusCounts: { json: 0, text: 0, mock: 0 },
      statusCodes: {},
      requestsByHour: {},
      averageTasksPerPlan: 0,
      totalPlansGenerated: 0
    };
    this.recentRequests = [];
  }
}

// Singleton instance
const analytics = new AnalyticsService();

module.exports = analytics;
