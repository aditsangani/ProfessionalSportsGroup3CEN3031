import React from "react";

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ margin: 0, color: "#1B2A4A" }}>{title}</h1>
      {subtitle && <p style={{ margin: "4px 0 0 0", color: "#6b7280" }}>{subtitle}</p>}
    </div>
  );
}

export default PageHeader;
