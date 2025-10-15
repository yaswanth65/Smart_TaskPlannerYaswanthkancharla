import React from "react";

const SAMPLE_TEMPLATES = [
  {
    id: "t1",
    name: "Launch Plan (2 months)",
    desc: "High-level launch checklist",
  },
  {
    id: "t2",
    name: "Study Plan (8 weeks)",
    desc: "Break learning goal into weekly tasks",
  },
  { id: "t3", name: "MVP Roadmap", desc: "Minimal features and milestones" },
];

export default function Templates() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-2">📚 Templates</h3>
      <p className="text-sm text-gray-500 mb-4">
        Select a template to prefill a plan.
      </p>

      <div className="space-y-3">
        {SAMPLE_TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="p-3 border rounded bg-gray-50 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </div>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
              Use
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
