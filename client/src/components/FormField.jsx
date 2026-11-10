import React from "react";

// a label, an input box, and an error message under it
function FormField({ label, name, type, value, onChange, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={name} style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type || "text"}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 15,
          boxSizing: "border-box",
          border: error ? "1px solid #c0392b" : "1px solid #b8c0cc",
          borderRadius: 6,
        }}
      />
      {error && <div style={{ color: "#c0392b", fontSize: 13, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export default FormField;
