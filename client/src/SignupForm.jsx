import React, { useState } from "react";
import { useAuth, API_URL } from "./context/AuthContext";
import { checkSignup } from "./validate";
import FormField from "./components/FormField";
import FormMessage from "./components/FormMessage";
import Button from "./components/Button";
import Card from "./components/Card";
import PageHeader from "./components/PageHeader";

function SignupForm() {
  const { saveLogin } = useAuth();
  const [values, setValues] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerMessage("");

    const foundErrors = checkSignup(values);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      return;
    }

    const response = await fetch(API_URL + "/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: values.username,
        email: values.email,
        password: values.password,
      }),
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
      <PageHeader title="Create your account" subtitle="Join Dynasty Drafters" />
      <Card>
        <form onSubmit={handleSubmit}>
          <FormMessage text={serverMessage} />
          <FormField label="Username" name="username" value={values.username} onChange={handleChange} error={errors.username} />
          <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} />
          <FormField label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} />
          <FormField label="Confirm password" name="confirm" type="password" value={values.confirm} onChange={handleChange} error={errors.confirm} />
          <Button type="submit">Sign up</Button>
        </form>
      </Card>
    </div>
  );
}

export default SignupForm;
