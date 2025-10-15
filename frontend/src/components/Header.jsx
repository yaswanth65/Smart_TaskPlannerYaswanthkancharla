import React from "react";

export default function Header() {
  return (
    <header
      className="py-6 mb-6"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Smart Task Planner- Yaswanth kancharla
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Turn goals into actionable plans
        </p>
      </div>
    </header>
  );
}
