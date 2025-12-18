import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getPopularTopics } from "../api";
import mainIcon from "../icons/main.png";
import profileIcon from "../icons/profile.png";

export default function Sidebar({ selectedTopic, onSelectTopic }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    getPopularTopics(ac.signal)
      .then(t => setTopics(t || []))
      .catch(e => {
        if (e.name !== "AbortError") setError(e);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }

  useEffect(() => load(), []);

  const toggleTopic = t => {
    if (!onSelectTopic) return;
    onSelectTopic(prev => (prev === t ? null : t));
  };

  return (
    <aside className="sidebar">
      <nav className="menu">
        <NavLink to="/" className={({ isActive }) => "menuItem" + (isActive ? " active" : "")}>
          <img src={mainIcon} alt="" className="menuIcon" />
          Home
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => "menuItem" + (isActive ? " active" : "")}
        >
          <img src={profileIcon} alt="" className="menuIcon" />
          Profile
        </NavLink>
      </nav>

      <div className="popular">
        <div className="popularTitle">Popular</div>
        <div className="topicsTitle">Topics</div>

        <ul className="topics">
          <li>
            <button
              className={`topicBtn ${selectedTopic == null ? "active" : ""}`}
              onClick={() => onSelectTopic && onSelectTopic(null)}
            >
              All
            </button>
          </li>

          {loading && (
            <li>
              <span className="topicBtn">Loading…</span>
            </li>
          )}
          {error && (
            <li>
              <button className="topicBtn" onClick={load}>
                Retry
              </button>
            </li>
          )}

          {!loading &&
            !error &&
            topics.map(t => (
              <li key={t}>
                <button
                  className={`topicBtn ${selectedTopic === t ? "active" : ""}`}
                  onClick={() => toggleTopic(t)}
                >
                  {t}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </aside>
  );
}
