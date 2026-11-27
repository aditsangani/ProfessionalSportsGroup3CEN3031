import React from "react";

function Card({ title, children, className }) {
  return (
    <section className={["panel", className].filter(Boolean).join(" ")}>
      {title && <h3 className="panel-title">{title}</h3>}
      {children}
    </section>
  );
}

export default Card;
