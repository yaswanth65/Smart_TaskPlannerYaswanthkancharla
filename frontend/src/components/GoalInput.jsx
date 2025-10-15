import React, { useState } from "react";

export default function GoalInput({ onSubmit }) {
  const [goal, setGoal] = useState("");
  const [shouldSave, setShouldSave] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();
    if (!goal.trim()) return;
    onSubmit(goal.trim(), shouldSave);
  }

  return (
    <form onSubmit={handleSubmit} className="cozy-card rounded-lg p-6 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Enter your goal
      </label>
      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={3}
        placeholder="e.g. Launch a product in 2 weeks"
        className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2"
      />

      <div className="mt-3 flex items-center gap-2">
        <input
          type="checkbox"
          id="saveCheckbox"
          checked={shouldSave}
          onChange={(e) => setShouldSave(e.target.checked)}
          className="rounded text-primary-600 focus:ring-primary-200"
        />
        <label htmlFor="saveCheckbox" className="text-sm text-gray-700">
          Save plan to history (enables progress tracking)
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 text-white rounded shadow cozy-button"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Generate Plan
        </button>
        <button
          type="button"
          className="px-4 py-2 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          style={{
            backgroundColor: "transparent",
            border: "1px solid rgba(16,24,24,0.04)",
          }}
          onClick={() => setGoal("")}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
