import React from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px",
  zIndex: 1000,
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  width: "100%",
  maxWidth: "860px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid #f1f5f9",
};

const titleStyle = { fontSize: "16px", fontWeight: 700, color: "#0f172a" };

const closeBtnStyle = {
  fontSize: "12px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "6px 10px",
  background: "#fff",
  cursor: "pointer",
};

const bodyStyle = { padding: "16px 20px" };

const itemStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "14px",
  marginBottom: "12px",
  background: "#fff",
};

const itemHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  marginBottom: "6px",
};

const itemNameStyle = { fontSize: "14px", fontWeight: 700, color: "#111827" };

const applyBtnStyle = {
  fontSize: "12px",
  border: "1px solid #111827",
  borderRadius: "8px",
  padding: "6px 10px",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
};

const descStyle = { fontSize: "12px", color: "#374151", marginBottom: "8px" };

const ruleBadge = {
  display: "inline-block",
  fontSize: "11px",
  color: "#111827",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: "999px",
  padding: "4px 8px",
  marginRight: "6px",
  marginBottom: "6px",
};

export default function RecommendationsModal({ open, loading, error, suggestions, summary, onClose, onApply }) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={titleStyle}>Recommended Segments</div>
          <button onClick={onClose} style={closeBtnStyle}>Close</button>
        </div>
        <div style={bodyStyle}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="4" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <span>Fetching recommendations…</span>
              <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            </div>
          )}
          {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
          {!loading && !error && (
            <>
              {Array.isArray(suggestions) && suggestions.length > 0 ? (
                suggestions.map((r, idx) => (
                  <div key={idx} style={itemStyle}>
                    <div style={itemHeaderStyle}>
                      <div style={itemNameStyle}>{r.name}</div>
                      <button style={applyBtnStyle} onClick={() => onApply?.(r)}>Apply</button>
                    </div>
                    {r.description ? <div style={descStyle}>{r.description}</div> : null}
                    <div>
                      {(r.rules || []).map((rule, i) => (
                        <span key={i} style={ruleBadge}>
                          {rule.field} {rule.operator} {rule.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div>No suggestions available.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


