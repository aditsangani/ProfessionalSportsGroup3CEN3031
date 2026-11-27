import React from "react";

function FormMessage({ text }) {
  if (!text) {
    return null;
  }

  return <div className="form-message" role="status">{text}</div>;
}

export default FormMessage;
