import Poll from "./Poll.jsx";
import Reactions from "./Reactions.jsx";
import { truncate } from "../utils/Text";

export default function PostCard({ post }) {
  return (
    <article className="post">
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

      <Reactions likes={post.likes} comments={post.comments} postId={post.id} />
    </article>
  );
}
