import React, { useState } from "react";
import { useAuth, API_URL } from "./context/AuthContext";
import FormField from "./components/FormField";
import FormMessage from "./components/FormMessage";
import Button from "./components/Button";
import Card from "./components/Card";
import PageHeader from "./components/PageHeader";

function LoginForm() {
  const { saveLogin } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerMessage("");

    const foundErrors = {};
    if (!values.email.trim()) {
      foundErrors.email = "Please enter your email";
    }
    if (!values.password) {
      foundErrors.password = "Please enter your password";
    }
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      return;
    }

    const response = await fetch(API_URL + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();

    if (!response.ok) {
      setServerMessage(data.message);
      return;
    }
    saveLogin(data.token, data.user);
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <PageHeader title="Log in" subtitle="Welcome back" />
      <Card>
        <form onSubmit={handleSubmit}>
          <FormMessage text={serverMessage} />
          <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} />
          <FormField label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} />
          <Button type="submit">Log in</Button>
        </form>
      </Card>
    </div>
  );
}

export default LoginForm;
