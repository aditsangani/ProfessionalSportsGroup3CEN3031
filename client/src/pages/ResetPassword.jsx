import React, { useState } from "react";
import { api } from "../api";
import FormField from "../components/FormField";
import FormMessage from "../components/FormMessage";
import Button from "../components/Button";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";

function ResetPassword({ token, onNavigate }) {
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [done, setDone] = useState(false);

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerMessage("");

    const foundErrors = {};
    if (values.password.length < 8) {
      foundErrors.password = "Password must be at least 8 characters";
    }
    if (values.confirm !== values.password) {
      foundErrors.confirm = "Passwords do not match";
    }
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      return;
    }

    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: { token: token, password: values.password },
      });
      setDone(true);
    } catch (err) {
      setServerMessage(err.message);
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 400, margin: "40px auto" }}>
        <PageHeader title="Password updated" subtitle="You can log in with your new password" />
        <Button onClick={function () { onNavigate("login"); }}>Go to log in</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <PageHeader title="Choose a new password" />
      <Card>
        <form onSubmit={handleSubmit}>
          <FormMessage text={serverMessage} />
          <FormField label="New password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} />
          <FormField label="Confirm password" name="confirm" type="password" value={values.confirm} onChange={handleChange} error={errors.confirm} />
          <Button type="submit">Update password</Button>
        </form>
      </Card>
    </div>
  );
}

export default ResetPassword;
