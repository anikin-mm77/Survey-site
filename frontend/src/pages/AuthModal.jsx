import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthModal() {
  const [sp, setSp] = useSearchParams();
  const initialMode = sp.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from?.pathname || "/";

  useEffect(() => {
    setSp({ mode }, { replace: true });
  }, [mode, setSp]);

  function close() {
    nav("/");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      nav(from, { replace: true });
    } catch (e) {
      setErr(e.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modalOverlay" onClick={close}>
      <div className="authModal" onClick={e => e.stopPropagation()}>
        <button className="modalClose" onClick={close} aria-label="Close">
          ×
        </button>
        <h3 className="authTitle">{mode === "login" ? "Log In" : "Sign Up"}</h3>

        <form onSubmit={onSubmit}>
          {mode === "signup" && (
            <input
              className="inputRound"
              placeholder="Username"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
          <input
            className="inputRound"
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="inputRound"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {err && <div className="authError">{err}</div>}

          {mode === "login" ? (
            <>
              <button type="button" className="btnPill secondary" onClick={() => setMode("signup")}>
                Sign Up
              </button>
              <button type="submit" className="btnPill primary" disabled={submitting}>
                Log In
              </button>
            </>
          ) : (
            <button type="submit" className="btnPill primary" disabled={submitting}>
              Sign Up
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
