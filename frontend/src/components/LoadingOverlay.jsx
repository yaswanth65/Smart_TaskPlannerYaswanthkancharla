import React from "react";

export default function LoadingOverlay() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(15,23,23,0.06)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="inline-flex items-center gap-3 bg-white p-4 rounded-lg"
        style={{ boxShadow: "0 10px 30px rgba(15,23,23,0.06)" }}
      >
        <div
          className="w-4 h-4 rounded-full animate-pulse"
          style={{ background: "var(--primary)" }}
        />
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          Generating plan…
        </div>
      </div>
    </div>
  );
}
