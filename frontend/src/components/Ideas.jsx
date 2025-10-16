import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Ideas({ apiUrl }) {
  const [ideas, setIdeas] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (apiUrl) {
          const res = await axios.get(`${apiUrl}/api/ideas`);
          if (res.data && res.data.status === "ok") {
            if (mounted) setIdeas(res.data.data.ideas.map((i) => i.title));
          }
        } else {
          // Fallback sample ideas
          setIdeas([
            "Break project into weekly milestones",
            "Create a short demo landing page",
            "Record a screen walkthrough with voiceover",
          ]);
        }
      } catch (err) {
        console.error("Failed to load ideas", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [apiUrl]);

  async function addIdea(e) {
    e.preventDefault();
    if (!q.trim()) return;
    try {
      if (apiUrl) {
        await axios.post(`${apiUrl}/api/ideas`, {
          title: q.trim(),
          content: "",
        });
        // reload
        const res = await axios.get(`${apiUrl}/api/ideas`);
        if (res.data && res.data.status === "ok")
          setIdeas(res.data.data.ideas.map((i) => i.title));
      } else {
        setIdeas((s) => [q.trim(), ...s]);
      }
      setQ("");
    } catch (err) {
      console.error("Failed to add idea", err);
    }
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

      {loading ? (
        <div className="text-sm text-gray-500">Loading ideas...</div>
      ) : (
        <ul className="space-y-2">
          {ideas.map((it, i) => (
            <li key={i} className="text-sm p-2 bg-gray-50 rounded">
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
