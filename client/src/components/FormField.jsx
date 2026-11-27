import React from "react";

function FormField({ label, name, type, value, onChange, error, placeholder }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type || "text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? name + "-error" : undefined}
      />
      {error && <p id={name + "-error"} className="field-error">{error}</p>}
    </div>
  );
}

export default FormField;
