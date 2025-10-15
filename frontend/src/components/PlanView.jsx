import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  exportPlanAsJSON,
  exportPlanAsCSV,
  exportPlanAsMarkdown,
  copyPlanToClipboard,
} from "../utils/exportUtils";

const STATUS_COLORS = {
  todo: "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

function TaskItem({ task, index, onUpdateTask, canEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(task.status || "todo");
  const [progress, setProgress] = useState(task.progress || 0);
  const [notes, setNotes] = useState(task.notes || "");

  const handleSave = () => {
    onUpdateTask(index, { status, progress, notes });
    setIsEditing(false);
  };

  const handleQuickStatus = (newStatus) => {
    const newProgress =
      newStatus === "done" ? 100 : newStatus === "in-progress" ? 50 : 0;
    setStatus(newStatus);
    setProgress(newProgress);
    onUpdateTask(index, { status: newStatus, progress: newProgress, notes });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="p-4 rounded-md transition-shadow"
      style={{ background: "white", border: "1px solid rgba(16,24,24,0.04)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {index + 1}. {task.name}
            </div>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium`}
              style={{
                background:
                  status === "done"
                    ? "rgba(56,161,105,0.12)"
                    : status === "in-progress"
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(111,143,147,0.06)",
                color:
                  status === "done"
                    ? "var(--success-500)"
                    : status === "in-progress"
                    ? "var(--info-500)"
                    : "var(--muted)",
              }}
            >
              {STATUS_LABELS[status]}
            </span>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div>Duration: {task.duration || "—"}</div>
            {task.dependsOn && task.dependsOn.length > 0 && (
              <div>Depends on: {task.dependsOn.join(", ")}</div>
            )}
          </div>

          {/* Progress bar */}
          {canEdit && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #2aa79b, #ff9b66)",
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-10 text-right">
                  {progress}%
                </span>
              </div>
            </div>
          )}

          {notes && (
            <div
              className="mt-2 text-xs italic p-2 rounded"
              style={{ background: "#fbfbfb", color: "var(--muted)" }}
            >
              {notes}
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex flex-col gap-1">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2 py-1 text-xs rounded"
                  style={{ background: "#fbfbfb", color: "var(--muted)" }}
                >
                  Edit
                </button>
                {status !== "done" && (
                  <button
                    onClick={() => handleQuickStatus("done")}
                    className="px-2 py-1 text-xs rounded"
                    style={{
                      background: "rgba(56,161,105,0.12)",
                      color: "var(--success-500)",
                    }}
                  >
                    ✓ Done
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-xs rounded"
                style={{ background: "#fbfbfb", color: "var(--muted)" }}
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit mode */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 space-y-3"
          style={{ borderTop: "1px solid rgba(16,24,24,0.04)" }}
        >
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Progress: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add notes about this task..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm text-white rounded"
            style={{ background: "var(--primary)" }}
          >
            Save Progress
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function PlanView({ plan, onUpdateTask, canEdit, apiUrl }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const completedTasks = plan.tasks.filter((t) => t.status === "done").length;
  const totalTasks = plan.tasks.length;
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-semibold">
            Plan for: <span className="font-normal">{plan.goal}</span>
          </h2>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              📥 Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    exportPlanAsJSON(plan);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  📄 Export as JSON
                </button>
                <button
                  onClick={() => {
                    exportPlanAsCSV(plan);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  📊 Export as CSV
                </button>
                <button
                  onClick={() => {
                    exportPlanAsMarkdown(plan);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  📝 Export as Markdown
                </button>
                <button
                  onClick={() => {
                    copyPlanToClipboard(plan);
                    setShowExportMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 border-t border-gray-200"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Overall Progress:</span>
              <span className="font-semibold text-indigo-600">
                {overallProgress}%
              </span>
            </div>
            <div className="text-gray-500">
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </div>
        )}

        {plan.parseStatus && (
          <div className="mt-2 text-xs text-gray-500">
            AI Response: <span className="font-medium">{plan.parseStatus}</span>
            {plan.aiModel && (
              <span className="ml-2">· Model: {plan.aiModel}</span>
            )}
            {plan.aiLatencyMs && plan.aiLatencyMs > 0 && (
              <span className="ml-2">· {plan.aiLatencyMs}ms</span>
            )}
            {plan.cached && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                ⚡ Cached
              </span>
            )}
          </div>
        )}
      </div>

      {!canEdit && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          💡 Save this plan to track task progress
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {plan.tasks.map((task, index) => (
            <TaskItem
              key={index}
              task={task}
              index={index}
              onUpdateTask={onUpdateTask}
              canEdit={canEdit}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
