import React from "react";

// shows a message from the server above the form (like "that email already has an account")
function FormMessage({ text }) {
  if (!text) {
    return null;
  }
  return (
    <div
      style={{
        background: "#fdecea",
        color: "#c0392b",
        padding: 10,
        borderRadius: 6,
        marginBottom: 14,
      }}
    >
      {text}
    </div>
  );
}

export default FormMessage;
