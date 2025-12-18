import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSurvey } from "../api";
import { useRequireAuth } from "../auth/useRequireAuth";
import previousIcon from "../icons/previous.png";
import nextIcon from "../icons/next.png";

function emptyQuestion() {
  return { text: "", options: ["", ""] };
}

export default function CreateSurveyPage() {
  const { isAuthed, loading } = useRequireAuth();
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [qs, setQs] = useState([emptyQuestion()]);
  const [idx, setIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!qs || qs.length === 0) {
      setQs([emptyQuestion()]);
      setIdx(0);
    } else if (idx < 0 || idx >= qs.length) {
      setIdx(0);
    }
  }, [qs, idx]);

  if (loading) return <section className="feed">Loading…</section>;
  if (!isAuthed) return null;

  const q = qs[idx] || emptyQuestion();
  const total = qs.length;

  function updateQuestion(part) {
    setQs(prev => {
      const next = prev.slice();
      next[idx] = { ...next[idx], ...part };
      return next;
    });
  }

  function setOption(optIndex, value) {
    setQs(prev => {
      const next = prev.slice();
      const opts = (next[idx]?.options || []).slice();
      opts[optIndex] = value;
      next[idx] = { ...next[idx], options: opts };
      return next;
    });
  }

  function addAnswer() {
    setQs(prev => {
      const next = prev.slice();
      const opts = (next[idx]?.options || []).slice();
      next[idx] = { ...next[idx], options: [...opts, ""] };
      return next;
    });
  }

  function addQuestion() {
    setQs(prev => [...prev, emptyQuestion()]);
    setIdx(qs.length);
  }

  function canFinish() {
    if (!title.trim()) return false;
    for (const qq of qs) {
      if (!qq.text?.trim()) return false;
      const filled = (qq.options || []).map(o => o.trim()).filter(Boolean);
      if (filled.length < 2) return false;
    }
    return true;
  }

  async function finish() {
    if (!canFinish() || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        topic: topic.trim() || "general",
        questions: qs.map(qq => ({
          text: qq.text.trim(),
          options: (qq.options || []).map(o => o.trim()).filter(Boolean),
        })),
      };
      const res = await createSurvey(payload);
      nav(`/post/${res.id}`);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to create survey");
    } finally {
      setSubmitting(false);
    }
  }

  const disablePrev = idx === 0;
  const disableNext = idx >= total - 1;

  return (
    <section className="feed">
      <div className="post">
        <h3 style={{ textAlign: "center", marginTop: 0 }}>Creating Survey</h3>

        <div style={{ marginBottom: 10 }}>
          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 13, color: "#555" }}>Name:</label>
            <input
              className="inputRound"
              placeholder="Survey title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#555" }}>Topic (optional):</label>
            <input
              className="inputRound"
              placeholder="e.g. marketing"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>
        </div>

        <div className="postBody">
          <div className="pollHeader">
            {idx + 1} of {total}
            <button
              className="pill"
              style={{ float: "right" }}
              onClick={addQuestion}
            >
              + question
            </button>
          </div>

          <div className="pollQuestion">
            <input
              className="inputUnderline"
              placeholder="Type question text..."
              value={q.text}
              onChange={e => updateQuestion({ text: e.target.value })}
            />
          </div>

          <ul className="options">
            {(q.options || []).map((opt, i) => (
              <li key={i}>
                <div className="option optionEdit">
                  <span className="bullet">○</span>
                  <input
                    className="inputUnderline"
                    placeholder={`Answer ${i + 1}`}
                    value={opt}
                    onChange={e => setOption(i, e.target.value)}
                  />
                </div>
              </li>
            ))}
          </ul>

          <button className="pill" onClick={addAnswer}>
            + answer
          </button>

          <div className="pollNav">
            <button className="circleBtn" onClick={() => setIdx(idx - 1)} disabled={disablePrev}>
              <img src={previousIcon} alt="Previous" className="navIcon" />
            </button>
            <button className="circleBtn" onClick={() => setIdx(idx + 1)} disabled={disableNext}>
              <img src={nextIcon} alt="Next" className="navIcon" />
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <button className="pill" onClick={finish} disabled={!canFinish() || submitting}>
            Finish
          </button>
        </div>
      </div>
    </section>
  );
}
