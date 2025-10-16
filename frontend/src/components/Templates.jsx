import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Templates({ apiUrl }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (apiUrl) {
          const res = await axios.get(`${apiUrl}/api/templates`);
          if (res.data && res.data.status === "ok") {
            if (mounted) setTemplates(res.data.data.templates);
          }
        } else {
          setTemplates([
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
            {
              id: "t3",
              name: "MVP Roadmap",
              desc: "Minimal features and milestones",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load templates", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  if (loading)
    return (
      <div className="bg-white rounded-lg shadow p-6">Loading templates...</div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-2">📚 Templates</h3>
      <p className="text-sm text-gray-500 mb-4">
        Select a template to prefill a plan.
      </p>

      <div className="space-y-3">
        {templates.map((t) => (
          <div
            key={t._id || t.id}
            className="p-3 border rounded bg-gray-50 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-500">
                {t.description || t.desc}
              </div>
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
