import React from "react";

function Button({ children, onClick, type, disabled, variant, className }) {
  const classes = ["button", variant === "secondary" ? "button-secondary" : "button-primary", className].filter(Boolean).join(" ");

  return (
    <button className={classes} type={type || "button"} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
