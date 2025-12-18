import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPostById, getComments, addComment } from "../api";
import Poll from "../components/Poll.jsx";
import Reactions from "../components/Reactions.jsx";
import { truncate } from "../utils/Text.js";
import previousIcon from "../icons/previous.png";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([getPostById(id), getComments(id)]).then(([p, c]) => {
      if (!alive) return;
      setPost(p);
      setComments(c);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (!post) return <section className="feed">Loading…</section>;

  function addCommentHandler(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    addComment(id, t).then(c => {
      setComments(prev => [...prev, c]);
      setText("");
    });
  }

  return (
    <section className="feed">
      <article className="post">
        <button className="backBtn" onClick={() => navigate(-1)}>
          <img src={previousIcon} alt="" className="backIcon" />
          Back
        </button>
        <div className="postMeta">
          <span className="author">{post.author}</span>
          <span className="dot">•</span>
          <span className="time">{post.time}</span>
        </div>

        <h3 className="postTitle" title={post.title}>
          {truncate(post.title, 90)}
        </h3>

        <div className="postBody">
          {post.type === "poll" && <Poll poll={post.poll} postId={post.id} />}
        </div>

        <Reactions likes={post.likes} comments={comments.length} postId={post.id} />
      </article>

      <div className="commentsWrap">
        <h4>Comments ({comments.length})</h4>
        <ul className="comments">
          {comments.map(c => (
            <li key={c.id} className="comment">
              <div className="commentAuthor">{c.author}</div>
              <div className="commentText">{c.text}</div>
            </li>
          ))}
        </ul>

        <form className="commentForm" onSubmit={addCommentHandler}>
          <div className="commentFormRow">
            <textarea
              placeholder="Write a comment..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button type="submit" className="commentSendBtn">
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
