import { useEffect, useMemo, useState } from "react";
import { getPosts } from "../api";
import PostCard from "./PostCard.jsx";

function matchesQuery(p, q) {
  if (!q) return true;
  const s = q.toLowerCase();
  if ((p.title || "").toLowerCase().includes(s)) return true;
  if ((p.author || "").toLowerCase().includes(s)) return true;
  if (p.type === "poll" && p.poll && p.poll.questions) {
    return p.poll.questions.some(
      qq =>
        qq.text.toLowerCase().includes(s) || qq.options.some(opt => opt.toLowerCase().includes(s))
    );
  }
  return false;
}
const matchesTopic = (p, topic) => !topic || p.topic === topic;

export default function Feed({ query = "", topic = null }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getPosts()
      .then(data => {
        if (alive) setPosts(data);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(
    () => posts.filter(p => matchesTopic(p, topic) && matchesQuery(p, query.trim())),
    [posts, query, topic]
  );

  return (
    <section className="feed">
      {loading && <div>Loading…</div>}
      {!loading && !filtered.length && <div>Nothing found</div>}
      {!loading && filtered.map(p => <PostCard key={p.id} post={p} />)}
    </section>
  );
}
