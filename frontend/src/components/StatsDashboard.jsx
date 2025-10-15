import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function StatsDashboard({ apiUrl }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiUrl}/api/stats`);
      if (res.data && res.data.status === "ok") {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const { analytics, costs, cache } = stats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={analytics.summary.totalRequests}
          subtitle="All API calls"
          icon="📊"
        />
        <StatCard
          title="AI Calls"
          value={analytics.summary.totalAICalls}
          subtitle={`${analytics.summary.totalMockResponses} mocked`}
          icon="🤖"
        />
        <StatCard
          title="Cache Hit Rate"
          value={analytics.summary.cacheHitRate}
          subtitle={`${analytics.summary.totalCachedResponses} cached`}
          icon="⚡"
        />
        <StatCard
          title="Success Rate"
          value={analytics.summary.successRate}
          subtitle={`${analytics.summary.totalErrors} errors`}
          icon="✅"
        />
      </div>

      {/* Performance & Costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-lg p-6"
          style={{
            background: "white",
            border: "1px solid rgba(16,24,24,0.04)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span>⏱️</span> Performance
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Latency</span>
              <span className="font-medium">
                {analytics.performance.averageLatency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Tasks/Plan</span>
              <span className="font-medium">
                {analytics.performance.averageTasksPerPlan}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Size</span>
              <span className="font-medium">
                {cache.size}/{cache.maxSize}
              </span>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-6"
          style={{
            background: "white",
            border: "1px solid rgba(16,24,24,0.04)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <span>💰</span> Cost Estimates
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost</span>
              <span className="font-medium text-red-600">
                {costs.estimatedTotalCost}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saved by Cache</span>
              <span className="font-medium text-green-600">
                {costs.estimatedSavedCost}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">{costs.note}</div>
          </div>
        </div>
      </div>

      {/* Parse Status Distribution */}
      <div
        className="rounded-lg p-6"
        style={{ background: "white", border: "1px solid rgba(16,24,24,0.04)" }}
      >
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          AI Response Parse Status
        </h3>
        <div className="flex gap-4">
          {Object.entries(analytics.parseStatus).map(([status, count]) => (
            <div
              key={status}
              className="flex-1 rounded p-3 text-center"
              style={{ background: "#fbfbfb" }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--primary)" }}
              >
                {count}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Requests */}
      <div
        className="rounded-lg p-6"
        style={{ background: "white", border: "1px solid rgba(16,24,24,0.04)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            Recent Activity
          </h3>
          <button
            onClick={loadStats}
            className="text-xs hover:underline"
            style={{ color: "var(--primary)" }}
          >
            Refresh
          </button>
        </div>
        <div className="space-y-2">
          {analytics.recentRequests && analytics.recentRequests.length > 0 ? (
            analytics.recentRequests.map((req, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
              >
                <span className="font-medium capitalize">{req.type}</span>
                <span className="text-gray-600">
                  {new Date(req.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No recent activity</div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleTimeString()} • Auto-refresh every 30s
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-600 mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
