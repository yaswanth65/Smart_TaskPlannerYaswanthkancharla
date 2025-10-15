import React, { useState } from "react";

export default function Ideas() {
  const [ideas, setIdeas] = useState([
    "Break project into weekly milestones",
    "Create a short demo landing page",
    "Record a screen walkthrough with voiceover",
  ]);
  const [q, setQ] = useState("");

  function addIdea(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setIdeas((s) => [q.trim(), ...s]);
    setQ("");
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-2">💡 Idea Brainstorm</h3>
      <p className="text-sm text-gray-500 mb-4">
        Jot down quick ideas to include in your prototype video.
      </p>

      <form onSubmit={addIdea} className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Add a new idea..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-indigo-600 text-white rounded"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {ideas.map((it, i) => (
          <li key={i} className="text-sm p-2 bg-gray-50 rounded">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
