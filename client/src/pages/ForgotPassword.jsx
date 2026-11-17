import React, { useState } from "react";
import { api } from "../api";
import FormField from "../components/FormField";
import FormMessage from "../components/FormMessage";
import Button from "../components/Button";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [link, setLink] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setDone("");
    setLink("");

    if (!email.includes("@")) {
      setError("Please enter your email");
      return;
    }

    try {
      const data = await api("/api/auth/forgot-password", { method: "POST", body: { email: email } });
      setDone(data.message);
      if (data.devResetLink) {
        setLink(data.devResetLink);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <PageHeader title="Forgot your password?" subtitle="We will send you a reset link" />
      <Card>
        <form onSubmit={handleSubmit}>
          <FormMessage text={error} />
          <FormField label="Email" name="email" type="email" value={email} onChange={function (event) { setEmail(event.target.value); }} />
          <Button type="submit">Send reset link</Button>
        </form>
        {done && <p>{done}</p>}
        {link && (
          <p>
            Testing only: <a href={link}>open the reset link</a>
          </p>
        )}
      </Card>
      <p style={{ textAlign: "center" }}>
        <button onClick={function () { onNavigate("login"); }}>Back to log in</button>
      </p>
    </div>
  );
}

export default ForgotPassword;
