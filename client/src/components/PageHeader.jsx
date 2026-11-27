import React from "react";

function PageHeader({ title, subtitle, eyebrow }) {
  return (
    <header className="page-header">
      <p className="page-eyebrow">{eyebrow || "LEAGUE MANAGEMENT"}</p>
      <h1>{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
}

export default PageHeader;
