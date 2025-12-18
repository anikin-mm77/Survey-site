import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserPostState, toggleLike, toggleSave } from "../api";
import { useRequireAuth } from "../auth/UseRequireAuth";
import likeIcon from "../icons/like.png";
import messageIcon from "../icons/message.png";
import savedIcon from "../icons/saved.png";
import shareIcon from "../icons/share.png";

export default function Reactions({ likes, comments, postId }) {
  const [likeCnt, setLikeCnt] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(null);

  const { isAuthed, loading: authLoading } = useRequireAuth({ redirect: false });
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    getUserPostState(postId).then(s => {
      if (!alive) return;
      setIsLiked(!!s.liked);
      setIsSaved(!!s.saved);
    });
    return () => {
      alive = false;
    };
  }, [postId]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function ensureAuth() {
    if (authLoading) return false;
    if (!isAuthed) {
      navigate("/login", { state: { from: location } });
      return false;
    }
    return true;
  }

  async function onLike() {
    if (!ensureAuth() || pending) return;
    const next = !isLiked;
    setIsLiked(next);
    setLikeCnt(c => c + (next ? 1 : -1));
    setPending(true);
    try {
      const res = await toggleLike(postId, next);
      if (typeof res?.likes === "number") setLikeCnt(res.likes);
    } finally {
      setPending(false);
    }
  }

  async function onSave() {
    if (!ensureAuth()) return;
    const next = !isSaved;
    setIsSaved(next);
    try {
      await toggleSave(postId, next);
    } catch {}
  }

  async function onShare() {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      console.error("Copy failed", e);
    }
  }

  return (
    <div className="reactions">
      <button
        className={`pill ${isLiked ? "active" : ""}`}
        aria-pressed={isLiked}
        onClick={onLike}
        disabled={pending}
      >
        <img src={likeIcon} alt="Like" className="reactionIcon" />
        {likeCnt.toLocaleString()}
      </button>

      <button className="pill" onClick={() => navigate(`/post/${postId}`)}>
        <img src={messageIcon} alt="Comments" className="reactionIcon" />
        {comments.toLocaleString()}
      </button>

      <button className={`pill ${isSaved ? "active" : ""}`} onClick={onSave}>
        <img src={savedIcon} alt="Save" className="reactionIcon" />
      </button>

      <div className="spacer" />

      <button className={`pill ${copied ? "copied" : ""}`} onClick={onShare} aria-live="polite">
        <img src={shareIcon} alt="Share" className="reactionIcon" />
        {copied ? "Copied" : "Share"}
      </button>
    </div>
  );
}
