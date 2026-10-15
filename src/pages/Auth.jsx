import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { api, HOME } from "../lib";
import { useAuth } from "../auth";

export default function Auth() {
  const [params] = useSearchParams();
  const { user, signIn } = useAuth();
  const [mode, setMode] = useState(params.get("mode") === "register" ? "register" : "login");
  const [role, setRole] = useState(params.get("role") === "HOSPITAL" ? "HOSPITAL" : "USER");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={HOME[user.role]} replace />;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const body = mode === "login" ? { email: f.email, password: f.password } : { ...f, role };
      signIn(await api(`/api/auth/${mode}`, { method: "POST", body }));
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wrap narrow">
      <form className="card" onSubmit={submit}>
        <h1 className="h-md">{mode === "login" ? "Welcome back" : "Create your account"}</h1>

        {mode === "register" && (
          <>
            <div className="roles" role="group" aria-label="Account type">
              <button type="button" aria-pressed={role === "USER"} onClick={() => setRole("USER")}>
                <strong>I'm a person</strong><span>Donate or request blood</span>
              </button>
              <button type="button" aria-pressed={role === "HOSPITAL"} onClick={() => setRole("HOSPITAL")}>
                <strong>I'm a hospital</strong><span>Find donors, raise requests</span>
              </button>
            </div>
            <label>{role === "HOSPITAL" ? "Hospital name" : "Full name"}
              <input required value={f.name} onChange={set("name")} autoComplete="name" />
            </label>
          </>
        )}

        <label>Email
          <input type="email" required value={f.email} onChange={set("email")} autoComplete="email" />
        </label>
        <label>Password
          <input type="password" required minLength={6} value={f.password} onChange={set("password")}
                 autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>

        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>

        <p className="muted switch">
          {mode === "login" ? "New to LifeDrop? " : "Already have an account? "}
          <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </form>
    </section>
  );
}
