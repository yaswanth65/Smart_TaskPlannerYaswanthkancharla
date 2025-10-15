import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "./components/Header";
import GoalInput from "./components/GoalInput";
import PlanView from "./components/PlanView";
import LoadingOverlay from "./components/LoadingOverlay";
import StatsDashboard from "./components/StatsDashboard";
import Ideas from "./components/Ideas";
import Templates from "./components/Templates";
import Collaborate from "./components/Collaborate";

export default function App() {
  const [plan, setPlan] = useState(null);
  const [savedPlanId, setSavedPlanId] = useState(null);
  const [planHistory, setPlanHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("planner"); // 'planner' or 'stats'
  const [userId, setUserId] = useState(() => {
    // Get or create a user ID for this browser
    const stored = localStorage.getItem("userId");
    if (stored) return stored;
    const newId = "user-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("userId", newId);
    return newId;
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Load plan history on mount
  useEffect(() => {
    loadPlanHistory();
  }, []);

  async function loadPlanHistory() {
    try {
      const res = await axios.get(`${API_URL}/api/plans`, {
        params: { userId, limit: 10 },
      });
      if (res.data && res.data.status === "ok") {
        setPlanHistory(res.data.data.plans);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }

  async function handleSubmit(goal, shouldSave = true) {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/generate-plan`, {
        goal,
        save: shouldSave,
        userId: shouldSave ? userId : undefined,
      });

      if (res.data && res.data.status === "ok") {
        setPlan(res.data.data.plan);
        setSavedPlanId(res.data.data.saved?._id || null);

        // Reload history if plan was saved
        if (shouldSave && res.data.data.saved) {
          await loadPlanHistory();
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429) {
        alert("Rate limit exceeded. Please wait a moment and try again.");
      } else {
        alert("Failed to generate plan");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadPlan(planId) {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/plans/${planId}`);
      if (res.data && res.data.status === "ok") {
        setPlan(res.data.data.plan);
        setSavedPlanId(planId);
        setShowHistory(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateTask(taskIndex, updates) {
    if (!savedPlanId) {
      alert("Please save the plan first before updating task progress");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/plans/${savedPlanId}/tasks/${taskIndex}/progress`,
        updates
      );

      if (res.data && res.data.status === "ok") {
        // Update local plan state
        setPlan((prevPlan) => {
          const newPlan = { ...prevPlan };
          newPlan.tasks = [...newPlan.tasks];
          newPlan.tasks[taskIndex] = {
            ...newPlan.tasks[taskIndex],
            ...updates,
          };
          return newPlan;
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  }

  async function handleDeletePlan(planId) {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const res = await axios.delete(`${API_URL}/api/plans/${planId}`);
      if (res.data && res.data.status === "ok") {
        await loadPlanHistory();
        if (savedPlanId === planId) {
          setPlan(null);
          setSavedPlanId(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete plan");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("planner")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "planner"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📝 Planner
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "stats"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab("ideas")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "ideas"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              💡 Ideas
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "templates"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📚 Templates
            </button>
            <button
              onClick={() => setActiveTab("collab")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "collab"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🤝 Collaborate
            </button>
          </div>

          {/* Planner Tab */}
          {activeTab === "planner" && (
            <>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {showHistory ? "Hide History" : "Show History"} (
                  {planHistory.length})
                </button>
                {savedPlanId && (
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Plan saved
                  </div>
                )}
              </div>

              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-lg shadow p-6 mb-6"
                >
                  <h3 className="text-lg font-semibold mb-4">
                    Your Plan History
                  </h3>
                  {planHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm">No saved plans yet</p>
                  ) : (
                    <div className="space-y-2">
                      {planHistory.map((p) => (
                        <div
                          key={p._id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleLoadPlan(p._id)}
                          >
                            <div className="font-medium text-sm">{p.goal}</div>
                            <div className="text-xs text-gray-500">
                              {p.tasks.length} tasks ·{" "}
                              {new Date(p.createdAt).toLocaleDateString()}
                              {p.parseStatus && (
                                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                                  {p.parseStatus}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLoadPlan(p._id)}
                              className="text-indigo-600 text-sm hover:underline"
                            >
                              Load
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlan(p._id);
                              }}
                              className="text-red-600 text-sm hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              <GoalInput onSubmit={handleSubmit} />
              {loading && <LoadingOverlay />}
              {plan && (
                <PlanView
                  plan={plan}
                  onUpdateTask={handleUpdateTask}
                  canEdit={!!savedPlanId}
                  apiUrl={API_URL}
                />
              )}
            </>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && <StatsDashboard apiUrl={API_URL} />}

          {/* Ideas Tab (dummy) */}
          {activeTab === "ideas" && <Ideas />}

          {/* Templates Tab (dummy) */}
          {activeTab === "templates" && <Templates />}

          {/* Collaborate Tab (dummy) */}
          {activeTab === "collab" && <Collaborate />}
        </motion.div>
      </main>
    </div>
  );
}
