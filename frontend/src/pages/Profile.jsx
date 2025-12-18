import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../api";
import { useRequireAuth } from "../auth/UseRequireAuth";
import PagedList from "../components/PagedList.jsx";

export default function ProfilePage() {
  const { isAuthed, loading } = useRequireAuth();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (loading || !isAuthed) return;
    let alive = true;
    setBusy(true);
    getProfile()
      .then(d => {
        if (alive) setData(d);
      })
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [loading, isAuthed]);

  const createdAll = useMemo(
    () => (data?.created || []).map(s => ({ id: s.id, title: s.title, to: `/post/${s.id}` })),
    [data]
  );
  const passedAll = useMemo(
    () => (data?.passed || []).map(s => ({ id: s.id, title: s.title, to: `/post/${s.id}` })),
    [data]
  );
  const favAll = useMemo(
    () => (data?.favourites || []).map(s => ({ id: s.id, title: s.title, to: `/post/${s.id}` })),
    [data]
  );

  const filter = items => {
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter(it => (it.title || "").toLowerCase().includes(s));
  };

  const created = useMemo(() => filter(createdAll), [createdAll, q]);
  const passed = useMemo(() => filter(passedAll), [passedAll, q]);
  const fav = useMemo(() => filter(favAll), [favAll, q]);

  if (loading || busy) return <section className="feed">Loading…</section>;
  if (!data) return null;

  return (
    <section className="feed">
      <div className="post">
        <h3 style={{ textAlign: "center", marginTop: 0 }}>Profile</h3>

        <div className="profileTop">
          <div className="profilePhoto">Photo</div>
          <div className="profileInfo">
            <div className="chipLine">Username: {data.user.name || "—"}</div>
            <div className="chipLine">E-mail: {data.user.email}</div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "12px 0" }} />

        {/* "Activity" bar on left + general search on right */}
        <div className="activityBar">
          <div className="activityTitle">Activity</div>
          <input
            className="profileSearch"
            placeholder="Search in your surveys…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        {/* Grid: on left two blocks with 5 rows each, on right - 10 rows */}
        <div className="profileGrid">
          <div className="gridCreated">
            <PagedList
              title="Created Surveys"
              items={created}
              rows={5}
              action={
                <Link to="/create" className="btnTiny">
                  Create
                </Link>
              }
            />
          </div>

          <div className="gridPassed">
            <PagedList title="Passed Surveys" items={passed} rows={12} />
          </div>

          <div className="gridFav">
            <PagedList title="Favourite Surveys" items={fav} rows={5} />
          </div>
        </div>
      </div>
    </section>
  );
}
