import React from "react";

function Card({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #d5dae3",
        borderRadius: 8,
        padding: 16,
        background: "white",
        marginBottom: 16,
      }}
    >
      {title && <h3 style={{ margin: "0 0 12px 0", color: "#1B2A4A" }}>{title}</h3>}
      {children}
    </div>
  );
}

export default Card;
