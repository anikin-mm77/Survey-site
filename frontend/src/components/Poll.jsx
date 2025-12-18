import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPollAnswers, savePollAnswer, getPollStats } from "../api";
import { useRequireAuth } from "../auth/UseRequireAuth";
import previousIcon from "../icons/previous.png";
import nextIcon from "../icons/next.png";

export default function Poll({ poll, postId }) {
  const total = poll?.questions?.length ?? 0;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const { isAuthed, loading: authLoading } = useRequireAuth({ redirect: false });
  const navigate = useNavigate();
  const location = useLocation();

  const q = total ? poll.questions[index] : null;

  useEffect(() => {
    if (!total) return;
    let alive = true;
    setLoading(true);
    getPollAnswers(postId)
      .then(a => {
        if (!alive) return;
        setAnswers(a || {});
        const firstUnanswered = poll.questions.findIndex((_, i) => !(i in (a || {})));
        setIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [postId, total, poll?.questions]);

  useEffect(() => {
    if (!showResults || q == null) return;
    if (stats[index]) return;
    getPollStats(postId, index)
      .then(s => setStats(prev => ({ ...prev, [index]: s })))
      .catch(() => {});
  }, [showResults, index, q, postId, stats]);

  const allAnswered = useMemo(
    () => total > 0 && poll.questions.every((_, i) => answers[i] != null),
    [answers, poll?.questions, total]
  );
  const currentAnswered = answers[index] != null;

  function hasUnansweredBefore(i) {
    for (let k = 0; k < i; k++) if (answers[k] == null) return true;
    return false;
  }

  function ensureAuth() {
    if (authLoading) return false;
    if (!isAuthed) {
      navigate("/login", { state: { from: location } });
      return false;
    }
    return true;
  }

  async function choose(opt) {
    if (!ensureAuth()) return;
    setAnswers(prev => ({ ...prev, [index]: opt }));
    try {
      const saved = await savePollAnswer(postId, index, opt);
      setAnswers(saved);
    } catch (e) {
      setAnswers(prev => {
        const p = { ...prev };
        delete p[index];
        return p;
      });
    }
  }

  function goPrev() {
    setIndex(i => Math.max(0, i - 1));
  }
  function goNext() {
    const t = index + 1;
    if (t >= total) return;
    if (!showResults) {
      if (!currentAnswered || hasUnansweredBefore(t)) return;
    }
    setIndex(t);
  }

  if (!total || !q) return null;

  if (allAnswered && !showResults) {
    return (
      <div className="poll">
        <div className="pollCompleted">
          <div className="pollCompletedMessage">
            <div className="pollCompletedTitle">Survey completed</div>
            <div className="pollCompletedText">You answered all questions. Thank you!</div>
          </div>
          <button className="pill viewAnswersBtn" onClick={() => setShowResults(true)}>
            View answers
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const s = stats[index];
    const counts = s?.counts || {};
    const sum = s?.total || 0;

    return (
      <div className="poll">
        <div className="pollHeader">
          Your answers · {index + 1} of {total}
        </div>
        <div className="pollQuestion">{q.text}</div>

        <ul className="options">
          {q.options.map(o => {
            const chosen = answers[index] === o;
            const pct = sum ? Math.round(((counts[o] || 0) * 100) / sum) : 0;
            return (
              <li key={o}>
                <div className={`option disabled ${chosen ? "chosen" : ""}`} aria-pressed={chosen}>
                  <span className="bullet">{chosen ? "●" : "○"}</span>
                  {o}
                </div>
                <div className="statRow">
                  <div className="statBar">
                    <div className="statFill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="statPct">{pct}%</div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="pollNav">
          <button className="circleBtn" onClick={goPrev} disabled={index === 0}>
            <img src={previousIcon} alt="Previous" className="navIcon" />
          </button>
          <button className="circleBtn" onClick={goNext} disabled={index === total - 1}>
            <img src={nextIcon} alt="Next" className="navIcon" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="poll">
      <div className="pollHeader">
        {index + 1} of {total}
      </div>
      <div className="pollQuestion">{q.text}</div>

      <ul className="options">
        {q.options.map(o => {
          const chosen = answers[index] === o;
          return (
            <li key={o}>
              <button
                className={`option ${chosen ? "chosen" : ""}`}
                onClick={() => choose(o)}
                aria-pressed={chosen}
              >
                <span className="bullet">{chosen ? "●" : "○"}</span>
                {o}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="pollNav">
        <button className="circleBtn" onClick={goPrev} disabled={index === 0}>
          <img src="/icons/previous.png" alt="Previous" className="navIcon" />
        </button>
        <button
          className="circleBtn"
          onClick={goNext}
          disabled={index === total - 1 || !currentAnswered || hasUnansweredBefore(index + 1)}
          title={!currentAnswered ? "Answer the current question" : ""}
        >
          <img src="/icons/next.png" alt="Next" className="navIcon" />
        </button>
      </div>
    </div>
  );
}
