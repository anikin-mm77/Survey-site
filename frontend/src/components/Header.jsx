import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Header({ query, onQueryChange }) {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div className="brand">Survey site</div>
      <input
        className="search"
        placeholder="Search polls..."
        aria-label="Search"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
      />
      {user ? (
        <>
          <span style={{ color: "#555" }}>Hi, {user.name || user.email}</span>
          <button className="btn" onClick={logout}>
            Log out
          </button>
        </>
      ) : (
        <button
          className="btn"
          onClick={() => nav("/login?mode=login", { state: { from: location } })}
        >
          Log In
        </button>
      )}
    </header>
  );
}
