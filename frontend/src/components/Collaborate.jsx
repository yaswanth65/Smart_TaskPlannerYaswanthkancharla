import React, { useState } from "react";

export default function Collaborate() {
  const [emails, setEmails] = useState([
    "alice@example.com",
    "bob@example.com",
  ]);
  const [q, setQ] = useState("");

  function addEmail(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setEmails((s) => [q.trim(), ...s]);
    setQ("");
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-2">🤝 Collaborate</h3>

      <form onSubmit={addEmail} className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Enter email to invite"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          Invite
        </button>
      </form>

      <div className="space-y-2 text-sm">
        {emails.map((em, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div>{em}</div>
            <div className="text-xs text-gray-500">Invited</div>
          </div>
        ))}
      </div>
    </div>
  );
}
