import React from "react";

function Button({ children, onClick, type, disabled }) {
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#9aa3b2" : "#1B2A4A",
        color: "white",
        border: "none",
        borderRadius: 6,
        padding: "10px 18px",
        fontSize: 15,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default Button;
