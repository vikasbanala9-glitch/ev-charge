import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(url, body);
      login(data);
      navigate(data.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>{mode === "login" ? "Log in" : "Create your account"}</h1>
      <form onSubmit={submit}>
        {mode === "register" && (
          <label>Full name<input value={form.name} onChange={set("name")} required /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={set("email")} required /></label>
        <label>Password<input type="password" value={form.password} onChange={set("password")} minLength={6} required /></label>
        {error && <p className="msg error">{error}</p>}
        <button className="btn primary" disabled={busy}>
          {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <p className="muted">
        {mode === "login" ? "New here?" : "Already registered?"}{" "}
        <button className="link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Create an account" : "Log in"}
        </button>
      </p>
      <p className="hint">Demo: user@ev.com / user123 &nbsp;|&nbsp; admin@ev.com / admin123</p>
    </div>
  );
}
